const BASE_URL = "https://devoted-life-94225c6364.strapiapp.com/api"

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
          return await this.fetchData('/provinsis')
     }
     async getLanguages() {
          return this.fetchData('/bahasas')
     }
     async getLevels() {
          return this.fetchData('/levels')
     }
     async getQuestions() {
          return this.fetchData('/soals')
     }
}

export const apiService = new ApiService(BASE_URL)