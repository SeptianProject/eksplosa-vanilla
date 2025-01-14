export class AnimationController {
     constructor() {
          this.handleScroll = this.handleScroll.bind(this)
          this.handleInitialAnimation = this.handleInitialAnimation.bind(this)
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

     handleScroll() {
          const elements = document.querySelectorAll('.animate, .staggered')

          elements.forEach(element => {
               if (this.isElementInViewport(element) && !element.classList.contains('active')) {
                    element.classList.add('active')
               }
          })
     }

     handleInitialAnimation() {
          const elements = document.querySelectorAll('.animate, .staggered')

          elements.forEach((element, index) => {
               setTimeout(() => {
                    if (this.isElementInViewport(element)) {
                         element.classList.add('active')
                    }
               }, index * 100);
          })
     }

     init() {
          this.handleInitialAnimation()

          window.addEventListener('scroll', this.handleScroll)
          window.addEventListener('resize', this.handleScroll)
     }

     destroy() {
          window.removeEventListener('scroll', this.handleScroll)
          window.removeEventListener('resize', this.handleScroll)
     }
}