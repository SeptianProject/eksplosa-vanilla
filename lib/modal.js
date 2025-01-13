export class Modal {
     constructor(options = {}) {
          this.isOpen = false
          this.options = {
               onClose: options.onClose || (() => { }),
               onAction: options.onAction || (() => { }),
               variant: options.variant || null,
               modalType: options.modalType || null
          }

          this.init()
     }

     init() {
          this.overlay = document.createElement('div')
          this.overlay.className = 'fixed inset-0 bg-black/60 transition-all duration-300 z-50'
          this.overlay.style.display = 'none'

          this.modalContainer = document.createElement('div')
          this.modalContainer.className = `fixed w-full py-10 bg-white top-1/2 left-1/2 transform 
               -translate-y-1/2 -translate-x-1/2 rounded-2xl md:h-[28rem] md:w-[38rem] md:py-2 
               transition-all duration-300 ease-in-out scale-0 z-50`

          document.body.appendChild(this.overlay)
          document.body.appendChild(this.modalContainer)

          this.overlay.addEventListener('click', () => this.hide())
     }

     show(content) {
          this.isOpen = true
          this.modalContainer.innerHTML = content
          this.overlay.style.display = 'block'
          this.modalContainer.classList.remove('scale-0')
          this.modalContainer.classList.add('scale-90', 'md:scale-100')
          document.body.style.overflow = 'hidden'

          const closeBtn = this.modalContainer.querySelector('[data-modal-close]')
          if (closeBtn) {
               closeBtn.addEventListener('click', () => this.hide())
          }

          const actionBtn = this.modalContainer.querySelector('[data-modal-action]')
          if (actionBtn) {
               actionBtn.addEventListener('click', () => {
                    this.options.onAction()
                    if (this.options.modalType !== 'map') {
                         this.hide()
                    }
               })
          }
     }

     hide() {
          this.isOpen = false
          this.modalContainer.classList.remove('scale-90', 'md:scale-100')
          this.modalContainer.classList.add('scale-0')
          this.overlay.style.display = 'none'
          document.body.style.overflow = 'auto'
          this.options.onClose()
     }

     destroy() {
          this.overlay.remove()
          this.modalContainer.remove()
     }
}