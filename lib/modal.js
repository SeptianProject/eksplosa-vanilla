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
               transition-transform duration-300 ease-in-out z-50`

          document.body.appendChild(this.overlay)
          document.body.appendChild(this.modalContainer)
     }

     show(content) {
          this.isOpen = true
          this.modalContainer.innerHTML = content
          this.overlay.style.display = 'block'
          requestAnimationFrame(() => {
               this.overlay.style.opacity = '1'
          })

          requestAnimationFrame(() => {
               this.modalContainer.style.transform = 'translate(-50%, -50%) scale(1)';
               this.modalContainer.classList.remove('scale-0');
               this.modalContainer.classList.add('scale-100');
          });

          document.body.style.overflow = 'hidden'
          this.setupEventListeners()
     }

     setupEventListeners() {
          const closeBtn = this.modalContainer.querySelector('[data-modal-close]')
          if (closeBtn) {
               closeBtn.addEventListener('click', () => this.hide())
          }

          const actionBtn = this.modalContainer.querySelector('[data-modal-action]')
          if (actionBtn) {
               actionBtn.addEventListener('click', () => {
                    this.options.onAction()
                    this.hide()
                    if (this.options.modalType !== 'map') {
                         // this.hide()
                    }
               })
          }
     }

     hide() {
          if (!this.isOpen) return

          this.isOpen = false
          this.overlay.style.opacity = '0'
          this.modalContainer.style.transform = 'translate(-50%, -50%) scale(0)'
          this.modalContainer.classList.remove('scale-100')
          this.modalContainer.classList.add('scale-0')

          setTimeout(() => {
               this.overlay.style.display = 'none'
               document.body.style.overflow = 'auto'
               this.options.onClose()
          }, 300);
     }

     destroy() {
          if (this.isOpen) {
               this.hide()
          }
          setTimeout(() => {
               this.overlay.remove()
               this.modalContainer.remove()
          }, 300);
     }
}