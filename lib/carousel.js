export class Carousel {
     constructor(container, options = {}) {
          this.container = container
          this.options = {
               slidesPerView: {
                    mobile: 2,
                    desktop: 5
               },
               slideGap: {
                    mobile: 25,
                    desktop: 10
               },
               transitionDuration: 300,
               disableOnDesktop: true,
               mobileBreakpoint: 768,
               ...options
          }

          this.state = {
               currentIndex: 0,
               slideWidth: 0,
               isDragging: false,
               startPos: 0,
               currentTranslate: 0,
               prevTranslate: 0,
               dragDistance: 0,
               animationFrame: null,
               isMobile: window.innerWidth < this.options.mobileBreakpoint
          }

          this.elements = {
               slidesWrapper: container.querySelector('.carousel-slides'),
               slides: Array.from(container.querySelectorAll('.carousel-slide'))
          }

          this.init()
     }

     init() {
          if (!this.validateSetup()) return
          this.setupSlides()
          this.bindEvents()
          this.setInitialState()
     }

     validateSetup() {
          if (!this.elements.slidesWrapper || !this.elements.slides.length) {
               console.error('Carousel: required elements not found')
               return false
          }
          return true
     }

     setupSlides() {
          this.updateViewSettings()
          this.updateSlideWidth()
          this.applySlideStyles()
     }

     updateViewSettings() {
          this.state.isMobile = window.innerWidth < this.options.mobileBreakpoint

          this.currentSlidesPerView = this.state.isMobile
               ? this.options.slidesPerView.mobile
               : this.options.slidesPerView.desktop

          this.currentSlideGap = this.state.isMobile
               ? this.options.slideGap.mobile
               : this.options.slideGap.desktop

          this.elements.slides.forEach(slide => {
               slide.style.cursor = this.state.isMobile || !this.options.disableOnDesktop
                    ? 'grab'
                    : 'default'
          })
     }

     updateSlideWidth() {
          const containerWidth = this.container.offsetWidth
          const totalGaps = this.currentSlidesPerView - 1
          const totalGapWidth = totalGaps * this.currentSlideGap
          this.state.slideWidth = (containerWidth - totalGapWidth) / this.currentSlidesPerView
     }

     applySlideStyles() {
          this.elements.slides.forEach(slide => {
               slide.style.width = `${this.state.slideWidth}px`
               slide.style.marginRight = `${this.currentSlideGap}px`
               slide.style.flex = '0 0 auto'
               slide.style.userSelect = 'none'
               slide.style.touchAction = 'pan-y pinch-zoom'
               slide.style.cursor = this.state.isMobile ? 'grab' : 'default'
          })

          this.elements.slidesWrapper.style.display = 'flex'
          this.elements.slidesWrapper.style.transition = 'none'
          this.elements.slidesWrapper.style.transform = 'translate3d(0px, 0px, 0px)'
     }

     bindEvents() {
          this.elements.slidesWrapper.addEventListener('mousedown', this.startDragging.bind(this))
          window.addEventListener('mousemove', this.drag.bind(this))
          window.addEventListener('mouseup', this.stopDragging.bind(this))
          window.addEventListener('mouseleave', this.stopDragging.bind(this))

          this.elements.slidesWrapper.addEventListener('touchstart', this.startDragging.bind(this), { passive: true })
          window.addEventListener('touchmove', this.drag.bind(this), { passive: true })
          window.addEventListener('touchend', this.stopDragging.bind(this))

          this.elements.slidesWrapper.addEventListener('contextmenu', e => {
               if (this.state.isDragging) e.preventDefault()
          })

          window.addEventListener('resize', this.debounce(() => {
               this.setupSlides()
               this.setTransform(this.state.currentTranslate)
          }, 300))
     }

     drag(e) {
          if (!this.state.isDragging) return
          if (this.options.disableOnDesktop && !this.state.isMobile) return

          e.preventDefault()
          const currentPosition = this.getPositionX(e)
          this.state.dragDistance = currentPosition - this.state.startPos

          const resistance = 0.25
          const maxTranslate = 0
          const minTranslate = -((this.elements.slides.length - this.currentSlidesPerView) *
               (this.state.slideWidth + this.currentSlideGap))

          if (this.state.currentTranslate > maxTranslate ||
               this.state.currentTranslate < minTranslate) {
               this.state.dragDistance *= resistance
          }

          this.state.currentTranslate = this.state.prevTranslate + this.state.dragDistance

          this.state.currentTranslate = Math.max(
               minTranslate - 50,
               Math.min(maxTranslate + 50, this.state.currentTranslate)
          )
     }

     stopDragging() {
          if (!this.state.isDragging) return

          this.state.isDragging = false
          cancelAnimationFrame(this.state.animationFrame)

          this.elements.slides.forEach(slide => slide.style.cursor = 'grab')
          this.elements.slidesWrapper.style.transition = `transform ${this.options.transitionDuration}ms ease`

          const slideUnit = this.state.slideWidth + this.currentSlideGap
          const dragThreshold = slideUnit * 0.3
          const dragDirection = this.state.dragDistance < 0 ? 1 : -1
          const shouldMoveToNextSlide = Math.abs(this.state.dragDistance) > dragThreshold

          if (shouldMoveToNextSlide) {
               this.state.currentIndex = Math.max(
                    0,
                    Math.min(
                         this.elements.slides.length - this.currentSlidesPerView,
                         this.state.currentIndex + dragDirection
                    )
               )
          }

          const targetTranslate = -(this.state.currentIndex * slideUnit)
          this.state.currentTranslate = targetTranslate
          this.state.prevTranslate = targetTranslate
          this.setTransform(targetTranslate)

          setTimeout(() => {
               this.elements.slidesWrapper.style.transition = 'none'
          }, this.options.transitionDuration)
     }

     animation() {
          this.setTransform(this.state.currentTranslate)
          if (this.state.isDragging) {
               this.state.animationFrame = requestAnimationFrame(this.animation.bind(this))
          }
     }

     setTransform(translate) {
          this.elements.slidesWrapper.style.transform = `translate3d(${translate}px, 0px, 0px)`
     }

     startDragging(e) {
          if (this.options.disableOnDesktop && !this.state.isMobile) return

          this.state.isDragging = true
          this.state.startPos = this.getPositionX(e)
          this.state.dragDistance = 0

          this.elements.slides.forEach(slide => {
               if (this.state.isMobile || !this.options.disableOnDesktop) {
                    slide.style.cursor = 'grabbing'
               }
          })
          this.state.animationFrame = requestAnimationFrame(this.animation.bind(this))
     }

     getPositionX(e) {
          return e.type.includes('mouse') ? e.pageX : e.touches[0].pageX
     }

     debounce(func, wait) {
          let timeout
          return (...args) => {
               clearTimeout(timeout)
               timeout = setTimeout(() => func(...args), wait)
          }
     }

     setInitialState() {
          this.state.currentTranslate = 0
          this.state.prevTranslate = 0
          this.setTransform(0)
     }
}