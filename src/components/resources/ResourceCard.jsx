"use client"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../services/api"

const ResourceCard = ({ resource }) => {
  const { currentUser } = useAuth()

  const handleBookmark = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!currentUser) {
      alert("Please login to bookmark resources")
      return
    }

    try {
      await api.post(`/api/resources/${resource._id}/bookmark`)
      alert("Resource bookmarked successfully!")
    } catch (error) {
      console.error("Error bookmarking resource:", error)
      alert("Failed to bookmark resource")
    }
  }

  // Function to determine the icon based on file type
  const getFileIcon = (fileType) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return "📄"
      case "doc":
      case "docx":
        return "📝"
      case "ppt":
      case "pptx":
        return "📊"
      case "xls":
      case "xlsx":
        return "📈"
      case "zip":
        return "🗂️"
      case "jpg":
      case "jpeg":
      case "png":
        return "🖼️"
      default:
        return "📁"
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

  return (
    <Link to={`/resources/${resource._id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold text-gray-800 line-clamp-2">{resource.title}</h3>
            <button
              onClick={handleBookmark}
              className="text-gray-400 hover:text-yellow-500 focus:outline-none"
              title="Bookmark this resource"
            >
              {resource.isBookmarked ? <span className="text-yellow-500">⭐</span> : <span>⭐</span>}
            </button>
          </div>

          <div className="flex items-center text-sm text-gray-600 mb-2">
            <span className="mr-4">{getBranchName()}</span>
            <span className="mr-4">{getSubjectName()}</span>
            <span>Semester {resource.semester}</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {resource.tags &&
              resource.tags.map((tag, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
          </div>

          <p className="text-gray-600 mb-4 line-clamp-3">{resource.description}</p>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <span className="mr-2">{getFileIcon(resource.fileType)}</span>
              <span className="uppercase">{resource.fileType}</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="mr-1">👁️</span>
                <span>{resource.views}</span>
              </div>
              <div className="flex items-center">
                <span className="mr-1">⬇️</span>
                <span>{resource.downloads}</span>
              </div>
              <div className="flex items-center">
                <span className="mr-1">⭐</span>
                <span>{resource.averageRating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-2">
              {resource.uploader && resource.uploader.name ? resource.uploader.name.charAt(0) : "U"}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{resource.uploader && resource.uploader.name}</p>
              <p className="text-xs text-gray-500">UID: {resource.uploader && resource.uploader.uid}</p>
            </div>
          </div>
          <span className="text-xs text-gray-500">{new Date(resource.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  )
}

export default ResourceCard

