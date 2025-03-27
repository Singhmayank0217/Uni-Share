"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"

const StudyGroups = () => {
  const { currentUser } = useAuth()
  const [groups, setGroups] = useState([])
  const [myGroups, setMyGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subject: "",
    semester: "",
  })
  const [subjects, setSubjects] = useState([])

  useEffect(() => {
    fetchStudyGroups()
    fetchSubjects()
  }, [])

  const fetchStudyGroups = async () => {
    try {
      setLoading(true)
      const allGroupsResponse = await api.get("/api/study-groups")
      const myGroupsResponse = await api.get("/api/study-groups/my-groups")

      setGroups(allGroupsResponse.data)
      setMyGroups(myGroupsResponse.data)
      setError(null)
    } catch (err) {
      console.error("Error fetching study groups:", err)
      setError("Failed to load study groups. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const fetchSubjects = async () => {
    try {
      const response = await api.get("/api/subjects")
      setSubjects(response.data)
    } catch (error) {
      console.error("Error fetching subjects:", error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleCreateGroup = async (e) => {
    e.preventDefault()

    try {
      const response = await api.post("/api/study-groups", formData)

      // Add the new group to the lists
      setGroups([response.data, ...groups])
      setMyGroups([response.data, ...myGroups])

      // Reset form and close modal
      setFormData({
        name: "",
        description: "",
        subject: "",
        semester: "",
      })
      setShowCreateModal(false)
    } catch (err) {
      console.error("Error creating study group:", err)
      setError(err.response?.data?.message || "Failed to create study group")
    }
  }

  const handleJoinGroup = async (groupId) => {
    try {
      await api.post(`/api/study-groups/${groupId}/join`)

      // Update the groups lists
      fetchStudyGroups()
    } catch (err) {
      console.error("Error joining study group:", err)
      alert("Failed to join study group")
    }
  }

  const handleLeaveGroup = async (groupId) => {
    try {
      await api.post(`/api/study-groups/${groupId}/leave`)

      // Update the groups lists
      fetchStudyGroups()
    } catch (err) {
      console.error("Error leaving study group:", err)
      alert("Failed to leave study group")
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Study Groups</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700"
        >
          Create New Group
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">{error}</div>}

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">My Study Groups</h2>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : myGroups.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-600 mb-4">You haven't joined any study groups yet</p>
            <p className="text-sm text-gray-500">
              Join a group below or create your own to collaborate with other students
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myGroups.map((group) => (
              <div key={group._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{group.name}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <span className="mr-3">{group.subject.name}</span>
                    <span>Semester {group.semester}</span>
                  </div>
                  <p className="text-gray-700 mb-4">{group.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      <span>{group.members.length} members</span>
                    </div>
                    <button
                      onClick={() => handleLeaveGroup(group._id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Leave Group
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Available Study Groups</h2>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-600 mb-4">No study groups available</p>
            <p className="text-sm text-gray-500">Be the first to create a study group!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups
              .filter((group) => !myGroups.some((myGroup) => myGroup._id === group._id))
              .map((group) => (
                <div key={group._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2">{group.name}</h3>
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <span className="mr-3">{group.subject.name}</span>
                      <span>Semester {group.semester}</span>
                    </div>
                    <p className="text-gray-700 mb-4">{group.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        <span>{group.members.length} members</span>
                      </div>
                      <button
                        onClick={() => handleJoinGroup(group._id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700"
                      >
                        Join Group
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Create Study Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Create Study Group</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateGroup}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                  Group Name
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
                <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
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
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name}
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
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-300 mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudyGroups

