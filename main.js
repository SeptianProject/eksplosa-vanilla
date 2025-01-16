import { NavbarController } from "./lib/navbar.js"
import { Carousel } from "./lib/carousel.js"
import { ModalManagement } from "./lib/modalManagement.js"
import { QuizManagement } from "./lib/quizManagement.js"
import { AnimationController } from "./lib/animation.js"
import { Loader } from "./lib/loader.js"
import { apiService } from "./services/apiService.js"

document.addEventListener('DOMContentLoaded', () => {
     const modalManagement = new ModalManagement()
     const closeButton = document.getElementById('closeButton')
     const loginButton = document.querySelector('[data-login-button]')
     const carouselContainer = document.querySelector('.carousel-container')
     const loader = new Loader()
     let animationController

     async function initalizeApp() {
          const provinces = await apiService.getProvinces()
          const languages = await apiService.getLanguages()
          const levels = await apiService.getLevels()
          const questions = await apiService.getQuestions()
          console.log('Provinces: ', provinces)
          console.log('Languages: ', languages)
          console.log('Levels: ', levels)
          console.log('Questions: ', questions)

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
                    slideGap: {
                         mobile: 25,
                         desktop: 10
                    },
                    transitionDuration: 300
               })
          }

          if (loginButton) {
               loginButton.addEventListener('click', () => modalManagement.showAuthModal())
          }

          if (closeButton) {
               closeButton.addEventListener('click', () => history.back())
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

