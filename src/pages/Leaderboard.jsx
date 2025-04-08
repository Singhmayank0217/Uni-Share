"use client"

import { useState, useEffect } from "react"
import api from "../services/api"

const Leaderboard = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("uploads")

  useEffect(() => {
    fetchLeaderboard()
  }, [activeTab])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/leaderboard?type=${activeTab}`)
      setUsers(response.data)
      setError(null)
    } catch (err) {
      console.error("Error fetching leaderboard:", err)
      setError("Failed to load leaderboard. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Contributor Leaderboard</h1>
        <p className="text-gray-600">Recognizing top contributors who share high-quality resources</p>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex justify-center">
            <button
              className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                activeTab === "uploads"
                  ? "border-b-2 border-blue-500 text-blue-600 dark:border-teal-500 dark:text-teal-400"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("uploads")}
            >
              Most Uploads
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                activeTab === "downloads"
                  ? "border-b-2 border-blue-500 text-blue-600 dark:border-teal-500 dark:text-teal-400"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("downloads")}
            >
              Most Downloads
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                activeTab === "ratings"
                  ? "border-b-2 border-blue-500 text-blue-600 dark:border-teal-500 dark:text-teal-400"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("ratings")}
            >
              Highest Ratings
            </button>
          </nav>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md text-center">{error}</div>
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">No users found</h3>
          <p className="text-gray-600">Be the first to upload resources and appear on the leaderboard!</p>
        </div>
      ) : (
        <div className="bg-white rounded-[10px] shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-300 ">
            <thead className="bg-blue-500 dark:bg-teal-400">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  Rank
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  {activeTab === "uploads" ? "Uploads" : activeTab === "downloads" ? "Downloads" : "Average Rating"}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  Resources
                </th>
              </tr>
            </thead>
            <tbody className="bg-white  divide-y divide-gray-200">
              {users.map((user, index) => (
                <tr key={user._id} className={index < 3 ? "bg-blue-50" : ""}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {index < 3 ? (
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 dark:bg-teal-400 text-white font-bold">
                          {index + 1}
                        </span>
                      ) : (
                        <span className="text-gray-900 font-medium">{index + 1}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-500 dark:bg-teal-400 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">UID: {user.uid}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-semibold">
                      {activeTab === "ratings"
                        ? (user.averageRating || 0).toFixed(1) + " ⭐"
                        : activeTab === "downloads"
                          ? user.downloads
                          : user.uploads}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.resourceCount} resources</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Leaderboard

