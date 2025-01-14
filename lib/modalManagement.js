import { Modal } from "./modal.js";

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
          <div class="flex flex-col items-center justify-center gap-y-4 px-7 pt-14 md:px-16">
               <button data-modal-close class="absolute top-5 right-8 w-fit">
                    <i class="fa-solid fa-xmark text-2xl text-darkText"></i>
               </button>
               <div class="text-center mb-4 space-y-2">
                    <h1 class="text-2xl md:text-4xl font-bold">${this.modalConfigs.auth.title}</h1>
                    <p class="text-sm text-darkText/80 font-medium">${this.modalConfigs.auth.description}</p>
               </div>
               <div class="flex flex-col gap-y-4">
                    <div class="cursor-pointer text-sm text-darkText/80 font-semibold font-epilogue 
                         flex items-center gap-x-3 bg-white shadow-md shadow-black/30 py-3 px-4 rounded-lg 
                         md:text-base md:py-4 md:pl-4 md:pr-12">
                         <img src="/assets/images/google.svg" class="size-10 md:size-12" />
                         <span>Masuk dengan akun Google</span>
                    </div>
                    <div class="cursor-pointer text-sm text-white font-semibold font-epilogue 
                         flex items-center gap-x-3 bg-[#5A85B5] shadow-md shadow-black/30 py-3 px-4 rounded-lg 
                         md:text-base md:py-4 md:pl-4 md:pr-12">
                         <img src="/assets/images/facebook.svg" class="size-10 md:size-12" />
                         <span>Masuk dengan akun Facebook</span>
                    </div>
               </div>
          </div>
          `;

          this.showModal('auth', content)
     }

     showMapModal() {
          const content = `
               <div class="flex flex-col items-center justify-center px-5 gap-y-3 md:px-10">
                    <img src="/assets/images/emote/informationEmote.png" alt="" class="w-52 md:w-64 mr-5">
                    <div class="text-center space-y-2">
                         <h1 class="text-2xl md:text-3xl font-bold">${this.modalConfigs.map.title}</h1>
                         <p class="text-sm text-textDark/80 font-medium">${this.modalConfigs.map.description}</p>
                    </div>
                    <button data-modal-action class="text-white flex justify-center bg-primary rounded-md 
                         w-36 py-2 text-sm xs:text-base mt-4">
                         Baiklah
                    </button>
               </div>`;

          this.showModal('map', content)
     }

     showQuizModal(variant) {
          const config = this.modalConfigs.quiz[variant];
          const content = `
               <div class="flex flex-col items-center justify-center px-5 gap-y-3 md:px-10">
                    <img src="/assets/images/emote/${variant}Emote.png" alt="" class="w-52 md:w-64">
                    <div class="text-center space-y-2">
                         <h1 class="text-2xl md:text-3xl font-bold">${config.title}</h1>
                         <p class="text-sm text-textDark/80 font-medium">${config.description}</p>
                    </div>
                    <div class="flex items-center justify-center gap-x-4 pt-5">
                    ${variant === 'information' ?
                    `<button data-modal-action class="text-white flex justify-center bg-primary rounded-md 
                         w-40 py-2 text-sm xs:text-base">
                         Baiklah
                    </button>`
                    : `
                    <button data-modal-close class="text-white flex justify-center bg-danger rounded-md 
                              w-40 py-2 text-sm xs:text-base">
                              Keluar
                    </button>
                    <button data-modal-action class="text-white flex justify-center bg-primary rounded-md 
                         w-40 py-2 text-sm xs:text-base">
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
                    if (location.pathname.includes('map') && type === 'auth') {
                         window.history.back()
                    }
               },
               onAction: () => {
                    if (type === 'quiz') {
                         if (options.variant === 'success') {
                              this.showQuizModal('success')
                         } else if (options.variant === 'information') {
                              this.showQuizModal('information')
                         } else {
                              this.showQuizModal('failure')
                         }
                    } else if (type === 'map') {
                         this.showAuthModal()
                         if (type === 'auth') {
                         }
                    }
               }
          })

          this.currentModal.show(content)
     }
}