export class NavbarController {
     constructor() {
          this.navbar = document?.getElementById('navbar')
          this.navItem = document.getElementById('nav-item')
          this.navigate = document.querySelectorAll('[data-target]')
          this.hamburgerButton = document.getElementById('hamburger-button')
          this.hamburgerItems = {
               item1: document.getElementById('hamburger-1'),
               item2: document.getElementById('hamburger-2'),
               item3: document.getElementById('hamburger-3'),
          }

          this.isMenuOpen = false
          this.lastScrollPosition = window.scrollY

          this.init()
     }


     init() {
          this.bindEvents()
          this.handleScroll()

          if (!this.validateElements()) return
          this.navItem.classList.add('-translate-y-72')
     }

     validateElements() {
          return this.navbar && this.navItem && this.hamburgerButton &&
               Object.values(this.hamburgerItems).every(item => item)
     }

     bindEvents() {
          let ticking = false
          window.addEventListener('scroll', () => {
               if (!ticking) {
                    window.requestAnimationFrame(() => {
                         this.handleScroll()
                         ticking = false
                    })
                    ticking = true
               }
          })

          window.addEventListener('resize', this.handleScroll.bind(this))
          this.hamburgerButton?.addEventListener('click', this.toggleMenu.bind(this))

          if (this.navigate && this.navigate.length > 0) {
               this.navigate.forEach((item) => {
                    item.addEventListener('click', this.handleNavItemClick.bind(this))
               })
          }

          document.addEventListener('click', (e) => {
               if (this.isMenuOpen &&
                    !this.navItem.contains(e.target) &&
                    !this.hamburgerButton.contains(e.target)) {
                    this.closeMenu()
               }
          })
     }

     handleResize() {
          const isMobile = window.innerWidth <= 768
          if (!isMobile && this.isMenuOpen) {
               this.closeMenu()
          }
     }

     handleNavItemClick(event) {
          const target = event.currentTarget.getAttribute('data-target')
          console.log(target)
          if (!target) return

          if (target.startsWith('#')) {
               const section = document.querySelector(target)
               if (section) {
                    event.preventDefault()
                    section.scrollIntoView({
                         behavior: 'smooth',
                         block: 'start',
                    })
               }
          } else {
               window.location.href = `/pages/${target}`
          }

          this.toggleMenu()
     }

     handleScroll() {
          if (!this.validateElements()) return

          const currentScroll = window.scrollY
          const scrollingDown = currentScroll > this.lastScrollPosition

          if (this.isMenuOpen && Math.abs(currentScroll - this.lastScrollPosition) > 10) {
               this.closeMenu()
          }

          const shouldAddShadow = currentScroll > 10;
          this.navbar.classList.toggle('shadow-md', shouldAddShadow);
          this.navbar.classList.toggle('shadow-black/20', shouldAddShadow);
          this.navbar.classList.toggle('shadow-none', !shouldAddShadow);

          this.lastScrollPosition = currentScroll;
     }

     toggleMenu() {
          const isMobile = window.innerWidth <= 768;
          if (!isMobile) return;

          this.isMenuOpen = !this.isMenuOpen;
          this.updateMenuState();
     }

     closeMenu() {
          if (this.isMenuOpen) {
               this.isMenuOpen = false;
               this.updateMenuState();
          }
     }

     updateMenuState() {
          this.navItem.classList.toggle('-translate-y-72', !this.isMenuOpen)
          this.navItem.classList.toggle('translate-y-0', this.isMenuOpen)

          this.hamburgerButton.classList.toggle('active', this.isMenuOpen)
          this.updateHamburgerAnimation(this.isMenuOpen)
          this.updateHamburgerSpacing(this.isMenuOpen)
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