import axios from "axios"

const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL
  }

  if (typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    return "http://localhost:5000"
  }

  return "https://uni-share.onrender.com"
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
})

export default api

