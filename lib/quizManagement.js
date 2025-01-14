import { ModalManagement } from "./modalManagement.js";
import { QUIZ_LEVELS } from "./quizLevel.js";

export class QuizManagement {
     constructor() {
          this.state = {
               selectedLevel: '1A',
               currentQuestion: QUIZ_LEVELS[0].questions[0],
               selectedWords: [],
               currentQuestionIndex: 0,
               isQuizCompleted: false,
               score: 0,
               totalQuestions: QUIZ_LEVELS[0].questions.length
          }

          this.modalManagement = new ModalManagement()
          this.initializeElements()
          this.initializeEventListeners()
          this.updateUI()
     }

     initializeElements() {
          this.elements = {
               levelDisplay: document.getElementById('level'),
               questionDisplay: document.getElementById('question'),
               answerContainer: document.querySelector('.flex.flex-wrap.gap-2'),
               optionsContainer: document.querySelector('.flex.flex-wrap.items-center.justify-center.gap-4'),
               closeButton: document.getElementById('closeButton'),
               levelButtons: document.querySelectorAll('[data-modal-action]')
          }
     }

     initializeEventListeners() {
          if (this.elements.closeButton) {
               this.elements.closeButton.addEventListener('click', () => this.handleClose())
          }

          this.elements.levelButtons.forEach(button => {
               button.addEventListener('click', () => {
                    const level = button.dataset.level
                    if (level) {
                         this.handleLevelSelect(level)
                    }
               })
          })

          document.addEventListener('modalAction', (event) => {
               if (event.detail.type === 'success') {
                    this.nextQuestion()
               } else if (event.detail.type === 'failure') {
                    this.state.selectedWords = []
                    this.updateUI()
               }
          })
     }

     handleClose() {
          window.history.back()
     }

     handleLevelSelect(level) {
          const selectedLevel = QUIZ_LEVELS.find(l => l.level === level)
          if (selectedLevel && selectedLevel.isActive) {
               this.state.selectedLevel = level
               this.state.currentQuestion = selectedLevel.questions[0]
               this.state.currentQuestionIndex = 0
               this.state.isQuizCompleted = false
               this.state.score = 0
               this.state.selectedWords = []
               this.updateUI()
          } else {
               this.modalManagement.showQuizModal('information')
          }
     }

     handleWordSelect(word) {
          if (this.state.selectedWords.includes(word)) {
               this.state.selectedWords = this.state.selectedWords.filter(w => w !== word)
          } else {
               const newSelectWords = [...this.state.selectedWords, word]
               this.state.selectedWords = newSelectWords

               if (newSelectWords.length === this.state.currentQuestion.correctAnswer.length) {
                    const isCorrect = this.checkAnswer(newSelectWords)
                    if (isCorrect) {
                         this.state.score++
                         this.enableNextLevel()
                    }
               }
          }
          this.updateUI()
     }

     enableNextLevel() {
          const currentLevelIndex = QUIZ_LEVELS.findIndex(l => l.level === this.state.selectedLevel)
          if (currentLevelIndex < QUIZ_LEVELS.length - 1) {
               QUIZ_LEVELS[currentLevelIndex + 1].isActive = true
          }
     }

     handleReset(word) {
          if (this.state.selectedWords.includes(word)) {
               this.state.selectedWords = []
               this.updateUI()
          }
     }

     checkAnswer(submittedWords) {
          if (!this.state.currentQuestion) return false
          if (submittedWords.length !== this.state.currentQuestion.correctAnswer.length) return false

          const isCorrect = submittedWords.every((word, index) =>
               word === this.state.currentQuestion.correctAnswer[index]
          )

          if (isCorrect) {
               const currentLevel = QUIZ_LEVELS.find(l => l.level === this.state.selectedLevel)
               const isLastQuestion = this.state.currentQuestionIndex === currentLevel.questions.length - 1

               this.modalManagement.showQuizModal('success')
               if (isLastQuestion) {
                    this.state.isQuizCompleted = true
               }
          } else {
               this.modalManagement.showQuizModal('failure')
          }

          return isCorrect
     }

     nextQuestion() {
          const currentLevel = QUIZ_LEVELS.find(l => l.level === this.state.selectedLevel)
          const nextIndex = this.state.currentQuestionIndex + 1

          if (currentLevel && nextIndex < currentLevel.questions.length) {
               this.state.currentQuestionIndex = nextIndex
               this.state.currentQuestion = currentLevel.questions[nextIndex]
          } else {
               const currentLevelIndex = QUIZ_LEVELS.findIndex(l => l.level === this.state.selectedLevel)
               const nextLevel = QUIZ_LEVELS.slice(currentLevelIndex + 1).find(l => l.isActive)

               if (nextLevel) {
                    this.state.selectedLevel = nextLevel.level
                    this.state.currentQuestion = nextLevel.questions[0]
                    this.state.currentQuestionIndex = 0
               } else {
                    this.modalManagement.showQuizModal('information')
                    return
               }
          }

          this.state.selectedWords = []
          this.state.isQuizCompleted = false
          this.updateUI()
     }

     updateUI() {
          this.elements.levelDisplay.textContent = `#${this.state.currentQuestion.level} - Percakapan sehari hari`
          this.elements.questionDisplay.textContent = this.state.currentQuestion.question

          this.elements.levelButtons.forEach(button => {
               const levelCircle = button.querySelector('.rounded-full')
               const isActive = QUIZ_LEVELS.find(l => l.level === button.dataset.level)?.isActive

               if (isActive) {
                    levelCircle.classList.remove('bg-graySurface')
                    levelCircle.classList.add('bg-primary')
               } else {
                    levelCircle.classList.remove('bg-primary')
                    levelCircle.classList.add('bg-graySurface')
               }
          })

          this.elements.answerContainer.innerHTML = this.state.selectedWords
               .map(word => `
               <button 
                    onclick="quizManagement.handleReset('${word}')"
                    class="bg-primary text-white w-32 py-4 rounded-md font-semibold">
                    ${word}
               </button>
          `).join('');

          this.elements.optionsContainer.innerHTML = this.state.currentQuestion.options
               .filter(option => !this.state.selectedWords.includes(option))
               .map(option => `
               <button 
                    onclick="quizManagement.handleWordSelect('${option}')"
                    class="bg-primary/20 hover:bg-primary/30 text-primary w-36 px-5 py-5 rounded-md 
                    font-semibold font-poppins transition-colors duration-300">
                    ${option}
               </button>
          `).join('');
     }
}