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
               button.addEventListener('click', () => this.handleLevelSelect(button.dataset.level))
          })
     }

     handleClose() {
          window.history.back()
          console.log('Quiz closed')
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
                    this.showModal('quiz', isCorrect ? 'success' : 'failure')

                    if (isCorrect) {
                         setTimeout(() => {
                              this.nextQuestion()
                         }, 500);
                    }

                    setTimeout(() => {
                         this.state.selectedWords = []
                         this.updateUI()
                    }, 500);
               }
          }
          this.updateUI()
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
          return submittedWords.every((word, index) => word === this.state.currentQuestion.correctAnswer[index])
     }

     nextQuestion() {
          const level = QUIZ_LEVELS.find(l => l.level === this.state.selectedLevel)
          if (level) {
               const nextIndex = this.state.currentQuestionIndex + 1
               if (nextIndex < level.questions.length) {
                    this.state.currentQuestion = level.questions[nextIndex]
                    this.state.currentQuestionIndex = nextIndex
               } else {
                    this.state.isQuizCompleted = true
                    if (level.level !== QUIZ_LEVELS[QUIZ_LEVELS.length - 1].level) {
                         this.showModal('quiz', 'success')
                    }
               }
               this.state.selectedWords = []
               this.updateUI()
          }
     }

     showModal(type, variant) {
          const modal = document.createElement('div')
          modal.className = 'fixed inset-0 flex items-center justify-center z-50 bg-black/50'
          modal.innerHTML = `
          <div class="bg-white p-6 rounded-lg">
               <h2 class="text-xl font-bold ${variant === 'success' ? 'text-primary' : 'text-danger'}">
                    ${variant === 'success' ? 'Correct!' : 'Try Again!'}
               </h2>
          </div>
          `
          document.body.appendChild(modal)
          setTimeout(() => modal.remove(), 1500);
     }

     updateUI() {
          this.elements.levelDisplay.textContent = `#${this.state.currentQuestion.level} - Percakapan sehari hari`
          this.elements.questionDisplay.textContent = this.state.currentQuestion.question

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
                    class="bg-primary/20 hover:bg-primary/30 text-primary px-10 py-5 rounded-md 
                    font-semibold font-poppins transition-colors duration-300">
                    ${option}
               </button>
          `).join('');
     }
}