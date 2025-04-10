"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { motion } from "framer-motion"
import { FiUser, FiLock, FiMail, FiUserPlus, FiArrowRight, FiHash } from "react-icons/fi"

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    uid: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setError("Name is required")
      return false
    }
    if (!formData.uid.trim()) {
      setError("University ID is required")
      return false
    }
    if (!formData.email.trim()) {
      setError("Email is required")
      return false
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    return true
  }

  const nextStep = () => {
    if (validateStep1()) {
      setError("")
      setCurrentStep(2)
    }
  }

  const prevStep = () => {
    setError("")
    setCurrentStep(1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateStep2()) {
      return
    }

    try {
      setError("")
      setLoading(true)

      await register({
        name: formData.name,
        uid: formData.uid,
        email: formData.email,
        password: formData.password,
      })

      navigate("/dashboard")
    } catch (err) {
      console.error("Registration error:", err)
      setError(err.response?.data?.message || "Failed to create an account")
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

  const slideVariants = {
    hidden: { x: currentStep === 1 ? -300 : 300, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      x: currentStep === 1 ? 300 : -300,
      opacity: 0,
      transition: { duration: 0.2 },
    },
  }

  return (
    <div className="min-h-screen flex items-start justify-center py-16 px-4 sm:px-6 lg:px-8 relative z-10 auth-container">
      <div className="max-w-md w-full relative">
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r from-emerald-300 to-teal-300 dark:from-emerald-600 dark:to-teal-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-r from-purple-300 to-indigo-300 dark:from-purple-600 dark:to-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute inset-0 bg-white dark:bg-gray-900 rounded-2xl shadow-xl z-10 p-8 border border-gray-200 dark:border-gray-700">
          <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
            <motion.div className="text-center" variants={itemVariants}>
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent -mt-4">
                {currentStep === 1 ? "Create Account" : "Set Password"}
              </h2>
              <p className="mt-5 text-sm text-gray-600 dark:text-gray-400">
                {currentStep === 1 ? "Join our community of learners" : "Choose a secure password for your account"}
              </p>
            </motion.div>

            {error && (
              <motion.div
                className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}

            <div className="relative">
              {/* Step indicators */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      currentStep >= 1
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    1
                  </div>
                  <div
                    className={`w-12 h-1 ${currentStep >= 2 ? "bg-emerald-600" : "bg-gray-200 dark:bg-gray-700"}`}
                  ></div>
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      currentStep >= 2
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    2
                  </div>
                </div>
              </div>

              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <motion.div
                  variants={slideVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-white transition-colors duration-200"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="uid" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      University ID
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiHash className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="uid"
                        name="uid"
                        type="text"
                        autoComplete="off"
                        required
                        value={formData.uid}
                        onChange={handleChange}
                        className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-white transition-colors duration-200"
                        placeholder="Enter your university ID"
                      />
                    </div>
                  </div>

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
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-white transition-colors duration-200"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>

                  <div>
                    <motion.button
                      type="button"
                      onClick={nextStep}
                      className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-md transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Continue <FiArrowRight className="ml-2" />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Password */}
              {currentStep === 2 && (
                <motion.form
                  onSubmit={handleSubmit}
                  variants={slideVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-white transition-colors duration-200"
                        placeholder="Create a password"
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
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-white transition-colors duration-200"
                        placeholder="Confirm your password"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <motion.button
                      type="button"
                      onClick={prevStep}
                      className="group relative w-1/2 flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-sm transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Back
                    </motion.button>

                    <motion.button
                      type="submit"
                      className="group relative w-1/2 flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-md transition-all duration-200"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                        <FiUserPlus className="h-5 w-5 text-emerald-200 group-hover:text-emerald-100" />
                      </span>
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
                          Signing up...
                        </div>
                      ) : (
                        <span>Sign Up</span>
                      )}
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </div>

            <motion.div className="text-center mt-6" variants={itemVariants}>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  Sign in
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Register

