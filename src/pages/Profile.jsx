"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"

const Profile = () => {
  const { currentUser } = useAuth()
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
  const [stats, setStats] = useState({
    uploads: 0,
    bookmarks: 0,
    reviews: 0,
    totalViews: 0,
    totalDownloads: 0,
  })

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
    } catch (err) {
      console.error("Error updating profile:", err)
      setError(err.response?.data?.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      return setError("New passwords do not match")
    }

    if (formData.newPassword.length < 6) {
      return setError("New password must be at least 6 characters long")
    }

    try {
      setError("")
      setSuccess("")
      setLoading(true)

      const response = await api.put("/api/users/password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      })

      setSuccess("Password updated successfully")

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
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              {currentUser?.name?.charAt(0) || "U"}
            </div>
            <h2 className="text-xl font-semibold">{currentUser?.name}</h2>
            <p className="text-gray-600">UID: {currentUser?.uid}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Activity Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-blue-600">{stats.uploads}</div>
              <div className="text-sm text-gray-600">Uploads</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-yellow-600">{stats.bookmarks}</div>
              <div className="text-sm text-gray-600">Bookmarks</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-green-600">{stats.reviews}</div>
              <div className="text-sm text-gray-600">Reviews</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-purple-600">{stats.totalViews}</div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
            <div className="bg-pink-50 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-pink-600">{stats.totalDownloads}</div>
              <div className="text-sm text-gray-600">Total Downloads</div>
            </div>
          </div>
        </div>
      </div>

      {(error || success) && (
        <div className={`p-4 rounded-md mb-6 ${error ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
          {error || success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Update Profile</h2>
          <form onSubmit={handleProfileUpdate}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="uid" className="block text-gray-700 font-medium mb-2">
                University ID (UID)
              </label>
              <input
                type="text"
                id="uid"
                name="uid"
                value={formData.uid}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Change Password</h2>
          <form onSubmit={handlePasswordUpdate}>
            <div className="mb-4">
              <label htmlFor="currentPassword" className="block text-gray-700 font-medium mb-2">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-2">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Updating..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile

