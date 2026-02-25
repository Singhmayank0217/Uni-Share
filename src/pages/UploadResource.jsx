"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import { toast } from "react-hot-toast"
import {
  FiUpload,
  FiFile,
  FiBook,
  FiTag,
  FiX,
  FiPlus,
  FiCalendar,
  FiBookOpen,
  FiFileText,
  FiInfo,
  FiCloud,
  FiHardDrive,
} from "react-icons/fi"
import GoogleDrivePicker from "../components/resources/GoogleDrivePicker"

// Add this constant at the top of the component, after the imports
const predefinedTags = [
  "notes",
  "past papers",
  "assignments",
  "presentations",
  "books",
  "solutions",
  "lecture slides",
  "practice questions",
]

const UploadResource = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    branch: "",
    semester: "",
    subject: "",
    tags: [],
    files: [],
  })

  const [branches, setBranches] = useState([])
  const [subjects, setSubjects] = useState([])
  const [tagInput, setTagInput] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [fileDetails, setFileDetails] = useState([])
  const [uploadMethod, setUploadMethod] = useState("local") // 'local' or 'drive'
  const [driveFiles, setDriveFiles] = useState([])

  useEffect(() => {
    fetchBranches()
  }, [])

  useEffect(() => {
    if (formData.branch && formData.semester) {
      fetchSubjects(formData.branch, formData.semester)
    } else {
      setSubjects([])
      setFormData((prev) => ({ ...prev, subject: "" }))
    }
  }, [formData.branch, formData.semester])

  const fetchBranches = async () => {
    try {
      const response = await api.get("/api/branches")
      setBranches(response.data)
    } catch (error) {
      console.error("Error fetching branches:", error)
      setError("Failed to load branches. Please try again later.")
      toast.error("Failed to load branches")
    }
  }

  const fetchSubjects = async (branchId, semester) => {
    try {
      const response = await api.get(`/api/subjects?branch=${branchId}&semester=${semester}`)
      setSubjects(response.data)
    } catch (error) {
      console.error("Error fetching subjects:", error)
      setError("Failed to load subjects. Please try again later.")
      toast.error("Failed to load subjects")
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)

    if (files.length > 0) {
      setFormData((prevState) => ({
        ...prevState,
        files,
      }))

      setFileDetails(
        files.map((file) => ({
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type,
        })),
      )
    }
  }

  const handleDriveFileSelect = (files) => {
    setDriveFiles(files)
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)

    if (files.length > 0) {
      setFormData((prevState) => ({
        ...prevState,
        files,
      }))

      setFileDetails(
        files.map((file) => ({
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type,
        })),
      )
    }
  }

  const removeFile = (index) => {
    const newFiles = [...formData.files]
    newFiles.splice(index, 1)

    setFormData((prevState) => ({
      ...prevState,
      files: newFiles,
    }))

    const newFileDetails = [...fileDetails]
    newFileDetails.splice(index, 1)
    setFileDetails(newFileDetails)
  }

  const removeDriveFile = (index) => {
    const newFiles = [...driveFiles]
    newFiles.splice(index, 1)
    setDriveFiles(newFiles)
  }

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value)
  }

  const handleTagInputKeyDown = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()

      if (!formData.tags.includes(tagInput.trim().toLowerCase())) {
        setFormData((prevState) => ({
          ...prevState,
          tags: [...prevState.tags, tagInput.trim().toLowerCase()],
        }))
      }

      setTagInput("")
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) {
      setFormData((prevState) => ({
        ...prevState,
        tags: [...prevState.tags, tagInput.trim().toLowerCase()],
      }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData((prevState) => ({
      ...prevState,
      tags: prevState.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  // Add this function to handle selecting a predefined tag
  const handlePredefinedTagSelect = (tag) => {
    if (!formData.tags.includes(tag.toLowerCase())) {
      setFormData((prevState) => ({
        ...prevState,
        tags: [...prevState.tags, tag.toLowerCase()],
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate common fields
    if (!formData.title || !formData.description || !formData.branch || !formData.semester || !formData.subject) {
      setError("Please fill in all required fields")
      toast.error("Please fill in all required fields")
      return
    }

    if (uploadMethod === "local") {
      // Local file upload
      if (formData.files.length === 0) {
        setError("Please select at least one file to upload")
        toast.error("Please select at least one file to upload")
        return
      }

      try {
        setError("")
        setLoading(true)

        const formDataToSend = new FormData()
        formDataToSend.append("title", formData.title)
        formDataToSend.append("description", formData.description)
        formDataToSend.append("branch", formData.branch)
        formDataToSend.append("semester", formData.semester)
        formDataToSend.append("subject", formData.subject)
        formData.tags.forEach((tag) => formDataToSend.append("tags", tag))
        formData.files.forEach((file) => formDataToSend.append("files", file))

        const response = await api.post("/api/resources", formDataToSend, {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(percentCompleted)
          },
        })

        toast.success("Resource uploaded successfully!")
        navigate(`/resources/${response.data._id}`)
      } catch (err) {
        console.error("Error uploading resource:", err)
        const errorMessage = err.response?.data?.message || "Failed to upload resource"
        setError(errorMessage)
        toast.error(errorMessage)
        setUploadProgress(0)
      } finally {
        setLoading(false)
      }
    } else {
      // Google Drive file upload
      if (driveFiles.length === 0) {
        setError("Please select at least one file from Google Drive")
        toast.error("Please select at least one file from Google Drive")
        return
      }

      try {
        setError("")
        setLoading(true)

        const response = await api.post("/api/resources/drive-files", {
          title: formData.title,
          description: formData.description,
          branch: formData.branch,
          semester: formData.semester,
          subject: formData.subject,
          tags: formData.tags,
          driveFiles: driveFiles,
        })

        toast.success("Resource uploaded successfully!")
        navigate(`/resources/${response.data._id}`)
      } catch (err) {
        console.error("Error uploading resource from Google Drive:", err)
        const errorMessage = err.response?.data?.message || "Failed to upload resource from Google Drive"
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 rounded-xl shadow-md mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="bg-emerald-100 dark:bg-emerald-800 p-3 rounded-full">
            <FiUpload className="w-6 h-6 text-emerald-600 dark:text-emerald-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Share Knowledge
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Upload your resources to help other students in their academic journey
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6 flex items-center space-x-2">
            <FiInfo className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-6">
                <label
                  htmlFor="title"
                  className="block text-gray-700 dark:text-gray-200 font-medium mb-2 flex items-center"
                >
                  <FiFileText className="text-emerald-500 mr-2" /> Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter a descriptive title"
                  required
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="description"
                  className="block text-gray-700 dark:text-gray-200 font-medium mb-2 flex items-center"
                >
                  <FiBook className="text-emerald-500 mr-2" /> Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="5"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Describe your resource (e.g., what it covers, when it's useful, etc.)"
                  required
                ></textarea>
              </div>
            </div>

            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label
                    htmlFor="branch"
                    className="block text-gray-700 dark:text-gray-200 font-medium mb-2 flex items-center"
                  >
                    <FiBookOpen className="text-emerald-500 mr-2" /> Branch
                  </label>
                  <select
                    id="branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Select Branch</option>
                    {branches.map((branch) => (
                      <option key={branch._id} value={branch._id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="semester"
                    className="block text-gray-700 dark:text-gray-200 font-medium mb-2 flex items-center"
                  >
                    <FiCalendar className="text-emerald-500 mr-2" /> Semester
                  </label>
                  <select
                    id="semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Select Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                      <option key={semester} value={semester}>
                        Semester {semester}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="subject"
                  className="block text-gray-700 dark:text-gray-200 font-medium mb-2 flex items-center"
                >
                  <FiBookOpen className="text-emerald-500 mr-2" /> Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                  required
                  disabled={!formData.branch || !formData.semester}
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                {(!formData.branch || !formData.semester) && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Please select branch and semester first
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2 flex items-center">
                  <FiTag className="text-emerald-500 mr-2" /> Tags
                </label>

                {/* Selected tags */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, index) => (
                    <div
                      key={index}
                      className="bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded-full flex items-center"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        className="ml-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200 focus:outline-none"
                        onClick={() => removeTag(tag)}
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Predefined tags */}
                <div className="mb-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Common tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {predefinedTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handlePredefinedTagSelect(tag)}
                        className={`text-xs px-3 py-1 rounded-full transition-colors ${
                          formData.tags.includes(tag.toLowerCase())
                            ? "bg-emerald-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom tag input */}
                <div className="flex">
                  <input
                    type="text"
                    id="tags"
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyDown={handleTagInputKeyDown}
                    className="flex-grow border border-gray-300 dark:border-gray-600 rounded-l-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Add custom tag..."
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-r-lg flex items-center"
                  >
                    <FiPlus className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Press Enter to add a custom tag</p>
              </div>
            </div>
          </div>

          {/* Upload Method Selection */}
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">Upload Method</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setUploadMethod("local")}
                className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-colors ${
                  uploadMethod === "local"
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-emerald-400"
                }`}
              >
                <FiHardDrive
                  className={`w-8 h-8 mb-2 ${uploadMethod === "local" ? "text-emerald-500" : "text-gray-500 dark:text-gray-400"}`}
                />
                <span
                  className={`font-medium ${uploadMethod === "local" ? "text-emerald-700 dark:text-emerald-300" : "text-gray-700 dark:text-gray-300"}`}
                >
                  Upload from Device
                </span>
              </button>

              <button
                type="button"
                onClick={() => setUploadMethod("drive")}
                className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-colors ${
                  uploadMethod === "drive"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
                }`}
              >
                <FiCloud
                  className={`w-8 h-8 mb-2 ${uploadMethod === "drive" ? "text-blue-500" : "text-gray-500 dark:text-gray-400"}`}
                />
                <span
                  className={`font-medium ${uploadMethod === "drive" ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"}`}
                >
                  Select from Google Drive
                </span>
              </button>
            </div>
          </div>

          {/* Local File Upload */}
          {uploadMethod === "local" && (
            <div className="mt-6">
              <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2 flex items-center">
                <FiFile className="text-emerald-500 mr-2" /> Files
              </label>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-emerald-400 dark:hover:border-emerald-500"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input type="file" id="files" onChange={handleFileChange} className="hidden" multiple />

                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-800/50 rounded-full flex items-center justify-center">
                    <FiUpload className="w-8 h-8 text-emerald-600 dark:text-emerald-300" />
                  </div>

                  <div>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      Drag and drop your files here, or
                      <button
                        type="button"
                        onClick={() => document.getElementById("files").click()}
                        className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline ml-1"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Supports PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, ZIP, JPG, PNG (Max 10MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* File list */}
              {fileDetails.length > 0 && (
                <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Selected Files ({fileDetails.length})
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {fileDetails.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded"
                      >
                        <div className="flex items-center">
                          <FiFile className="text-emerald-500 mr-2" />
                          <div className="text-sm">
                            <p className="text-gray-700 dark:text-gray-300 font-medium">{file.name}</p>
                            <p className="text-gray-500 dark:text-gray-400">{file.size}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                        >
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Google Drive File Selection */}
          {uploadMethod === "drive" && (
            <div className="mt-6">
              <GoogleDrivePicker onFileSelect={handleDriveFileSelect} />

              {/* Drive File list */}
              {driveFiles.length > 0 && (
                <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
                    Selected Files from Google Drive ({driveFiles.length})
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {driveFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded"
                      >
                        <div className="flex items-center">
                          {file.iconUrl && (
                            <img src={file.iconUrl || "/placeholder.svg"} alt="" className="w-5 h-5 mr-2" />
                          )}
                          <div className="text-sm">
                            <p className="text-gray-700 dark:text-gray-300 font-medium">{file.name}</p>
                            <p className="text-gray-500 dark:text-gray-400">
                              {file.sizeBytes ? formatFileSize(Number.parseInt(file.sizeBytes)) : "Size unknown"}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDriveFile(index)}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                        >
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {loading && uploadProgress > 0 && uploadMethod === "local" && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{uploadProgress}%</p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-emerald-600 h-2.5 rounded-full transition-all ease-in-out duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className={`py-3 px-6 rounded-lg font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-all duration-300 flex items-center space-x-2 shadow-md ${
                uploadMethod === "local"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white focus:ring-emerald-500"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white focus:ring-blue-500"
              }`}
              disabled={loading}
            >
              {loading ? (
                <>
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
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  {uploadMethod === "local" ? (
                    <>
                      <FiUpload className="w-5 h-5" />
                      <span>Upload Resource</span>
                    </>
                  ) : (
                    <>
                      <FiCloud className="w-5 h-5" />
                      <span>Save Google Drive Resource</span>
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UploadResource
