"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"
import ResourceCard from "../components/resources/ResourceCard"

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchBookmarks()
  }, [])

  const fetchBookmarks = async () => {
    try {
      setLoading(true)
      const response = await api.get("/api/users/bookmarks")
      setBookmarks(response.data)
      setError(null)
    } catch (err) {
      console.error("Error fetching bookmarks:", err)
      setError("Failed to load your bookmarks. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const removeBookmark = async (resourceId) => {
    try {
      await api.post(`/api/resources/${resourceId}/bookmark`)
      setBookmarks(bookmarks.filter((bookmark) => bookmark._id !== resourceId))
    } catch (error) {
      console.error("Error removing bookmark:", error)
      alert("Failed to remove bookmark")
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Bookmarks</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md text-center">{error}</div>
      ) : bookmarks.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">You haven't bookmarked any resources yet</h3>
          <p className="text-gray-600 mb-6">Bookmark resources to access them quickly later</p>
          <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700">
            Browse Resources
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((bookmark) => (
            <div key={bookmark._id} className="relative">
              <button
                onClick={() => removeBookmark(bookmark._id)}
                className="absolute top-2 right-2 z-10 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                title="Remove bookmark"
              >
                <span className="text-yellow-500">⭐</span>
              </button>
              <ResourceCard resource={bookmark} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Bookmarks

