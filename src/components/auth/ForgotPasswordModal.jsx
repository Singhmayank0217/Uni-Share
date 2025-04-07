"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FiMail, FiX, FiAlertCircle, FiCheckCircle } from "react-icons/fi"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-hot-toast"
import api from "../../utils/api"

const ForgotPasswordModal = ({ onClose }) => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const { forgotPassword } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email) {
      setError("Please enter your email address")
      return
    }

    try {
      setLoading(true)
      setError("")

      const response = await api.post("/api/users/forgot-password", { email })

      setSuccess(response.data.message || "Password reset email sent. Please check your inbox.")
      toast.success("Password reset email sent")
    } catch (err) {
      console.error("Forgot password error:", err)
      const errorMessage = err.response?.data?.message || "Failed to send password reset email"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 max-w-md w-full relative border border-gray-200 dark:border-gray-700"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus:outline-none"
          aria-label="Close"
        >
          <FiX className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Forgot Your Password?</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {success
              ? "Check your email for a link to reset your password."
              : "Enter your email address, and we'll send you a link to reset your password."}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md flex items-start">
            <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg mb-6">
            <div className="flex items-center">
              <FiCheckCircle className="text-emerald-600 dark:text-emerald-400 w-5 h-5 mr-2" />
              <p className="text-emerald-700 dark:text-emerald-300">
                If an account with that email exists, you'll receive a password reset link shortly. Please check your
                email.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-white transition-colors duration-200"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  )
}

export default ForgotPasswordModal

