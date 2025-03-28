"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"
import { useTheme } from "../contexts/ThemeContext"
import { FiPaperclip, FiSend, FiDownload, FiImage, FiFile, FiFileText, FiArrowLeft } from "react-icons/fi"

const StudyGroups = () => {
  const { currentUser } = useAuth()
  const { theme } = useTheme()
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
  const [activeGroup, setActiveGroup] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState("")
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchStudyGroups()
    fetchSubjects()
  }, [])

  useEffect(() => {
    if (activeGroup) {
      fetchMessages(activeGroup._id)
    }
  }, [activeGroup])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchStudyGroups = async () => {
    try {
      setLoading(true)
      const allGroupsResponse = await api.get("/api/study-groups")
      const myGroupsResponse = await api.get("/api/study-groups/my-groups")

      // Ensure subject data is properly formatted
      const processedAllGroups = allGroupsResponse.data.map(group => ({
        ...group,
        subject: group.subject || { name: "Unknown Subject" }
      }))

      const processedMyGroups = myGroupsResponse.data.map(group => ({
        ...group,
        subject: group.subject || { name: "Unknown Subject" }
      }))

      setGroups(processedAllGroups)
      setMyGroups(processedMyGroups)
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

  const fetchMessages = async (groupId) => {
    try {
      setLoadingMessages(true)
      const response = await api.get(`/api/study-groups/${groupId}/messages`)
      setMessages(response.data)
    } catch (error) {
      console.error("Error fetching messages:", error)
      setMessages([])
    } finally {
      setLoadingMessages(false)
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
      
      // If leaving the active group, clear it
      if (activeGroup && activeGroup._id === groupId) {
        setActiveGroup(null)
        setMessages([])
      }
    } catch (err) {
      console.error("Error leaving study group:", err)
      alert("Failed to leave study group")
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if ((!messageInput.trim() && !selectedFile) || !activeGroup) return
    
    try {
      setSendingMessage(true)
      
      const formData = new FormData()
      if (messageInput.trim()) {
        formData.append('content', messageInput)
      }
      
      if (selectedFile) {
        formData.append('file', selectedFile)
      }
      
      const response = await api.post(`/api/study-groups/${activeGroup._id}/messages`, formData)
      
      // Add the new message to the list
      setMessages([...messages, response.data])
      setMessageInput("")
      setSelectedFile(null)
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message")
    } finally {
      setSendingMessage(false)
    }
  }

  const handleFileButtonClick = () => {
    fileInputRef.current.click()
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getFileIcon = (fileType) => {
    if (!fileType) return <FiFile className="w-5 h-5" />
    
    if (fileType.startsWith('image/')) {
      return <FiImage className="w-5 h-5" />
    } else if (fileType.includes('pdf')) {
      return <FiFileText className="w-5 h-5" />
    } else {
      return <FiFile className="w-5 h-5" />
    }
  }

  const downloadFile = (fileUrl, fileName) => {
    if (!fileUrl) return
    
    const link = document.createElement('a')
    link.href = fileUrl
    link.setAttribute('download', fileName || 'file')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Study Groups</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md font-semibold hover:opacity-90 transition-all shadow-md"
        >
          Create New Group
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6 shadow-sm">{error}</div>}

      {activeGroup ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
          <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{activeGroup.name}</h2>
              <div className="text-sm">
                <span className="mr-3">{activeGroup.subject?.name || "Unknown Subject"}</span>
                <span>Semester {activeGroup.semester}</span>
              </div>
            </div>
            <button
              onClick={() => setActiveGroup(null)}
              className="text-white hover:text-blue-200 flex items-center gap-2 bg-white bg-opacity-20 px-3 py-1 rounded-md transition-all hover:bg-opacity-30"
            >
              <FiArrowLeft /> Back to Groups
            </button>
          </div>
          
          <div className="p-4 h-[500px] overflow-y-auto bg-gray-50 dark:bg-gray-700">
            {loadingMessages ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No messages yet. Be the first to start a conversation!
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${message.sender._id === currentUser._id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[70%] rounded-lg p-3 shadow-sm ${
                        message.sender._id === currentUser._id 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                          : 'bg-white dark:bg-gray-600 text-gray-800 dark:text-white'
                      }`}
                    >
                      <div className="text-sm font-semibold mb-1">
                        {message.sender.name} 
                        {message.sender._id === currentUser._id && " (You)"}
                      </div>
                      
                      {message.content && <div className="mb-2">{message.content}</div>}
                      
                      {message.fileUrl && (
                        <div className="mt-2 border-t pt-2 border-gray-200 dark:border-gray-500">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getFileIcon(message.fileType)}
                              <span className="text-sm truncate max-w-[150px]">{message.fileName}</span>
                            </div>
                            <button 
                              onClick={() => downloadFile(message.fileUrl, message.fileName)}
                              className="text-xs flex items-center gap-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded px-2 py-1"
                            >
                              <FiDownload size={12} /> Download
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <div className="text-xs mt-1 opacity-75">{formatDate(message.createdAt)}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
            {selectedFile && (
              <div className="mb-2 p-2 bg-blue-50 dark:bg-gray-600 rounded flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm">
                  <FiPaperclip />
                  <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSelectedFile(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  &times;
                </button>
              </div>
            )}
            
            <div className="flex">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-grow border border-gray-300 dark:border-gray-600 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Type your message..."
                disabled={sendingMessage}
              />
              
              <button
                type="button"
                onClick={handleFileButtonClick}
                className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 hover:bg-gray-200 dark:hover:bg-gray-500"
                disabled={sendingMessage}
              >
                <FiPaperclip />
              </button>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
              />
              
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-r-md font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
                disabled={sendingMessage || (!messageInput.trim() && !selectedFile)}
              >
                {sendingMessage ? "Sending..." : <><FiSend /> Send</>}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">My Study Groups</h2>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : myGroups.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg text-center shadow-md border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't joined any study groups yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Join a group below or create your own to collaborate with other students
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myGroups.map((group) => (
                  <div key={group._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-2 dark:text-white">{group.name}</h3>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <span className="mr-3">{group.subject?.name || "Unknown Subject"}</span>
                        <span>Semester {group.semester}</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">{group.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          <span>{group.members?.length || 0} members</span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setActiveGroup(group)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded text-sm font-medium hover:opacity-90 shadow-sm"
                          >
                            Chat
                          </button>
                          <button
                            onClick={() => handleLeaveGroup(group._id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Leave
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Available Study Groups</h2>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : groups.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg text-center shadow-md border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 mb-4">No study groups available</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Be the first to create a study group!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups
                  .filter((group) => !myGroups.some((myGroup) => myGroup._id === group._id))
                  .map((group) => (
                    <div key={group._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
                      <div className="p-6">
                        <h3 className="text-lg font-semibold mb-2 dark:text-white">{group.name}</h3>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <span className="mr-3">{group.subject?.name || "Unknown Subject"}</span>
                          <span>Semester {group.semester}</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">{group.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            <span>{group.members?.length || 0} members</span>
                          </div>
                          <button
                            onClick={() => handleJoinGroup(group._id)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded text-sm font-medium hover:opacity-90 shadow-sm"
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
        </>
      )}

      {/* Create Study Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Create Study Group</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-xl">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateGroup}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="subject" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
                  <label htmlFor="semester" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                    Semester
                  </label>
                  <select
                    id="semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
                  className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md font-medium hover:bg-gray-300 dark:hover:bg-gray-600 mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md font-medium hover:opacity-90 shadow-sm"
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

