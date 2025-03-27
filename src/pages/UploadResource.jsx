"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"

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
    }
  }

  const fetchSubjects = async (branchId, semester) => {
    try {
      const response = await api.get(`/api/subjects?branch=${branchId}&semester=${semester}`)
      setSubjects(response.data)
    } catch (error) {
      console.error("Error fetching subjects:", error)
      setError("Failed to load subjects. Please try again later.")
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
    setFormData((prevState) => ({
      ...prevState,
      files: Array.from(e.target.files),
    }))
  }

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value)
  }

  const handleTagInputKeyDown = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()

      if (!formData.tags.includes(tagInput.trim())) {
        setFormData((prevState) => ({
          ...prevState,
          tags: [...prevState.tags, tagInput.trim()],
        }))
      }

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
      return setError("Please select at least one file to upload")
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

      navigate(`/resources/${response.data._id}`)
    } catch (err) {
      console.error("Error uploading resource:", err)
      setError(err.response?.data?.message || "Failed to upload resource")
      setUploadProgress(0)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6">Upload a Resource</h2>

        {error && <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="branch" className="block text-gray-700 font-medium mb-2">
                Branch
              </label>
              <select
                id="branch"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label htmlFor="semester" className="block text-gray-700 font-medium mb-2">
                Semester
              </label>
              <select
                id="semester"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            <div>
              <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <p className="text-sm text-gray-500 mt-1">Please select branch and semester first</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="tags" className="block text-gray-700 font-medium mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
                  <span>{tag}</span>
                  <button
                    type="button"
                    className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                    onClick={() => removeTag(tag)}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagInputKeyDown}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type a tag and press Enter"
            />
            <p className="text-sm text-gray-500 mt-1">
              Press Enter to add a tag. Example tags: Notes, Assignment, Past Paper
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="files" className="block text-gray-700 font-medium mb-2">
              Upload Files
            </label>
            <input
              type="file"
              id="files"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              multiple
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Supported file types: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, ZIP, JPG, PNG
            </p>
          </div>

          {loading && uploadProgress > 0 && (
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <p className="text-sm text-gray-600 mt-1 text-center">{uploadProgress}% Uploaded</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload Resource"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default UploadResource

