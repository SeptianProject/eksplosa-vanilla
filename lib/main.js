import { NavbarController } from "./navbar.js"
import { Carousel } from "./carousel.js"
import { ModalManagement } from "./modalManagement.js"
import { QuizManagement } from "./quizManagement.js"

document.addEventListener('DOMContentLoaded', () => {
     new NavbarController()
     const carouselContainer = document.querySelector('.carousel-container')
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

     const modalManagement = new ModalManagement()
     const loginButton = document.querySelector('[data-login-button]')
     if (loginButton) {
          loginButton.addEventListener('click', () => modalManagement.showAuthModal())
     }
     if (window.location.pathname.includes('map')) {
          modalManagement.showMapModal()
     }

     if (window.location.pathname.includes('quiz')) {
          window.quizManagement = new QuizManagement()
     }
})

