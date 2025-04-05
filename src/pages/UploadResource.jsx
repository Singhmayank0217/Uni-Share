"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
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
} from "react-icons/fi"

const UploadResource = () => {
  const { currentUser } = useAuth()
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

  const handleSubmit = async (e) => {
    e.preventDefault()

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
                <div className="flex">
                  <input
                    type="text"
                    id="tags"
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyDown={handleTagInputKeyDown}
                    className="flex-grow border border-gray-300 dark:border-gray-600 rounded-l-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Add tags (e.g., notes, assignment, etc.)"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-r-lg flex items-center"
                  >
                    <FiPlus className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Common tags: notes, assignment, past paper, presentation
                </p>
              </div>
            </div>
          </div>

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

          {loading && uploadProgress > 0 && (
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
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-300 flex items-center space-x-2 shadow-md"
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
                  <FiUpload className="w-5 h-5" />
                  <span>Upload Resource</span>
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

