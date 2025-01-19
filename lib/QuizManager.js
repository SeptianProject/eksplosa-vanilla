import { ModalManagement } from "./ModalManager.js"

export class QuizSystemManager {
     constructor(apiService) {
          this.apiService = apiService
          this.params = {
               provinceId: this.getUrlParam('provinceId'),
               languageId: this.getUrlParam('languageId'),
               levelId: this.getUrlParam('levelId')
          }

          this.state = {
               levels: [],
               questions: [],
               currentQuestionIndex: 0,
               selectedWords: [],
               score: 0,
               isQuizCompleted: false,
               activeLevel: null
          }

          this.elements = this.initializeElements()
          this.modalManagement = new ModalManagement()
     }

     initializeElements() {
          return {
               levelContainer: document.querySelector('.level-container'),
               levelSession: document.querySelector('.level-session'),
               levelDisplay: document.getElementById('level'),
               questionDisplay: document.getElementById('question'),
               answerContainer: document.querySelector('.flex.flex-wrap.gap-2'),
               optionsContainer: document.querySelector('.flex.flex-wrap.items-center.justify-center.gap-4'),
          }
     }

     getUrlParam(param) {
          return new URLSearchParams(window.location.search).get(param)
     }

     async init() {
          if (!this.params.languageId || !this.params.provinceId) {
               console.error('Required URL parameters missing')
               return
          }

          try {
               await this.fetchInitialData()
               await this.setupInitialLevel()
               this.updateUI()
               this.attachEventListeners()
          } catch (error) {
               console.error('Error initializing quiz system:', error)
          }
     }

     async fetchInitialData() {
          const levels = await this.apiService.getLevels(`filters[bahasa][id]=${this.params.languageId}`)
          this.state.levels = levels.sort((a, b) => a.attributes.level - b.attributes.level)

          if (!this.params.levelId && this.state.levels.length > 0) {
               this.state.activeLevel = this.state.levels[0]
               await this.fetchQuestionsForLevel(this.state.levels[0].id)
          } else if (this.params.levelId) {
               const selectedLevel = this.state.levels.find(level => level.id.toString() === this.params.levelId)
               if (selectedLevel) {
                    this.state.activeLevel = selectedLevel
                    await this.fetchQuestionsForLevel(this.params.levelId)
               }
          }
     }

     async setupInitialLevel() {
          if (!this.state.activeLevel && this.state.levels.length > 0) {
               const firstLevel = this.state.levels[0]
               this.state.activeLevel = firstLevel
               await this.fetchQuestionsForLevel(firstLevel.id)
          }
     }

     async fetchQuestionsForLevel(levelId) {
          const questions = await this.apiService.getQuestions(`filters[level][id]=${levelId}&filters[bahasa][id]=${this.params.languageId}`)
          this.state.questions = questions
          this.state.currentQuestionIndex = 0
          this.state.selectedWords = []
     }

     get currentQuestion() {
          return this.state.questions[this.state.currentQuestionIndex]
     }

     createButton(text, className, dataAttribute) {
          return `
          <button ${dataAttribute} class="${className}">
               ${text}
          </button>
          `
     }

     updateUI() {
          if (this.elements.levelContainer) {
               this.updateLevelUI()
          }
          if (this.currentQuestion) {
               this.updateQuizUI()
          }
     }

     updateLevelUI() {
          if (!this.elements.levelContainer) return

          const renderLevelQuestion = (question, index, isActive = false) => {
               const level = this.state.activeLevel?.attributes
               const displayNumber = index + 1
               const activeClass = isActive ? 'bg-primary text-white' : 'bg-graySurface text-primary'

               return `
               <div class="start-quiz-btn flex items-center gap-x-2 w-fit cursor-pointer">
                    <div class="flex items-center justify-center size-6 rounded-full
                    sm:size-8 lg:size-11 ${activeClass}">
                         <h5 class="text-white text-[9px] md:text-[12px] lg:text-sm font-medium lg:font-semibold">
                         ${displayNumber}${question.attributes.tipe}
                         </h5>
                    </div>
                    <h5 class="text-[10px] sm:text-[12px] lg:text-sm font-medium 
                    max-w-[6.5rem] sm:max-w-[8rem] md:max-w-[10rem] lg:font-semibold lg:max-w-[12rem]">
                         Bagian ${displayNumber}${question.attributes.tipe} - ${level?.Topik || 'Percakapan sehari-hari'}
                    </h5>
               </div>
               `
          }

          const renderLevelSession = (level, index, isActive = false) => {
               const displayNumber = index + 1
               const activeClass = isActive ?
                    'bg-primary text-white' :
                    'bg-blueAccent text-primary hover:bg-primary/30'

               return this.createButton(
                    displayNumber,
                    `${activeClass} size-6 text-[12px] md:text-sm md:size-8 lg:text-base lg:size-10 rounded-md p-1 flex items-center justify-center transition-colors duration-300`,
                    `data-level-id="${level.id}"`
               )
          }

          const dispplayQuestions = this.state.questions.slice(0, 5)
          this.elements.levelContainer.innerHTML = dispplayQuestions
               .map((question, index) => renderLevelQuestion(
                    question,
                    index,
                    question === this.currentQuestion))
               .join('')

          const displayLevels = this.state.levels.slice(0, 4)
          this.elements.levelSession.innerHTML = displayLevels
               .map((level, index) => renderLevelSession(
                    level,
                    index,
                    level.id === this.state.activeLevel?.id))
               .join('')
     }

     updateQuizUI() {
          if (!this.currentQuestion) return

          const question = this.currentQuestion.attributes
          const level = this.state.activeLevel?.attributes

          if (level) {
               const displayNumber = this.state.currentQuestionIndex + 1
               this.elements.levelDisplay.textContent = `#Bagian ${displayNumber}${question.tipe[0]} - ${level.Topik}`
          }

          this.elements.questionDisplay.textContent = question.pertanyaan

          this.elements.answerContainer.innerHTML = this.state.selectedWords
               .map(word => this.createButton(
                    word,
                    'bg-primary text-white text-sm w-24 px-3 py-4 lg:text-base md:w-28 lg:w-36 lg:px-5 lg:py-5 rounded-md font-medium md:font-semibold',
                    `data-reset="${word}"`
               ))
               .join('')

          const unusedOptions = question.jawabans.data
               .map(answer => answer.attributes.kata)
               .filter(option => !this.state.selectedWords.includes(option))

          this.elements.optionsContainer.innerHTML = unusedOptions
               .map(option => this.createButton(
                    option,
                    'bg-primary/20 hover:bg-primary/30 text-primary text-sm w-24 px-3 py-4 lg:text-base md:w-28 lg:w-36 lg:px-5 lg:py-5 rounded-md font-medium md:font-semibold font-poppins transition-colors duration-300',
                    `data-word="${option}"`
               ))
               .join('')
     }

     async moveToNextLevel() {
          const currentLevelIndex = this.state.levels.findIndex(level => level.id === this.state.activeLevel?.id)

          if (currentLevelIndex < this.state.levels.length - 1) {
               const nextLevel = this.state.levels[currentLevelIndex + 1]
               this.state.activeLevel = nextLevel
               await this.fetchQuestionsForLevel(nextLevel.id)
               this.updateUI()
          } else {
               alert('Congratulations! You have completed all levels!')
               this.state.isQuizCompleted = true
          }
     }

     attachEventListeners() {
          if (this.elements.levelSession) {
               this.elements.levelSession.addEventListener('click', async (e) => {
                    const levelId = e.target.dataset.levelId
                    if (levelId) {
                         const selectedLevel = this.state.levels.find(l =>
                              l.id.toString() === levelId
                         )
                         if (selectedLevel) {
                              this.state.activeLevel = selectedLevel
                              await this.fetchQuestionsForLevel(levelId)
                              this.updateUI()
                         }
                    }
               })
          }

          document.addEventListener('click', (e) => {
               const { word, reset } = e.target.dataset
               if (word) this.handleWordSelect(word)
               if (reset) this.handleReset(reset)
          })
     }

     handleWordSelect(word) {
          if (this.state.selectedWords.includes(word)) {
               this.state.selectedWords = this.state.selectedWords.filter(w => w !== word)
          } else {
               const newSelectedWords = [...this.state.selectedWords, word]
               this.state.selectedWords = newSelectedWords

               const correctAnswer = this.currentQuestion.attributes.jawaban_benar.split(' ')
               if (newSelectedWords.length === correctAnswer.length) {
                    this.checkAnswer(newSelectedWords)
               }
          }
          this.updateUI()
     }

     handleReset(word) {
          this.state.selectedWords = this.state.selectedWords.filter(w => w !== word)
          this.updateUI()
     }

     checkAnswer(submittedWords) {
          const isCorrect = submittedWords.join(' ').toLowerCase() ===
               this.currentQuestion.attributes.jawaban_benar.toLowerCase()

          this.modalManagement.showQuizModal(isCorrect ? 'success' : 'failure')

          setTimeout(() => {
               if (isCorrect) {
                    this.state.score++
                    this.nextQuestion()
               } else {
                    this.state.selectedWords = []
                    this.updateUI()
               }
          }, 1500)
     }

     nextQuestion() {
          const nextIndex = this.state.currentQuestionIndex + 1

          if (nextIndex < this.state.questions.length) {
               this.state.currentQuestionIndex = nextIndex
               this.state.selectedWords = []
               this.updateUI()
          } else {
               this.moveToNextLevel()
          }

     }
}