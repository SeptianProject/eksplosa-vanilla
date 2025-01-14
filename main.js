import { NavbarController } from "./lib/navbar.js"
import { Carousel } from "./lib/carousel.js"
import { ModalManagement } from "./lib/modalManagement.js"
import { QuizManagement } from "./lib/quizManagement.js"
import { AnimationController } from "./lib/animation.js"
import { Loader } from "./lib/loader.js"

document.addEventListener('DOMContentLoaded', () => {
     const modalManagement = new ModalManagement()
     const closeButton = document.getElementById('closeButton')
     const loginButton = document.querySelector('[data-login-button]')
     const carouselContainer = document.querySelector('.carousel-container')
     const loader = new Loader()
     let animationController

     async function initalizeApp() {
          await loader.simulatedLoading()

          new NavbarController()
          setTimeout(() => {
               animationController = new AnimationController()
               animationController.init()
          }, 100);

          if (carouselContainer) {
               new Carousel(carouselContainer, {
                    slidesPerView: {
                         mobile: 2,
                         desktop: 5
                    },
                    slideGap: 25,
                    transitionDuration: 300
               })
          }

          if (loginButton) {
               loginButton.addEventListener('click', () => modalManagement.showAuthModal())
          }

          if (closeButton) {
               closeButton.addEventListener('click', () => {
                    window.history.back()
               })
          }

          if (window.location.pathname.includes('map')) {
               modalManagement.showMapModal()
          }

          if (window.location.pathname.includes('quiz')) {
               window.quizManagement = new QuizManagement()
          }
     }

     initalizeApp()
})

