"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"
import ReviewForm from "../components/resources/ReviewForm"
import ReviewList from "../components/resources/ReviewList"
import {
  FiDownload,
  FiStar,
  FiEye,
  FiMessageSquare,
  FiBookmark,
  FiUser,
  FiCalendar,
  FiTag,
  FiBook,
  FiTrash2,
  FiAlertTriangle,
  FiExternalLink,
  FiFileText,
  FiCloud,
} from "react-icons/fi"
import toast from "react-hot-toast"

const ResourceDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchResourceDetails = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/resources/${id}`)
      console.log("Resource data:", response.data)
      setResource(response.data)
      setIsBookmarked(response.data.isBookmarked)
      setError(null)
    } catch (err) {
      console.error("Error fetching resource details:", err)
      setError("Failed to load resource details. Please try again later.")
      toast.error("Failed to load resource details")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchResourceDetails()
  }, [fetchResourceDetails])

  const handleDownload = async (file) => {
    try {
      if (!file || !file.downloadUrl) {
        toast.error("Download URL is missing")
        return
      }

      // Increment the download count via API
      await api.post(`/api/resources/${id}/increment-downloads`)

      // Open the download URL in a new tab
      window.open(file.downloadUrl, "_blank")

      toast.success("Download started")
    } catch (err) {
      console.error("Error downloading resource:", err)
      toast.error("Failed to download resource. Please try again later.")
    }
  }

  const handleViewFile = (file) => {
    if (!file || !file.viewUrl) {
      toast.error("View URL is missing")
      return
    }

    window.open(file.viewUrl, "_blank")
  }

  const handleBookmark = async () => {
    if (!currentUser) {
      toast.error("Please login to bookmark resources")
      return
    }

    try {
      await api.post(`/api/resources/${id}/bookmark`)
      setIsBookmarked(!isBookmarked)
      toast.success(isBookmarked ? "Bookmark removed" : "Resource bookmarked")
    } catch (error) {
      console.error("Error bookmarking resource:", error)
      toast.error("Failed to bookmark resource")
    }
  }

  const handleReviewSubmit = async (reviewData) => {
    try {
      await api.post(`/api/resources/${id}/reviews`, reviewData)
      fetchResourceDetails() // Refresh the resource data to include the new review
      return true
    } catch (error) {
      console.error("Error submitting review:", error)
      throw error
    }
  }

  const handleDeleteResource = async () => {
    if (!currentUser || !resource || !resource.isOwner) {
      toast.error("You can only delete your own resources")
      return
    }

    try {
      setDeleteLoading(true)
      await api.delete(`/api/resources/${id}`)
      toast.success("Resource deleted successfully")
      navigate("/dashboard") // Redirect to dashboard after deletion
    } catch (error) {
      console.error("Error deleting resource:", error)
      toast.error("Failed to delete resource")
    } finally {
      setDeleteLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  // Helper functions to safely get subject and branch names
  const getSubjectName = () => {
    if (!resource || !resource.subject) return "Unknown Subject"
    if (typeof resource.subject === "string") return resource.subject
    if (typeof resource.subject === "object" && resource.subject.name) return resource.subject.name
    return "Unknown Subject"
  }

  const getBranchName = () => {
    if (!resource || !resource.branch) return ""
    if (typeof resource.branch === "string") return resource.branch
    if (typeof resource.branch === "object" && resource.branch.name) return resource.branch.name
    return ""
  }

  const getStorageLabel = () => {
    const firstFile = resource?.files?.[0]
    if (!firstFile) return "Unavailable"

    if (firstFile.source === "drive") return "Google Drive"
    if (firstFile.source === "cloudinary") return "Cloudinary"
    if (firstFile.source === "local") return "Local Server"

    return "Unknown"
  }

  // Get file icon based on mimetype
  const getFileIcon = (file) => {
    const mimeType = file.mimetype || file.mimeType || ""

    if (mimeType.includes("pdf")) {
      return "text-red-500"
    } else if (mimeType.includes("word") || mimeType.includes("document")) {
      return "text-blue-500"
    } else if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) {
      return "text-green-500"
    } else if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) {
      return "text-orange-500"
    } else if (mimeType.includes("image")) {
      return "text-purple-500"
    } else if (mimeType.includes("zip") || mimeType.includes("compressed")) {
      return "text-yellow-500"
    } else {
      return "text-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error || !resource) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md text-center shadow-md">
        {error || "Resource not found"}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex items-center text-red-500 mb-4">
              <FiAlertTriangle className="w-6 h-6 mr-2" />
              <h3 className="text-xl font-bold">Delete Resource</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete this resource? This action cannot be undone and all associated files will
              be permanently removed.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteResource}
                className="px-4 py-2 bg-red-600 rounded-md text-white hover:bg-red-700 transition-colors flex items-center"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 className="mr-1" /> Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 mb-8">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {resource.title}
              </h1>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 flex-wrap gap-2">
                <span className="flex items-center gap-1">
                  <FiBook className="text-blue-500" /> {getBranchName()}
                </span>
                <span className="flex items-center gap-1">
                  <FiBook className="text-green-500" /> {getSubjectName()}
                </span>
                <span className="flex items-center gap-1">
                  <FiCalendar className="text-purple-500" /> Semester {resource.semester}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {resource.isOwner && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-500 hover:text-red-700 focus:outline-none transition-transform hover:scale-110"
                  title="Delete this resource"
                >
                  <FiTrash2 className="w-6 h-6" />
                </button>
              )}
              <button
                onClick={handleBookmark}
                className={`text-3xl focus:outline-none transition-transform hover:scale-110 ${
                  isBookmarked ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"
                }`}
                title={isBookmarked ? "Remove bookmark" : "Bookmark this resource"}
              >
                <FiBookmark className={`w-6 h-6 ${isBookmarked ? "fill-yellow-500 text-yellow-500" : ""}`} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {resource.tags &&
              resource.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-800 dark:text-blue-200 text-xs px-3 py-1 rounded-full shadow-sm flex items-center gap-1"
                >
                  <FiTag className="text-blue-500" /> {tag}
                </span>
              ))}
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6 shadow-inner">
            <h3 className="text-lg font-semibold mb-2 dark:text-white">Description</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{resource.description}</p>
          </div>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-3 shadow-md">
                {resource.uploader && resource.uploader.name ? resource.uploader.name.charAt(0) : "U"}
              </div>
              <div>
                <p className="font-medium dark:text-white flex items-center gap-1">
                  <FiUser className="text-blue-500" /> Uploaded by {resource.uploader && resource.uploader.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  UID: {resource.uploader && resource.uploader.uid}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <FiCalendar />
              {new Date(resource.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 p-4 rounded-lg text-center shadow-sm">
              <div className="flex items-center justify-center gap-2 text-2xl mb-1 dark:text-white">
                <FiEye className="text-blue-500" /> {resource.views}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Views</div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 p-4 rounded-lg text-center shadow-sm">
              <div className="flex items-center justify-center gap-2 text-2xl mb-1 dark:text-white">
                <FiDownload className="text-green-500" /> {resource.downloads}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Downloads</div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 p-4 rounded-lg text-center shadow-sm">
              <div className="flex items-center justify-center gap-2 text-2xl mb-1 dark:text-white">
                <FiStar className="text-yellow-500" /> {resource.averageRating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Average Rating</div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 p-4 rounded-lg text-center shadow-sm">
              <div className="flex items-center justify-center gap-2 text-2xl mb-1 dark:text-white">
                <FiMessageSquare className="text-purple-500" /> {resource.reviews.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Reviews</div>
            </div>
          </div>

          {/* Files Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center">
              <FiFileText className="mr-2 text-blue-500" /> Files
            </h3>
            {resource.files && resource.files.length > 0 ? (
              <div className="space-y-4">
                {resource.files.map((file, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mr-3">
                        {file.source === "drive" ? (
                          <FiCloud className="text-blue-500" />
                        ) : (
                          <FiFileText className={getFileIcon(file)} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium dark:text-white">{file.originalname || file.name || file.filename}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          {file.size ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "Size unknown"}
                          {file.source === "drive" && (
                            <span className="ml-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full">
                              Google Drive
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {file.viewUrl && (
                        <button
                          onClick={() => handleViewFile(file)}
                          className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                          title="View file"
                        >
                          <FiExternalLink />
                        </button>
                      )}
                      {file.downloadUrl && (
                        <button
                          onClick={() => handleDownload(file)}
                          className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2 rounded-full hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors"
                          title="Download file"
                        >
                          <FiDownload />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 p-4 rounded-lg text-center">
                No files available for this resource.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          {currentUser && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Leave a Review
              </h2>
              <ReviewForm onSubmit={handleReviewSubmit} />
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              <FiMessageSquare /> Reviews
            </h2>
            <ReviewList reviews={resource.reviews || []} />
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
            <h2 className="text-lg font-bold mb-4 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Resource Information
            </h2>
            <ul className="space-y-3">
              <li className="grid grid-cols-[100px_1fr] gap-3 items-start">
                <span className="text-gray-600 dark:text-gray-400">Format:</span>
                <span className="font-medium dark:text-white uppercase text-right">{resource.fileType}</span>
              </li>
              <li className="grid grid-cols-[100px_1fr] gap-3 items-start">
                <span className="text-gray-600 dark:text-gray-400">Branch:</span>
                <span className="font-medium dark:text-white text-right break-words">{getBranchName()}</span>
              </li>
              <li className="grid grid-cols-[100px_1fr] gap-3 items-start">
                <span className="text-gray-600 dark:text-gray-400">Subject:</span>
                <span className="font-medium dark:text-white text-right break-words">{getSubjectName()}</span>
              </li>
              <li className="grid grid-cols-[100px_1fr] gap-3 items-start">
                <span className="text-gray-600 dark:text-gray-400">Semester:</span>
                <span className="font-medium dark:text-white text-right">{resource.semester}</span>
              </li>
              <li className="grid grid-cols-[100px_1fr] gap-3 items-start">
                <span className="text-gray-600 dark:text-gray-400">Uploaded:</span>
                <span className="font-medium dark:text-white text-right">
                  {new Date(resource.createdAt).toLocaleDateString()}
                </span>
              </li>
              <li className="grid grid-cols-[100px_1fr] gap-3 items-start">
                <span className="text-gray-600 dark:text-gray-400">Storage:</span>
                <span className="font-medium dark:text-white text-right">{getStorageLabel()}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResourceDetails
