"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"
import { toast } from "react-hot-toast"
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi"

const Profile = () => {
  const { currentUser, updatePassword } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    uid: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [stats, setStats] = useState({
    uploads: 0,
    bookmarks: 0,
    reviews: 0,
    totalViews: 0,
    totalDownloads: 0,
  })

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        uid: currentUser.uid || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      fetchUserStats()
    }
  }, [currentUser])

  const fetchUserStats = async () => {
    try {
      const response = await api.get("/api/users/stats")
      setStats(response.data)
    } catch (error) {
      console.error("Error fetching user stats:", error)
      toast.error("Failed to load user statistics")
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()

    try {
      setError("")
      setSuccess("")
      setLoading(true)

      const response = await api.put("/api/users/profile", {
        name: formData.name,
        email: formData.email,
        uid: formData.uid,
      })

      setSuccess("Profile updated successfully")
      toast.success("Profile updated successfully")
    } catch (err) {
      console.error("Error updating profile:", err)
      setError(err.response?.data?.message || "Failed to update profile")
      toast.error(err.response?.data?.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match")
      toast.error("New passwords do not match")
      return
    }

    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long")
      toast.error("New password must be at least 6 characters long")
      return
    }

    try {
      setError("")
      setSuccess("")
      setPasswordLoading(true)

      await updatePassword(formData.currentPassword, formData.newPassword)

      setSuccess("Password updated successfully")
      toast.success("Password updated successfully. Please use your new password next time you log in.")

      // Reset password fields
      setFormData((prevState) => ({
        ...prevState,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))
    } catch (err) {
      console.error("Error updating password:", err)
      setError(err.response?.data?.message || "Failed to update password")
      toast.error(err.response?.data?.message || "Failed to update password")
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
              {currentUser?.name?.charAt(0) || "U"}
            </div>
            <h2 className="text-xl font-semibold">{currentUser?.name}</h2>
            <p className="text-gray-600 dark:text-gray-400">UID: {currentUser?.uid}</p>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{currentUser?.email}</p>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-center space-x-2">
                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs px-2 py-1 rounded-full">
                  {currentUser?.role || "Student"}
                </span>
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
                  Member since {new Date(currentUser?.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Activity Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.uploads}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Uploads</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{stats.bookmarks}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Bookmarks</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-green-600 dark:text-green-400">{stats.reviews}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Reviews</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{stats.totalViews}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Views</div>
            </div>
            <div className="bg-pink-50 dark:bg-pink-900/20 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-pink-600 dark:text-pink-400">{stats.totalDownloads}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Downloads</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Update Profile</h2>

          {success && (
            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-md mb-6 flex items-start">
              <FiCheckCircle className="text-green-600 dark:text-green-400 mt-0.5 mr-2 flex-shrink-0" />
              <span className="text-green-700 dark:text-green-300">{success}</span>
            </div>
          )}

          <form onSubmit={handleProfileUpdate}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="uid" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                University ID (UID)
              </label>
              <input
                type="text"
                id="uid"
                name="uid"
                value={formData.uid}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Change Password</h2>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-md mb-6 flex items-start">
              <FiAlertCircle className="text-red-600 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" />
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </div>
          )}

          <form onSubmit={handlePasswordUpdate}>
            <div className="mb-4">
              <label htmlFor="currentPassword" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  {showCurrentPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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

            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  {showNewPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Password must be at least 6 characters long
              </p>
            </div>

            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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

            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              disabled={passwordLoading}
            >
              {passwordLoading ? "Updating..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile

