const BASE_URL = "https://special-connection-7298fdbd7e.strapiapp.com/api"

class ApiService {
     constructor(baseUrl) {
          this.baseUrl = baseUrl
     }

     async fetchData(endpoint) {
          try {
               const response = await fetch(`${this.baseUrl}${endpoint}`)

               if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
               }

               const data = await response.json()
               return data.data
          } catch (error) {
               console.error(`Error fetching ${endpoint}:`, error);
               throw error
          }
     }

     async getProvinces() {
          return await this.fetchData('/provinsis?sort=nama:asc')
     }
     async getLanguages() {
          return this.fetchData('/bahasas')
     }
     async getLevels(params) {
          return this.fetchData(`/levels?${params}`)
     }
     async getQuestions(params) {
          return this.fetchData(`/soals?${params}`)
     }
}

export const apiService = new ApiService(BASE_URL)