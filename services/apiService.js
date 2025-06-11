const BASE_URL = "https://eksplosa-dashboard.vercel.app/api"

class ApiService {
     constructor(baseUrl) {
          this.baseUrl = baseUrl
     }

     async fetchData(endpoint) {
          try {
               const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
               const url = `${this.baseUrl}${normalizedEndpoint}`

               // console.log(`Fetching data from: ${url}`)
               const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                         'Accept': 'application/json',
                         'Content-Type': 'application/json'
                    },
               })

               if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
               }

               const data = await response.json()
               return data
          } catch (error) {
               console.error(`Error fetching ${endpoint}:`, error);
               throw Error(`Failed to fetch data from ${endpoint}: ${error.message}`);
          }
     }

     async getProvinces() {
          return this.fetchData('/provinsis?sort=nama:asc')
     }
     async getLanguages(slug) {
          if (slug) {
               return this.fetchData('/bahasas/' + slug)
          } else {
               return this.fetchData('/bahasas')
          }
     }
     async getLevels(slug) {
          if (slug) {
               return this.fetchData('/levels/' + slug)
          } else {
               return this.fetchData('/levels')
          }
     }
     async getQuestions(params) {
          return this.fetchData(`/soals?${params}`)
     }

}

export const apiService = new ApiService(BASE_URL)