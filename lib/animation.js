export class AnimationController {
     constructor(options = {}) {
          this.options = {
               threshold: 0.2,
               rootMargin: '30px',
               ...options
          }
          this.init = this.init.bind(this)
          this.handleIntersection = this.handleIntersection.bind(this)
     }

     isElementInViewport(el) {
          const rect = el.getBoundingClientRect()
          return (
               rect.top >= 0 &&
               rect.left >= 0 &&
               rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
               rect.right <= (window.innerWidth || document.documentElement.clientWidth)
          )
     }

     init() {
          this.observer = new IntersectionObserver(this.handleIntersection, {
               threshold: this.options.threshold,
               rootMargin: this.options.rootMargin
          })

          document.querySelectorAll('.animate, .staggered').forEach(element => {
               this.observer.observe(element)
          })
     }

     handleIntersection(entries) {
          entries.forEach(entry => {
               if (entry.isIntersecting && !entry.target.classList.contains('active')) {
                    entry.target.classList.add('active')
               }
          })
     }

     destroy() {
          if (this.observer) {
               this.observer.disconnect()
          }
     }
}