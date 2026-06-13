import axios from 'axios'

const api = axios.create({
    baseURL: 'https://campus-resell-i17a.onrender.com/api',
    withCredentials: true
})

export default api