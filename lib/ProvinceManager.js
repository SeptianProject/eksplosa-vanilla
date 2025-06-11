export class ProvinceManager {
     constructor(containerId, apiService) {
          this.container = document.getElementById(containerId)
          this.apiService = apiService
          this.provinces = []
          this.isShowingAll = false
          this.initializeViewAllButton()
     }

     initializeViewAllButton() {
          this.viewAllButton = document.querySelector('button[class*="border-primary"]')
          if (this.viewAllButton) {
               this.viewAllButton.addEventListener('click', () => this.toggleView())
          }
     }

     init() {
          if (!this.container) return
          this.showSkeletonLoading()
          this.render()
     }

     showSkeletonLoading() {
          const sekeleton = Array(8).fill(0).map(() => this.createSkeletonTemplate()).join('')
          this.container.innerHTML = sekeleton
     }

     createSkeletonTemplate() {
          return `
          <div class="skeleton-card">
               <div class="skeleton skeleton-image"></div>
               <div class="p-4">
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-button"></div>
               </div>
          </div>
          `
     }

     async render() {
          try {
               await this.fetchProvinces()
               this.renderCards()
               this.attachEventListeners()
               this.updateViewAllButtonVisibility()
          } catch (error) {
               console.error('Error rendering provinces:', error)
          }
     }

     async fetchProvinces() {
          this.provinces = await this.apiService.getProvinces()
     }

     createCardTemplate(province) {
          return `
          <div class="bg-white w-full shadow-md shadow-black/40 rounded-2xl
               overflow-hidden lg:w-72 lg:rounded-3xl">
               <img src="/assets/images/cardIlustrasi.jpg" alt=""
               class="w-full h-32 sm:h-40 object-cover object-center">
               <div class="px-4 pt-2 pb-4 md:pt-3 lg:pb-6 lg:space-y-3">
                    <h2 class="font-semibold text-xl lg:text-2xl">
                         Provinsi ${province.nama}
                    </h2>
                    <div class="space-y-2">
                         <p class="text-sm">
                              Jelajahi berbagai bahasa daerah yang tersebar di seluruh wilayah Indonesia!
                         </p>
                         <button data-province-slug="${province.slug}" 
                         class="explore-btn bg-primary text-white rounded-md px-4 py-2 text-sm
                              lg:font-medium lg:px-6 lg:text-base hover:bg-primary/90 
                              transition-all duration-300">
                              Jelajahi Bahasa
                         </button>
                    </div>
               </div>
          </div>
          `
     }

     renderCards() {
          const isMobile = window.innerWidth < 1024
          const provinceToShow = this.isShowingAll
               ? this.provinces
               : isMobile ? this.provinces.slice(0, 9) : this.provinces.slice(0, 8)

          const cardsHTML = provinceToShow
               .map(province => this.createCardTemplate(province))
               .join('')

          this.container.innerHTML = cardsHTML
     }

     toggleView() {
          this.isShowingAll = !this.isShowingAll
          this.renderCards()
          this.attachEventListeners()
          this.updateViewAllButtonText()
     }

     updateViewAllButtonText() {
          if (this.viewAllButton) {
               this.viewAllButton.textContent = this.isShowingAll
                    ? 'Tampilkan Lebih Sedikit' : 'Lihat Semua'
          }
     }

     updateViewAllButtonVisibility() {
          if (this.viewAllButton) {
               this.viewAllButton.style.display = this.provinces.length <= this.INITIAL_LIMIT ? 'none' : 'block'
          }
     }

     attachEventListeners() {
          const exploreButtons = this.container.querySelectorAll('.explore-btn')
          exploreButtons.forEach(button => {
               button.addEventListener('click', (e) => {
                    const slug = e.target.dataset.provinceSlug
                    this.handleExploreClick(slug)
               })
          })
     }

     handleExploreClick(slug) {
          window.location.href = `/pages/detailPage.html?province=${slug}`
     }
}