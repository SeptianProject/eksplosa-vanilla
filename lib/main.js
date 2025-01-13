import { NavbarController } from "./navbar.js"
import { Carousel } from "./carousel.js"

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
})

