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

          if (this.params.levelId) {
               await this.fetchQuestionsForLevel(this.params.levelId)
          }
     }

     async setupInitialLevel() {
          if (!this.params.levelId && this.state.levels.length > 0) {
               const firstLevel = this.state.levels.find(level =>
                    level.attributes.level === 1
               )
               if (firstLevel) {
                    this.state.activeLevel = firstLevel
                    await this.fetchQuestionsForLevel(firstLevel.id)
               }
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

          const renderLevel = (level, isActive = false) => {
               const activeClass = isActive ? 'bg-primary text-white' : 'bg-primary/20 text-primary'
               return `
               <div class="start-quiz-btn flex items-center gap-x-2 w-fit cursor-pointer">
                    <h5 class="rounded-full size-11 ${activeClass} text-sm font-semibold flex items-center justify-center">
                         ${level.attributes.level}
                    </h5>
                    <h5 class="text-sm font-semibold max-w-[12rem]">
                         ${level.attributes.Topik}
                    </h5>
               </div>
               `
          }

          const renderLevelSession = (level, isActive = false) => {
               const activeClass = isActive ?
                    'bg-primary text-white' :
                    'bg-blueAccent text-primary hover:bg-primary/30'
               return this.createButton(
                    level.attributes.level,
                    `${activeClass} size-10 rounded-md p-1 flex items-center justify-center transition-colors duration-300`,
                    `data-level-id="${level.id}"`
               )
          }

          this.elements.levelContainer.innerHTML = this.state.levels
               .map(level => renderLevel(level, level === this.state.activeLevel))
               .join('') || '<div class="text-center">No levels available for this language yet.</div>'

          this.elements.levelSession.innerHTML = this.state.levels
               .map(level => renderLevelSession(level, level === this.state.activeLevel))
               .join('')
     }

     updateQuizUI() {
          if (!this.currentQuestion) return

          const question = this.currentQuestion.attributes
          const level = this.state.levels.find(level =>
               level.id === (this.params.levelId || this.state.activeLevel?.id)
          )?.attributes

          if (level) {
               this.elements.levelDisplay.textContent = `#${level.level} - ${level.Topik}`
          }

          this.elements.questionDisplay.textContent = question.pertanyaan

          this.elements.answerContainer.innerHTML = this.state.selectedWords
               .map(word => this.createButton(
                    word,
                    'bg-primary text-white w-32 py-4 rounded-md font-semibold',
                    `data-reset="${word}"`
               ))
               .join('')

          const unusedOptions = question.jawabans.data
               .map(answer => answer.attributes.kata)
               .filter(option => !this.state.selectedWords.includes(option))

          this.elements.optionsContainer.innerHTML = unusedOptions
               .map(option => this.createButton(
                    option,
                    'bg-primary/20 hover:bg-primary/30 text-primary w-36 px-5 py-5 rounded-md font-semibold font-poppins transition-colors duration-300',
                    `data-word="${option}"`
               ))
               .join('')
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
          } else {
               this.state.isQuizCompleted = true
               alert('Quiz completed!')
          }

          this.updateUI()
     }
}