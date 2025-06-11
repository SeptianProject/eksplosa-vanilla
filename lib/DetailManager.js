export class DetailManager {
     constructor(apiService) {
          this.apiService = apiService
          this.slug = this.getSlugfromUrl()
          this.provinceData = null
          this.languageLevels = new Map()

          this.elements = {
               languageSection: document.querySelector('.language-section'),
               funFactSection: document.querySelector('.fun-fact-section'),
               languageContainer: document.querySelector('.language-container'),
               funFactContainer: document.querySelector('.fun-fact-container')
          }
     }

     getSlugfromUrl() {
          return new URLSearchParams(window.location.search).get('province')
     }

     async init() {
          if (!this.slug) {
               console.error('Province slug not found in URL')
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
          this.provinceData = provinces.find(province => province.slug === this.slug)
          console.log('Province data:', this.provinceData)

          if (!this.provinceData) {
               throw new Error('Province not found')
          }
     }

     async fetchLanguagesData() {
          const languages = await this.provinceData.provinsis_bahasas || []
          console.log('Fetched languages:', languages)

          await Promise.all(languages.map(async (language) => {
               const levels = await this.apiService.getLevels(language.soal)
               console.log(`Levels for ${language.bahasa.nama}:`, levels)
               this.languageLevels.set(language.bahasa.slug, levels.length > 0)
          }))
     }

     sortLanguages(languages) {
          return [...languages].sort((a, b) => {
               const hashLevelsA = this.languageLevels.get(a.bahasa.slug)
               const hashLevelsB = this.languageLevels.get(b.bahasa.slug)

               if (hashLevelsA === hashLevelsB) {
                    return a.bahasa.slug.localeCompare(b.bahasa.slug)
               }

               return hashLevelsB - hashLevelsA
          })
     }

     async getFirstLevelId(languageId) {
          const levels = await this.apiService.getLevels()
          return levels[0]?.slug
     }

     updateUI() {
          this.updateTitles()
          this.renderLanguages()
          this.renderFunFacts()
     }

     updateTitles() {
          const provinceName = this.provinceData.nama
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
          const hasLevels = this.languageLevels.get(language.bahasa.slug)
          const buttonClass = hasLevels
               ? 'bg-primary hover:bg-primary/90'
               : 'bg-graySurface cursor-not-allowed'

          return `
               <button data-language-id="${language.bahasa.slug}"
                    data-target="quizPage"
                    ${!hasLevels ? 'disabled' : ''}
                    class="${buttonClass} py-7 w-full text-white font-medium font-poppins rounded-xl 
                    transition-all duration-300 lg:text-lg lg:w-72">
                    Bahasa ${language.bahasa.nama}
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

     async renderLanguages() {
          if (!this.elements.languageContainer) return
          const languages = this.provinceData.provinsis_bahasas || []
          const sortedLanguages = this.sortLanguages(languages)

          const languagesHTML = sortedLanguages
               .map(language => this.createLanguageButton(language))
               .join('')

          this.elements.languageContainer.innerHTML = languagesHTML
     }

     renderFunFacts() {
          if (!this.elements.funFactContainer) return
          const funFacts = this.provinceData.fakta_menarik || []
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
          window.location.href = `/pages/quizPage.html?level=${levelId}&language=${languageId}&province=${this.slug}`
     }
}