"use client"
import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../services/api"
import {
  FiBookmark,
  FiDownload,
  FiEye,
  FiStar,
  FiUser,
  FiCalendar,
  FiBook,
  FiFileText,
  FiImage,
  FiFile,
} from "react-icons/fi"
import toast from "react-hot-toast"

const ResourceCard = ({ resource, viewMode = "grid" }) => {
  const { currentUser } = useAuth()
  const [isBookmarked, setIsBookmarked] = useState(resource.isBookmarked || false)

  const handleBookmark = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!currentUser) {
      toast.error("Please login to bookmark resources")
      return
    }

    try {
      await api.post(`/api/resources/${resource._id}/bookmark`)
      setIsBookmarked(!isBookmarked)
      toast.success(isBookmarked ? "Bookmark removed" : "Resource bookmarked successfully!")
    } catch (error) {
      console.error("Error bookmarking resource:", error)
      toast.error("Failed to bookmark resource")
    }
  }

  // Function to determine the icon based on file type
  const getFileIcon = (fileType) => {
    if (!fileType) return <FiFile className="w-5 h-5" />

    switch (fileType.toLowerCase()) {
      case "pdf":
        return <FiFileText className="w-5 h-5" />
      case "doc":
      case "docx":
        return <FiFileText className="w-5 h-5" />
      case "ppt":
      case "pptx":
        return <FiFileText className="w-5 h-5" />
      case "xls":
      case "xlsx":
        return <FiFileText className="w-5 h-5" />
      case "zip":
        return <FiFile className="w-5 h-5" />
      case "jpg":
      case "jpeg":
      case "png":
        return <FiImage className="w-5 h-5" />
      default:
        return <FiFile className="w-5 h-5" />
    }
  }

  // Helper function to safely get subject name
  const getSubjectName = () => {
    if (!resource.subject) return "Unknown Subject"
    if (typeof resource.subject === "string") return resource.subject
    if (typeof resource.subject === "object" && resource.subject.name) return resource.subject.name
    return "Unknown Subject"
  }

  // Helper function to safely get branch name
  const getBranchName = () => {
    if (!resource.branch) return ""
    if (typeof resource.branch === "string") return resource.branch
    if (typeof resource.branch === "object" && resource.branch.name) return resource.branch.name
    return ""
  }

  // Grid view card
  if (viewMode === "grid") {
    return (
      <Link to={`/resources/${resource._id}`} className="block">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 h-full transform hover:-translate-y-1">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white line-clamp-2">{resource.title}</h3>
              <button
                onClick={handleBookmark}
                className={`text-2xl focus:outline-none transition-colors ${isBookmarked ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"}`}
                title="Bookmark this resource"
              >
                <FiBookmark className={isBookmarked ? "fill-yellow-500" : ""} />
              </button>
            </div>

            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span className="mr-4 flex items-center gap-1">
                <FiBook className="text-emerald-500" /> {getBranchName()}
              </span>
              <span className="mr-4 flex items-center gap-1">
                <FiBook className="text-teal-500" /> {getSubjectName()}
              </span>
              <span className="flex items-center gap-1">
                <FiCalendar className="text-purple-500" /> Semester {resource.semester}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {resource.tags &&
                resource.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{resource.description}</p>

            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <span className="mr-2">{getFileIcon(resource.fileType)}</span>
                <span className="uppercase">{resource.fileType}</span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <FiEye className="mr-1 text-blue-500" />
                  <span>{resource.views}</span>
                </div>
                <div className="flex items-center">
                  <FiDownload className="mr-1 text-emerald-500" />
                  <span>{resource.downloads}</span>
                </div>
                <div className="flex items-center">
                  <FiStar className="mr-1 text-yellow-500" />
                  <span>{resource.averageRating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold mr-2">
                {resource.uploader && resource.uploader.name ? resource.uploader.name.charAt(0) : "U"}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {resource.uploader && resource.uploader.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  UID: {resource.uploader && resource.uploader.uid}
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(resource.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </Link>
    )
  }

  // List view card
  return (
    <Link to={`/resources/${resource._id}`} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 transform hover:-translate-y-1 p-4">
        <div className="flex items-start gap-4">
          <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg text-emerald-600 dark:text-emerald-400 flex-shrink-0">
            {getFileIcon(resource.fileType)}
          </div>

          <div className="flex-grow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{resource.title}</h3>
              <button
                onClick={handleBookmark}
                className={`text-xl focus:outline-none transition-colors ${isBookmarked ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"}`}
                title="Bookmark this resource"
              >
                <FiBookmark className={isBookmarked ? "fill-yellow-500" : ""} />
              </button>
            </div>

            <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-2 flex-wrap gap-y-1">
              <span className="mr-3 flex items-center gap-1">
                <FiBook className="text-emerald-500" /> {getBranchName()}
              </span>
              <span className="mr-3 flex items-center gap-1">
                <FiBook className="text-teal-500" /> {getSubjectName()}
              </span>
              <span className="mr-3 flex items-center gap-1">
                <FiCalendar className="text-purple-500" /> Semester {resource.semester}
              </span>
              <span className="flex items-center gap-1">
                <FiUser className="text-blue-500" /> {resource.uploader && resource.uploader.name}
              </span>
            </div>

            <div className="flex flex-wrap gap-1 mb-2">
              {resource.tags &&
                resource.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              {resource.tags && resource.tags.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">+{resource.tags.length - 3} more</span>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <FiEye className="mr-1 text-blue-500" />
                  <span>{resource.views}</span>
                </div>
                <div className="flex items-center">
                  <FiDownload className="mr-1 text-emerald-500" />
                  <span>{resource.downloads}</span>
                </div>
                <div className="flex items-center">
                  <FiStar className="mr-1 text-yellow-500" />
                  <span>{resource.averageRating.toFixed(1)}</span>
                </div>
              </div>
              <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ResourceCard

