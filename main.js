import { Loader } from "./lib/loader.js"
import { Carousel } from "./lib/carousel.js"
import { NavbarController } from "./lib/navbar.js"
import { DetailManager } from "./lib/DetailManager.js"
import { ModalManagement } from "./lib/ModalManager.js"
import { AnimationController } from "./lib/animation.js"
import { ProvinceManager } from "./lib/ProvinceManager.js"
import { OrientationHandler } from "./lib/orientationHandler.js"
import { apiService } from "./services/apiService.js"
import { QuizSystemManager } from "./lib/QuizManager.js"

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

          const provinceManager = new ProvinceManager('provinceContainer', apiService)
          provinceManager.init()
          if (window.location.pathname.includes('detail')) {
               const detailManager = new DetailManager(apiService)
               detailManager.init()
          }

          if (window.location.pathname.includes('quiz')) {
               const quizSystem = new QuizSystemManager(apiService)
               quizSystem.init()
          }


          setTimeout(() => {
               animationController = new AnimationController()
               animationController.init()
          }, 100);

          const orientationHandler = new OrientationHandler({
               requireLandscape: true,
               restrictedPages: ['provincePage', 'detailPage', 'quizPage'],
               onOrientationChange: ({ isLandscape }) => {
                    if (isLandscape && modalManagement.currentModal) {
                         modalManagement.currentModal.destroy()
                    }
               }
          })

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

          orientationHandler.init()
     }

     initalizeApp()
})

