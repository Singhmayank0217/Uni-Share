"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { motion } from "framer-motion"
import { FiLock, FiKey, FiAlertCircle, FiCheckCircle } from "react-icons/fi"

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const { resetPassword } = useAuth()

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Validate the token
  useEffect(() => {
    if (!token) {
      setError("Invalid reset token. Please request a new password reset link.")
    }
  }, [token])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate passwords
    if (formData.newPassword.length < 6) {
      return setError("Password must be at least 6 characters long")
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return setError("Passwords do not match")
    }

    try {
      setLoading(true)
      setError("")

      await resetPassword(token, formData.newPassword)
      setSuccess(true)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login")
      }, 3000)
    } catch (err) {
      console.error("Password reset error:", err)
      setError(err.response?.data?.message || "Failed to reset password. The link may have expired.")
    } finally {
      setLoading(false)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 relative z-10 auth-container">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
            <motion.div className="text-center" variants={itemVariants}>
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Reset Your Password
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Create a new password for your account</p>
            </motion.div>

            {error && (
              <motion.div
                className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg text-sm flex items-start"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {success ? (
              <motion.div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-lg" variants={itemVariants}>
                <div className="flex items-start">
                  <FiCheckCircle className="text-emerald-600 dark:text-emerald-400 w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-emerald-800 dark:text-emerald-300">Password reset successfully!</h3>
                    <p className="text-emerald-700 dark:text-emerald-400 text-sm mt-1">
                      Your password has been updated. You'll be redirected to the login page in a few seconds.
                    </p>
                    <Link
                      to="/login"
                      className="mt-3 inline-block text-emerald-700 dark:text-emerald-400 underline text-sm font-medium"
                    >
                      Go to login page
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.form onSubmit={handleSubmit} className="space-y-6" variants={itemVariants}>
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiKey className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-white transition-colors duration-200"
                      placeholder="Create a new password"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      >
                        {showPassword ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path
                              fillRule="evenodd"
                              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                              clipRule="evenodd"
                            />
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Password must be at least 6 characters long
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-white transition-colors duration-200"
                      placeholder="Confirm your new password"
                      required
                    />
                  </div>
                </div>

                <div>
                  <motion.button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-md transition-all duration-200"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                        Resetting Password...
                      </div>
                    ) : (
                      "Reset Password"
                    )}
                  </motion.button>
                </div>
              </motion.form>
            )}

            <motion.div className="text-center mt-6" variants={itemVariants}>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  Back to login
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword

