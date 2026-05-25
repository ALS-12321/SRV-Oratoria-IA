import axios from 'axios'

const api = axios.create({
  baseURL: 'https://srv-backend.onrender.com'
})

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('srv_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export default api
