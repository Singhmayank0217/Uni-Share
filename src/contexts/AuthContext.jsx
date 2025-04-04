"use client"

import { createContext, useState, useEffect, useContext } from "react"
import api from "../services/api"

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on page load
    const token = localStorage.getItem("token")
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      fetchUserProfile()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/api/users/profile")
      setCurrentUser(response.data)
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post("/api/auth/login", { email, password })
      const { token, user } = response.data

      localStorage.setItem("token", token)
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setCurrentUser(user)
      return user
    } catch (error) {
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post("/api/auth/register", userData)
      const { token, user } = response.data

      localStorage.setItem("token", token)
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setCurrentUser(user)
      return user
    } catch (error) {
      throw error
    }
  }

  const githubLogin = async (code) => {
    try {
      const response = await api.post("/api/auth/github", { code })
      const { token, user } = response.data

      localStorage.setItem("token", token)
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setCurrentUser(user)
      return user
    } catch (error) {
      throw error
    }
  }

  const googleLogin = async (token) => {
    try {
      const response = await api.post("/api/auth/google", { token })
      const { token: authToken, user } = response.data

      localStorage.setItem("token", authToken)
      api.defaults.headers.common["Authorization"] = `Bearer ${authToken}`
      setCurrentUser(user)
      return user
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    delete api.defaults.headers.common["Authorization"]
    setCurrentUser(null)
  }

  const forgotPassword = async (email) => {
    try {
      const response = await api.post("/api/users/forgot-password", { email })
      return response.data
    } catch (error) {
      throw error
    }
  }

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await api.post("/api/users/reset-password", { token, newPassword })
      return response.data
    } catch (error) {
      throw error
    }
  }

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const response = await api.put("/api/users/password", { currentPassword, newPassword })

      // If the server returns a new token, update it
      if (response.data.token) {
        localStorage.setItem("token", response.data.token)
        api.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`
      }

      return response.data
    } catch (error) {
      throw error
    }
  }

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading,
    githubLogin,
    googleLogin,
    forgotPassword,
    resetPassword,
    updatePassword,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

