"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import { FiDownload, FiEye, FiBookmark, FiStar, FiTrash2 } from "react-icons/fi"
import api from "../../services/api"
import toast from "react-hot-toast"
import { useAuth } from "../../contexts/AuthContext"

const ResourceCard = ({ resource, onDelete }) => {
  const { currentUser } = useAuth()
  const [isBookmarked, setIsBookmarked] = useState(resource.isBookmarked || false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isOwner = resource.isOwner || (resource.uploader && resource.uploader._id === currentUser?._id)

  const handleBookmark = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      if (isBookmarked) {
        await api.delete(`/api/resources/${resource._id}/bookmark`)
        setIsBookmarked(false)
        toast.success("Resource removed from bookmarks")
      } else {
        await api.post(`/api/resources/${resource._id}/bookmark`)
        setIsBookmarked(true)
        toast.success("Resource added to bookmarks")
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error)
      toast.error("Failed to update bookmark")
    }
  }

  const handleDeleteClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (onDelete) {
      onDelete(resource._id)
      setShowDeleteConfirm(false)
      return
    }

    try {
      setIsDeleting(true)
      await api.delete(`/api/resources/${resource._id}`)
      toast.success("Resource deleted successfully")
      // If we don't have an onDelete callback, we'll just hide the card
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error("Error deleting resource:", error)
      toast.error("Failed to delete resource")
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleCancelDelete = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setShowDeleteConfirm(false)
  }

  if (isDeleting && !onDelete) {
    return null // Hide the card if it's being deleted and we don't have an onDelete callback
  }

  const getResourceTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "notes":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "assignment":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
      case "paper":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
      case "book":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg hover:translate-y-[-4px]">
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-white dark:bg-gray-800 z-10 flex flex-col items-center justify-center p-4 rounded-xl">
          <div className="text-red-500 mb-2">
            <FiTrash2 size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Resource?</h3>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-4">This action cannot be undone.</p>
          <div className="flex space-x-3">
            <button
              onClick={handleCancelDelete}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
            >
              {isDeleting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Deleting...
                </>
              ) : (
                <>
                  <FiTrash2 className="mr-2" />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <Link to={`/resources/${resource._id}`} className="block">
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span
                className={`inline-block px-2 py-1 text-xs font-medium rounded-md ${getResourceTypeColor(resource.type)}`}
              >
                {resource.type || "Resource"}
              </span>
              {resource.subject && (
                <span className="ml-2 inline-block px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  {resource.subject.name}
                </span>
              )}
            </div>
            <div className="flex space-x-1">
              {isOwner && (
                <button
                  onClick={handleDeleteClick}
                  className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  aria-label="Delete resource"
                >
                  <FiTrash2 size={16} />
                </button>
              )}
              <button
                onClick={handleBookmark}
                className={`p-1.5 rounded-full transition-colors ${
                  isBookmarked
                    ? "text-amber-500 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                    : "text-gray-500 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                }`}
                aria-label={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
              >
                <FiBookmark size={16} className={isBookmarked ? "fill-current" : ""} />
              </button>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{resource.title}</h3>

          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
            {resource.description || "No description provided."}
          </p>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <div className="flex items-center mr-3">
                <FiEye className="mr-1" />
                <span>{resource.views || 0}</span>
              </div>
              <div className="flex items-center mr-3">
                <FiDownload className="mr-1" />
                <span>{resource.downloads || 0}</span>
              </div>
              <div className="flex items-center">
                <FiStar className="mr-1" />
                <span>{resource.rating ? resource.rating.toFixed(1) : "0.0"}</span>
              </div>
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              {resource.createdAt && formatDistanceToNow(new Date(resource.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default ResourceCard
