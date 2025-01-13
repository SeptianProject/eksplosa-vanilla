export class NavbarController {
     constructor() {
          this.navbar = document.getElementById('navbar')
          this.navItem = document.getElementById('nav-item')
          this.hamburgerButton = document.getElementById('hamburger-button')
          this.hamburgerItems = {
               item1: document.getElementById('hamburger-1'),
               item2: document.getElementById('hamburger-2'),
               item3: document.getElementById('hamburger-3'),
          }

          this.init()
     }

     init() {
          this.bindEvents()
     }

     bindEvents() {
          window.addEventListener('scroll', this.handleScroll.bind(this))
          this.hamburgerButton?.addEventListener('click', this.toggleMenu.bind(this))
     }

     handleScroll() {
          const shouldAddShadow = window.scrollY > 0
          this.navbar.classList.toggle('shadow-md', shouldAddShadow)
          this.navbar.classList.toggle('shadow-black/20', shouldAddShadow)
          this.navbar.classList.toggle('shadow-none', !shouldAddShadow)
     }

     toggleMenu() {
          this.navItem.classList.toggle('-translate-y-72')
          this.hamburgerButton.classList.toggle('active')

          const isActive = this.hamburgerButton.classList.contains('active')
          this.updateHamburgerSpacing(isActive)
          this.updateHamburgerAnimation(isActive)
     }

     updateHamburgerSpacing(isActive) {
          this.hamburgerButton.classList.toggle('space-y-0', isActive)
          this.hamburgerButton.classList.toggle('space-y-1', !isActive)
     }

     updateHamburgerAnimation(isActive) {
          const items = Object.values(this.hamburgerItems)

          items.forEach(item => {
               item.classList.toggle('absolute', isActive)
          })

          this.hamburgerItems.item1.classList.toggle('-rotate-45', isActive);
          this.hamburgerItems.item2.classList.toggle('-translate-x-5', isActive);
          this.hamburgerItems.item2.classList.toggle('scale-0', isActive);
          this.hamburgerItems.item3.classList.toggle('rotate-45', isActive);
     }
}