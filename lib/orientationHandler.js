import { ModalManagement } from "./ModalManager.js"

export class OrientationHandler {
     constructor(options = {}) {
          this.options = {
               requireLandscape: options.requireLandscape ?? true,
               minWidth: options.minWidth ?? 768,
               onOrientationChange: options.onOrientationChange || (() => { }),
               restrictedPages: options.restrictedPages || [],
               ...options
          }

          this.modalManagement = new ModalManagement()
          this.isModalShown = false

          if (this.shouldCheckOrientation()) {
               this.init()
          }
     }

     shouldCheckOrientation() {
          const currentPage = document.body.id || ''
          return this.options.restrictedPages.includes(currentPage)
     }

     init() {
          this.checkOrientation()

          window.addEventListener('orientationchange', this.handleOrientationChange.bind(this))
          window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250))
     }

     handleOrientationChange() {
          setTimeout(() => {
               this.checkOrientation()
               window.dispatchEvent(new Event('resize'))
          }, 100);
     }

     handleResize() {
          this.checkOrientation()
     }

     checkOrientation() {
          if (!this.shouldCheckOrientation()) return

          const isLandscape = window.innerWidth > window.innerHeight
          const isMobile = window.innerWidth < this.options.minWidth
          const shouldShowPrompt = this.options.requireLandscape && isMobile && !isLandscape

          document.body.classList.toggle('is-landscape', isLandscape)
          document.body.classList.toggle('is-mobile', isMobile)

          if (shouldShowPrompt && !this.isModalShown) {
               this.modalManagement.showHintModal()
               this.isModalShown = true
               document.body.classList.add('modal-open')
          } else if (!shouldShowPrompt && this.isModalShown) {
               this.modalManagement.currentModal?.destroy()
               this.isModalShown = false
               document.body.classList.remove('modal-open')
          }

          this.updateViewportProperties()

          this.options.onOrientationChange?.({
               isLandscape,
               isMobile,
               width: window.innerWidth,
               height: window.innerHeight,
               shouldShowPrompt
          })
     }

     updateViewportProperties() {
          const root = document.documentElement
          const vh = window.visualViewport?.height || window.innerHeight
          const vw = window.visualViewport?.width || window.innerWidth

          root.style.setProperty('--viewport-height', `${vh}px`)
          root.style.setProperty('--viewport-width', `${vw}px`)
          root.style.setProperty('--safe-area-inset-top',
               getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0px')
          root.style.setProperty('--safe-area-inset-bottom',
               getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0px')
     }

     debounce(func, wait) {
          let timeout
          return (...args) => {
               clearTimeout(timeout)
               timeout = setTimeout(() => func.apply(this, args), wait)
          }
     }

     destroy() {
          window.removeEventListener('orientationchange', this.handleOrientationChange.bind(this))
          window.removeEventListener('resize', this.handleResize.bind(this))
          if (this.isModalShown) {
               this.modalManagement.currentModal?.destroy()
          }
     }
}