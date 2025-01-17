export class DetailManager {
     constructor(apiService) {
          this.apiService = apiService
          this.provinceId = this.getProvinceIdfromUrl()
          this.provinceData = null

          this.languageSectionElement = document.querySelector('.language-section');
          this.funFactSectionElement = document.querySelector('.fun-fact-section')
          this.languageContainer = document.querySelector('.language-container')
          this.funFactContainer = document.querySelector('.fun-fact-container')
     }

     getProvinceIdfromUrl() {
          const urlParams = new URLSearchParams(window.location.search)
          return urlParams.get('provinceId')
     }

     async init() {
          if (!this.provinceId) {
               console.error('Province ID not found in URL')
               return
          }

          try {
               await this.fetchProvinceData()
               this.updateUI()
               this.attachEventListeners()
          } catch (error) {
               console.error('Error initializing detail page:', error)
          }
     }

     async fetchProvinceData() {
          const provinces = await this.apiService.getProvinces()
          this.provinceData = provinces.find(province => province.id.toString() === this.provinceId.toString())

          if (!this.provinceData) {
               throw new error('Province not found')
          }
     }

     updateUI() {
          this.updateTitles()
          this.renderLanguages()
          this.renderFunFacts()
     }

     updateTitles() {
          const provinceName = this.provinceData.attributes.nama
          const languageTitle = `Bahasa di Provinsi ${provinceName}`
          const funFactTitle = `Fakta Menarik Provinsi ${provinceName}`

          if (this.languageSectionElement) {
               this.languageSectionElement.innerHTML = this.createTypography(languageTitle)
          }

          if (this.funFactSectionElement) {
               this.funFactSectionElement.innerHTML = this.createTypography(funFactTitle)
          }
     }

     createTypography(title) {
          return `
          <h1 class='text-2xl md:text-4xl font-bold'>${title}</h1>
          <p class='font-medium text-darkText/80 text-sm md:text-base'>
               Jelajahi berbagai bahasa daerah yang tersebar di seluruh wilayah Indonesia!
          </p>
          `
     }

     createLanguageButton(language) {
          return `
               <button data-language-id="${language.id}"
                    data-target="quizPage"
                    class="bg-primary py-7 w-full text-white font-medium font-poppins rounded-xl 
                    hover:bg-primary/90 transition-all duration-300 lg:text-lg lg:w-72">
                    Bahasa ${language.attributes.nama}
               </button>
          `
     }

     createFunFactCard(funFact) {
          return `
               <div class="bg-white w-full shadow-md shadow-black/40 rounded-2xl overflow-hidden lg:rounded-3xl lg:w-72">
                    <img src="/assets/images/video.png" alt=""
                         class="w-full h-40 object-cover object-center">
                    <div class="px-4 pt-3 pb-5">
                         <h2 class="font-semibold text-xl md:text-2xl">
                              ${funFact.judul || `Fakta menarik provinsi ${this.provinceData.attributes.nama}`}
                         </h2>
                         <p class="text-sm">
                              ${funFact.deskripsi || 'Jelajahi berbagai bahasa daerah yang tersebar di seluruh wilayah Indonesia!'}
                         </p>
                    </div>
               </div>
          `
     }

     renderLanguages() {
          if (!this.languageContainer) return
          const languages = this.provinceData.attributes.bahasas?.data || []
          const languagesHTML = languages.map(language => this.createLanguageButton(language)).join('')
          this.languageContainer.innerHTML = languagesHTML
     }

     renderFunFacts() {
          if (!this.funFactContainer) return
          const funFacts = this.provinceData.attributes.fakta_menariks || []
          if (!funFacts.length) {
               this.funFactContainer.innerHTML = Array(4).fill(funFacts).map(fact => this.createFunFactCard(fact)).join('')
          } else {
               this.funFactContainer.innerHTML = Array(4).fill(funFacts.map(fact => this.createFunFactCard(fact))).join('')
          }
     }

     attachEventListeners() {
          const languageButtons = this.languageContainer.querySelectorAll('button[data-target="quizPage"]')
          languageButtons.forEach(button => {
               button.addEventListener('click', (e) => {
                    const languageId = e.target.dataset.languageId
                    this.handleLanguageClick(languageId)
               })
          })
     }

     handleLanguageClick(languageId) {
          window.location.href = `/pages/quizPage.html?languageId=${languageId}&provinceId=${this.provinceId}`
     }
}