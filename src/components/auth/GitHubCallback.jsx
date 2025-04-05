"use client"

import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { FiGithub, FiAlertCircle } from "react-icons/fi"
import toast from "react-hot-toast"

const GitHubCallback = () => {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const { githubLogin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleGitHubCallback = async () => {
      // Get the authorization code from URL
      const searchParams = new URLSearchParams(location.search)
      const code = searchParams.get("code")

      if (!code) {
        setError("No authorization code provided")
        setLoading(false)
        return
      }

      try {
        // Exchange the code for a token
        await githubLogin(code)
        toast.success("Successfully signed in with GitHub!")
        navigate("/dashboard")
      } catch (err) {
        console.error("GitHub authentication error:", err)
        const errorMsg = err.response?.data?.message || "Failed to authenticate with GitHub"
        setError(errorMsg)
        toast.error(errorMsg)
        setLoading(false)
      }
    }

    handleGitHubCallback()
  }, [location, githubLogin, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="animate-pulse mb-4 bg-gray-200 dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <FiGithub className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Authenticating with GitHub</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please wait while we complete the authentication process...
          </p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="bg-red-100 dark:bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Authentication Failed</h2>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => (window.location.href = "/login")}
              className="w-full py-2 px-4 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
            >
              Back to Login
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Go to Home Page
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default GitHubCallback

