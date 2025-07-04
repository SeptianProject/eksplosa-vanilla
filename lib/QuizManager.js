import { ModalManagement } from "./ModalManager.js"

export class QuizSystemManager {
     constructor(apiService) {
          this.apiService = apiService
          this.params = {
               provinceId: this.getUrlParam('province'),
               languageId: this.getUrlParam('language'),
               levelId: this.getUrlParam('level')
          }

          this.state = {
               levels: [],
               questions: [],
               currentQuestionIndex: 0,
               selectedWords: [],
               score: 0,
               isQuizCompleted: false,
               activeLevel: null,
               completedLevels: new Set(),
               lastCompletedLevel: null
          }

          this.elements = this.initializeElements()
          this.modalManagement = new ModalManagement()
          this.loadProgress()
     }

     loadProgress() {
          const savedCompletedLevels = localStorage.getItem('completedLevels')
          if (savedCompletedLevels) {
               this.state.completedLevels = new Set(JSON.parse(savedCompletedLevels))
          }

          const lastLevel = localStorage.getItem(`lastLevel_${this.params.languageId}`)
          if (lastLevel) {
               this.state.lastCompletedLevel = lastLevel
          }
     }

     saveProgress() {
          localStorage.setItem('completedLevels',
               JSON.stringify([...this.state.completedLevels]))

          if (this.state.activeLevel) {
               localStorage.setItem(
                    `lastLevel_${this.params.languageId}`,
                    this.state.activeLevel.id.toString()
               )
          }
     }

     isLevelAccessible(levelId) {
          if (!this.state.levels.length) return
          if (levelId === this.state.levels[0].id) return true

          const levelIndex = this.state.levels.findIndex(level => level.id === levelId)
          if (levelIndex <= 0) return false
          const previousLevelId = this.state.levels[levelIndex - 1].id
          return this.state.completedLevels.has(previousLevelId.toString())
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
          const levels = await this.apiService.getLevels()
          console.log('Fetched levels:', levels)
          this.state.levels = levels.sort((a, b) => a.level - b.level)
          console.log('Sorted levels:', this.state.levels)

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
          if (!this.state.levels.length) return

          let targetLevel

          if (this.state.lastCompletedLevel) {
               const lastLevelIndex = this.state.levels.findIndex(
                    level => level.id.toString() === this.state.lastCompletedLevel
               )

               if (lastLevelIndex < this.state.levels.length - 1) {
                    targetLevel = this.state.levels[lastLevelIndex + 1]
               } else {
                    targetLevel = this.state.levels[lastLevelIndex]
               }
          } else {
               targetLevel = this.state.levels[0]
          }

          if (targetLevel) {
               this.state.activeLevel = targetLevel
               await this.fetchQuestionsForLevel(targetLevel.id)
               this.updateUrlWithLevel(targetLevel.id)
          }
     }

     updateUrlWithLevel(levelId) {
          const url = new URL(window.location.href)
          url.searchParams.set('level', levelId)
          window.history.replaceState({}, '', url.toString())
     }

     async fetchQuestionsForLevel(levelId) {
          const questions = await this.apiService.getQuestions(levelId)
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
               const level = this.state.activeLevel
               const displayNumber = index + 1
               const activeClass = isActive ? 'bg-primary text-white' : 'bg-graySurface text-primary'

               return `
               <div class="start-quiz-btn flex items-center gap-x-2 w-fit cursor-pointer">
                    <div class="flex items-center justify-center size-6 rounded-full
                    sm:size-8 lg:size-11 ${activeClass}">
                         <h5 class="text-white text-[9px] md:text-[12px] lg:text-sm font-medium lg:font-semibold">
                         ${displayNumber}${question.tipe}
                         </h5>
                    </div>
                    <h5 class="text-[10px] sm:text-[12px] lg:text-sm font-medium 
                    max-w-[6.5rem] sm:max-w-[8rem] md:max-w-[10rem] lg:font-semibold lg:max-w-[12rem]">
                         Bagian ${displayNumber}${question.tipe} - ${level.topik || 'Percakapan sehari-hari'}
                    </h5>
               </div>
               `
          }

          const renderLevelSession = (level, index, isActive = false) => {
               const displayNumber = index + 1
               const isAccessible = this.isLevelAccessible(level.id)
               const isCompleted = this.state.completedLevels.has(level.id.toString())
               let buttonClass = 'size-6 text-[12px] md:text-sm md:size-8 lg:text-base lg:size-10 rounded-md p-1 flex items-center justify-center transition-colors duration-300'

               if (isActive) {
                    buttonClass += ' bg-primary text-white'
               } else if (isCompleted) {
                    buttonClass += ' bg-primary text-white'
               } else {
                    buttonClass += ' bg-blueAccent text-primary hover:bg-primary/30'
               }

               return `
               <button
                    data-level-id="${level.id}"
                    class="${buttonClass}"
               >
                    ${displayNumber}
                    ${isCompleted ? '<span class="ml-1">✓</span>' : ''}
               </button>
               `
          }

          const displayQuestions = this.state.questions.slice(0, 5)
          console.log('Display Questions:', displayQuestions)
          this.elements.levelContainer.innerHTML = displayQuestions
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

          const question = this.currentQuestion
          const level = this.state.activeLevel
          if (level) {
               const displayNumber = this.state.currentQuestionIndex + 1
               this.elements.levelDisplay.textContent = `#Bagian ${displayNumber}${question.tipe[0]} - ${level.topik}`
          }

          this.elements.questionDisplay.textContent = question.pertanyaan

          this.elements.answerContainer.innerHTML = this.state.selectedWords
               .map(word => this.createButton(
                    word,
                    'bg-primary text-white text-sm w-24 px-3 py-4 lg:text-base md:w-28 lg:w-36 lg:px-5 lg:py-5 rounded-md font-medium md:font-semibold',
                    `data-reset="${word}"`
               ))
               .join('')

          const unusedOptions = question.pilihan
               .map(answer => answer)
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
          if (this.state.activeLevel) {
               this.state.completedLevels.add(this.state.activeLevel.id.toString())
               this.state.lastCompletedLevel = this.state.activeLevel.id.toString()
               this.saveProgress()
          }

          const currentLevelIndex = this.state.levels.findIndex(level =>
               level.id === this.state.activeLevel?.id
          )

          if (currentLevelIndex < this.state.levels.length - 1) {
               const nextLevel = this.state.levels[currentLevelIndex + 1]
               this.state.activeLevel = nextLevel
               await this.fetchQuestionsForLevel(nextLevel.id)
               this.updateUI()
          } else {
               this.modalManagement.showQuizModal('success')
               this.state.isQuizCompleted = true
          }
     }

     attachEventListeners() {
          if (this.elements.levelSession) {
               this.elements.levelSession.addEventListener('click', async (e) => {
                    const levelId = e.target.dataset.levelId
                    if (!levelId) return

                    if (!this.isLevelAccessible(levelId)) {
                         this.modalManagement.showQuizModal('information')
                         return
                    }

                    const selectedLevel = this.state.levels.find(l =>
                         l.id.toString() === levelId
                    )

                    if (selectedLevel) {
                         this.state.activeLevel = selectedLevel
                         await this.fetchQuestionsForLevel(levelId)
                         this.updateUI()
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

               const correctAnswer = this.currentQuestion.jawaban_benar.split(' ')
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
               this.currentQuestion.jawaban_benar.toLowerCase()

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