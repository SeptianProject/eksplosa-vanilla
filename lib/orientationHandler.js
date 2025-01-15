export class OrientationHandler {
     constructor(options = {}) {
          this.options = {
               requireLandscape: options.requireLandscape ?? true,
               minWidth: options.minWidth ?? 768,
               onOrientationChange: options.onOrientationChange || (() => { }),
               modalManager: options.modalManager,
               ...options
          }

          this.currentOrientation = window.screen.orientation.type
          this.init()
     }

     init() {
          this.checkOrientation()

          window.addEventListener('orientationchange', () => {
               setTimeout(() => {
                    this.checkOrientation()
               }, 100);
          })

          window.addEventListener('resize', this.debounce(() => {
               this.checkOrientation()
          }, 250))
     }

     checkOrientation() {
          const isLandscape = window.innerWidth > window.innerHeight
          const isMobile = window.innerWidth < this.options.minWidth

          if (this.options.requireLandscape && isMobile && !isLandscape) {
               this.showRotatePrompt()
          } else {
               this.hideRotatePrompt()
          }

          this.updateLayout(isLandscape, isMobile)

          this.options.onOrientationChange?.({
               isLandscape,
               isMobile,
               width: window.innerWidth,
               height: window.innerHeight
          })
     }

     showRotatePrompt() {
          if (this.options.modalManager) {
               this.options.modalManager.showHintModal()
          }
     }

     hideRotatePrompt() {
          if (this.options.modalManager?.currentModal) {
               this.options.modalManager.currentModal.destroy()
          }
     }

     updateLayout(isLandscape, isMobile) {
          const root = document.documentElement
          root.style.setProperty('--viewport-height', `${window.innerHeight}px`)
          root.style.setProperty('--viewport-width', `${window.innerWidth}px`)

          document.body.classList.toggle('is-landscape', isLandscape)
          document.body.classList.toggle('is-mobile', isMobile)
     }

     debounce(func, wait) {
          let timeout
          return function executedFunction(...args) {
               const later = () => {
                    clearTimeout(timeout)
                    func(...args)
               }
               clearTimeout(timeout)
               timeout = setTimeout(later, wait)
          }
     }

     destroy() {
          window.removeEventListener('orientationchange', this.checkOrientation)
          window.removeEventListener('resize', this.checkOrientation)
     }
}