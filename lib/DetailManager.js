export class DetailManager {
     constructor(apiService) {
          this.apiService = apiService
          this.provinceId = this.getProvinceIdfromUrl()
          this.provinceData = null
          this.languageLevels = new Map()

          this.elements = {
               languageSection: document.querySelector('.language-section'),
               funFactSection: document.querySelector('.fun-fact-section'),
               languageContainer: document.querySelector('.language-container'),
               funFactContainer: document.querySelector('.fun-fact-container')
          }
     }

     getProvinceIdfromUrl() {
          return new URLSearchParams(window.location.search).get('provinceId')
     }

     async init() {
          if (!this.provinceId) {
               console.error('Province ID not found in URL')
               return
          }

          try {
               await this.fetchProvincesData()
               await this.fetchLanguagesData()
               this.updateUI()
               this.attachEventListeners()
          } catch (error) {
               console.error('Error initializing detail page:', error)
          }
     }

     async fetchProvincesData() {
          const provinces = await this.apiService.getProvinces()
          this.provinceData = provinces.find(province =>
               province.id.toString() === this.provinceId.toString())

          if (!this.provinceData) {
               throw new error('Province not found')
          }
     }

     async fetchLanguagesData() {
          const languages = this.provinceData.attributes.bahasas?.data || []

          await Promise.all(languages.map(async (language) => {
               const levels = await this.apiService.getLevels(`filters[bahasa][id]=${language.id}`)
               this.languageLevels.set(language.id, levels.length > 0)
          }))
     }

     sortLanguages(languages) {
          return [...languages].sort((a, b) => {
               const hashLevelsA = this.languageLevels.get(a.id)
               const hashLevelsB = this.languageLevels.get(b.id)

               if (hashLevelsA === hashLevelsB) {
                    return a.attributes.nama.localeCompare(b.attributes.nama)
               }

               return hashLevelsB - hashLevelsA
          })
     }

     async getFirstLevelId(languageId) {
          const levels = await this.apiService.getLevels(`filters[bahasa][id]=${languageId}`)
          return levels[0]?.id
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

          if (this.elements.languageSection) {
               this.elements.languageSection.innerHTML = this.createTypography(languageTitle)
          }

          if (this.elements.funFactSection) {
               this.elements.funFactSection.innerHTML = this.createTypography(funFactTitle)
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
          const hasLevels = this.languageLevels.get(language.id)
          const buttonClass = hasLevels
               ? 'bg-primary hover:bg-primary/90'
               : 'bg-graySurface cursor-not-allowed'

          return `
               <button data-language-id="${language.id}"
                    data-target="quizPage"
                    ${!hasLevels ? 'disabled' : ''}
                    class="${buttonClass} py-7 w-full text-white font-medium font-poppins rounded-xl 
                    transition-all duration-300 lg:text-lg lg:w-72">
                    Bahasa ${language.attributes.nama}
               </button>
          `
     }

     createFunFactCard(funFact) {
          return `
               <div class="bg-white w-full shadow-md shadow-black/40 rounded-2xl overflow-hidden lg:rounded-3xl lg:w-72">
                    <img src="/assets/images/cardIlustrasi.jpg" alt=""
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
          if (!this.elements.languageContainer) return

          const languages = this.provinceData.attributes.bahasas?.data || []
          const sortedLanguages = this.sortLanguages(languages)

          const languagesHTML = sortedLanguages
               .map(language => this.createLanguageButton(language))
               .join('')

          this.elements.languageContainer.innerHTML = languagesHTML
     }

     renderFunFacts() {
          if (!this.elements.funFactContainer) return
          const funFacts = this.provinceData.attributes.fakta_menariks || []
          if (!funFacts.length) {
               this.elements.funFactContainer.innerHTML = Array(4)
                    .fill(funFacts)
                    .map(fact => this.createFunFactCard(fact)).join('')
          } else {
               this.elements.funFactContainer.innerHTML = Array(4)
                    .fill(funFacts.map(fact => this.createFunFactCard(fact)))
                    .join('')
          }
     }

     attachEventListeners() {
          const languageButtons = this.elements.languageContainer
               .querySelectorAll('button[data-target="quizPage"]:not([disabled])')

          languageButtons.forEach(button => {
               button.addEventListener('click', async (e) => {
                    const button = e.target
                    const languageId = button.dataset.languageId

                    button.disabled = true
                    const originalText = button.textContent
                    button.textContent = 'Memuat...'

                    try {
                         const levelId = await this.getFirstLevelId(languageId)
                         if (levelId) {
                              this.navigateToQuiz(languageId, levelId)
                         } else {
                              alert('Level tidak tersedia untuk bahasa ini')
                         }
                    } catch (error) {
                         console.error('Error:', error)
                         alert('Gagal memuat level. Silakan coba lagi.')
                    } finally {
                         button.disabled = false
                         button.textContent = originalText
                    }
               })
          })
     }

     navigateToQuiz(languageId, levelId) {
          window.location.href = `/pages/quizPage.html?levelId=${levelId}&languageId=${languageId}&provinceId=${this.provinceId}`
     }
}