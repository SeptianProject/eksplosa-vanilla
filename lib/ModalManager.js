export class Modal {
     constructor(options = {}) {
          this.isOpen = false
          this.options = {
               onClose: options.onClose || (() => { }),
               onAction: options.onAction || (() => { }),
               variant: options.variant || null,
               modalType: options.modalType || null
          }

          this.init()
     }

     init() {
          this.overlay = document.createElement('div')
          this.overlay.className = 'fixed inset-0 bg-black/60 transition-all duration-300 z-50'
          this.overlay.style.display = 'none'

          this.modalContainer = document.createElement('div')
          this.modalContainer.className = `fixed pb-5 pt-3 lg:py-10 bg-white top-1/2 left-1/2 transform 
               -translate-y-1/2 -translate-x-1/2 rounded-2xl w-full sm:h-[90%] sm:w-3/5 lg:h-[28rem] lg:w-[38rem]
               transition-transform duration-300 ease-in-out z-50`

          document.body.appendChild(this.overlay)
          document.body.appendChild(this.modalContainer)
     }

     show(content) {
          const isMobile = window.innerWidth < 768
          this.isOpen = true
          this.modalContainer.innerHTML = content
          this.overlay.style.display = 'block'
          requestAnimationFrame(() => {
               this.overlay.style.opacity = '1'
          })

          requestAnimationFrame(() => {
               this.modalContainer.style.transform = isMobile
                    ? 'translate(-50%, -50%) scale(0.8)'
                    : 'translate(-50%, -50%) scale(1)'
               this.modalContainer.classList.remove('scale-0');
               this.modalContainer.classList.add('scale-100');
          });

          document.body.style.overflow = 'hidden'
          this.setupEventListeners()
     }

     setupEventListeners() {
          const closeBtn = this.modalContainer.querySelector('[data-modal-close]')
          if (closeBtn) {
               closeBtn.addEventListener('click', () => window.location.pathname.includes('quiz')
                    ? location.href = '/' : this.hide())
          }

          const actionBtn = this.modalContainer.querySelector('[data-modal-action]')
          if (actionBtn) {
               actionBtn.addEventListener('click', () => {
                    this.options.onAction()
                    this.hide()
               })
          }
     }

     hide() {
          if (!this.isOpen) return

          this.isOpen = false
          this.overlay.style.opacity = '0'
          this.modalContainer.style.transform = 'translate(-50%, -50%) scale(0)'
          this.modalContainer.classList.remove('scale-100')
          this.modalContainer.classList.add('scale-0')

          setTimeout(() => {
               this.overlay.style.display = 'none'
               document.body.style.overflow = 'auto'
               this.options.onClose()
          }, 300);
     }

     destroy() {
          if (this.isOpen) {
               this.hide()
          }
          setTimeout(() => {
               this.overlay.remove()
               this.modalContainer.remove()
          }, 300);
     }
}

export class ModalManagement {
     constructor() {
          this.currentModal = null
          this.modalConfigs = {
               auth: {
                    title: 'Mulai Penjelajahanmu!',
                    description: 'Bergabung bersama Eksplosa dan temukan berbagai hal menarik disini, bergabunglah dengan metode favoritmu!',
               },
               map: {
                    title: 'Fitur Akan Segera Hadir!',
                    description: 'Halo Sobat Gaca, Fitur Peta Bahasa Daerah akan segera hadir untuk kamu jelajahi, Tunggu kehadirannya dan siap-siap untuk pengalaman seru yang akan datang!'
               },
               quiz: {
                    success: {
                         title: 'Wah Selamat!',
                         description: 'Kamu telah menyelesaikan level ini dengan sangat baik, Gaca ikut bangga sama kamu, terus belajar di level selanjutnya ya!'
                    },
                    failure: {
                         title: 'Tetap Semangat!',
                         description: 'Jangan menyerah! Coba lagi dan raih hasil terbaikmu. Gaca selalu ada untuk mendukungmu!'
                    },
                    information: {
                         title: 'Ngapunten Nggih!',
                         description: 'Selesaikan level ini dengan baik, dan lanjutkan perjalananmu ke level selanjutnya!'
                    }
               }
          }
     }

     showAuthModal() {
          const content = `
          <div class="flex flex-col items-center justify-center gap-y-4 px-7 pt-12 lg:px-16">
               <button data-modal-close class="absolute top-5 right-8 w-fit">
                    <i class="fa-solid fa-xmark text-2xl text-darkText"></i>
               </button>
               <div class="text-center lg:mb-4 space-y-2">
                    <h1 class="text-2xl lg:text-4xl font-bold">${this.modalConfigs.auth.title}</h1>
                    <p class="text-sm text-darkText/80 font-medium">${this.modalConfigs.auth.description}</p>
               </div>
               <div class="flex flex-col gap-y-4">
                    <div class="cursor-pointer text-sm text-darkText/80 font-semibold font-epilogue 
                         flex items-center gap-x-3 bg-white shadow-md shadow-black/30 py-3 px-4 rounded-lg 
                         lg:text-base lg:py-4 lg:pl-4 lg:pr-12">
                         <img src="/assets/images/google.svg" class="size-8 lg:size-12" />
                         <span>Masuk dengan akun Google</span>
                    </div>
                    <div class="cursor-pointer text-sm text-white font-semibold font-epilogue 
                         flex items-center gap-x-3 bg-[#5A85B5] shadow-md shadow-black/30 py-3 px-4 rounded-lg 
                         lg:text-base lg:py-4 lg:pl-4 lg:pr-12">
                         <img src="/assets/images/facebook.svg" class="size-8 lg:size-12" />
                         <span>Masuk dengan akun Facebook</span>
                    </div>
               </div>
          </div>
          `;

          this.showModal('auth', content)
     }

     showMapModal() {
          const content = `
               <div class="flex flex-col items-center justify-center px-5 gap-y-3 lg:px-10">
                    <img src="/assets/images/emote/informationEmote.png" alt="" class="w-40 lg:w-56 lg:mr-5">
                    <div class="text-center lg:space-y-2">
                         <h1 class="text-xl lg:text-3xl font-bold">${this.modalConfigs.map.title}</h1>
                         <p class="text-[12px] lg:text-sm text-textDark/80 font-medium">${this.modalConfigs.map.description}</p>
                    </div>
                    <button data-modal-action class="text-white flex justify-center bg-primary rounded-md 
                         w-36 py-2 text-sm lg:text-base mt-4">
                         Baiklah
                    </button>
               </div>
               `

          this.showModal('map', content)
     }

     showHintModal() {
          const content = `
               <div class="flex flex-col items-center justify-center gap-y-3 px-10">
                    <img src="/assets/images/emote/informationEmote.png" alt="" class="w-64 mr-5">
                    <div class="text-center space-y-2">
                         <h1 class="text-3xl font-bold">Petunjuk Quiz</h1>
                         <p class="text-sm text-textDark/80 font-medium">Putar perangkat Anda ke mode landscape untuk mengikuti tahapan quiz</p>
                    </div>
               </div>`;

          this.showModal('province', content)
     }

     showQuizModal(variant) {
          const config = this.modalConfigs.quiz[variant];
          const content = `
               <div class="flex flex-col items-center justify-center px-5 gap-y-3 lg:px-10">
                    <img src="/assets/images/emote/${variant}Emote.png" alt="" class="w-40 lg:w-64">
                    <div class="text-center lg:space-y-2">
                         <h1 class="text-xl lg:text-3xl font-bold">${config.title}</h1>
                         <p class="text-[12px] lg:text-sm text-textDark/80 font-medium">${config.description}</p>
                    </div>
                    <div class="flex items-center justify-center gap-x-4 pt-5">
                    ${variant === 'information' ?
                    `<button data-modal-action class="text-white flex justify-center bg-primary rounded-md 
                         py-5 w-32 lg:w-40 lg:py-2 text-sm lg:text-base">
                         Baiklah
                    </button>`
                    : `
                    <button data-modal-close class="text-white flex justify-center bg-danger rounded-md 
                              py-2 w-32 lg:w-40 text-sm lg:text-base">
                              Keluar
                    </button>
                    <button data-modal-action class="text-white flex justify-center bg-primary rounded-md 
                         py-2 w-32 lg:w-40 text-sm lg:text-base">
                         ${variant === 'success' ? 'Selanjutnya' : 'Ulangi Kuis'}
                    </button>
                    `}
                    </div>
               </div>
          `;

          this.showModal('quiz', content, { variant });
     }

     showModal(type, content, options = {}) {
          if (this.currentModal) {
               this.currentModal.destroy()
          }

          this.currentModal = new Modal({
               modalTye: type,
               ...options,
               onClose: () => {
                    if (type === 'map') {
                         window.history.back()
                    }
               },
          })

          this.currentModal.show(content)
     }
}