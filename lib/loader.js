export class Loader {
     constructor() {
          this.createLoader()
          this.progress = 0
          this.isLoading = false
     }

     createLoader() {
          const loader = document.createElement('div')
          loader.className = `loader-container hide`
          loader.innerHTML = `
          <div class="loader-content flex flex-col items-center">
               <div class="loader-progress">
                    <div class="progress-bar"></div>
               </div>
               <div class="loader-text">Loading...</div>
          </div>
          `

          document.body.appendChild(loader)
          this.loaderElement = loader
          this.progressBar = loader.querySelector('.progress-bar')
          this.loadingText = loader.querySelector('.loader-text')
     }

     show(message = 'Loading...') {
          this.isLoading = true
          this.loaderElement.classList.remove('hide')
          this.loadingText.textContent = message
          document.body.style.overflow = 'hidden'
     }

     hide() {
          this.isLoading = false
          this.loaderElement.classList.add('hide')
          document.body.style.overflow = ''
          this.setProgress(0)
     }

     setProgress(percent) {
          this.progress = Math.min(100, Math.max(0, percent))
          this.progressBar.style.width = `${this.progress}%`
     }

     async simulatedLoading(duration = 1500, message = 'Loading...') {
          this.show(message)
          const steps = 10
          const increment = 100 / steps
          const stepDuration = duration / steps

          for (let i = 0; i <= steps; i++) {
               this.setProgress(i * increment)
               await new Promise(resolve => setTimeout(resolve, stepDuration))
          }
          this.hide()
     }


     // async fetchWithLoading(url, options = {}, loadingMessage = 'Loading...') {
     //      try {
     //           this.show(loadingMessage)
     //           const response = await fetch(url, options)
     //           const data = await response.json()
     //           return data
     //      } catch (error) {
     //           throw error
     //      } finally {
     //           this.hide()
     //      }
     // }
}