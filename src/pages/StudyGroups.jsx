"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"
import {
  FiPaperclip,
  FiSend,
  FiDownload,
  FiImage,
  FiFile,
  FiFileText,
  FiArrowLeft,
  FiX,
  FiInfo,
  FiUsers,
  FiMessageSquare,
  FiCalendar,
  FiSearch,
  FiPlus,
  FiBook,
  FiMenu,
  FiHeart,
  FiRefreshCw,
} from "react-icons/fi"
import toast from "react-hot-toast"
import React from "react"

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
  const [activeGroup, setActiveGroup] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState("")
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState("grid") // grid or list
  const [filePreview, setFilePreview] = useState(null)
  const [downloadingFile, setDownloadingFile] = useState(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [activeTab, setActiveTab] = useState("myGroups") // myGroups, discover, favorites
  const [favoriteGroups, setFavoriteGroups] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [filters, setFilters] = useState({
    semester: "",
    subject: "",
  })

  const fetchStudyGroups = useCallback(async () => {
    try {
      setRefreshing(true)
      setLoading(true)
      const allGroupsResponse = await api.get("/api/study-groups")
      const myGroupsResponse = await api.get("/api/study-groups/my-groups")

      // Ensure subject data is properly formatted
      const processedAllGroups = allGroupsResponse.data.map((group) => ({
        ...group,
        subject: group.subject || { name: "Unknown Subject" },
      }))

      const processedMyGroups = myGroupsResponse.data.map((group) => ({
        ...group,
        subject: group.subject || { name: "Unknown Subject" },
      }))

      setGroups(processedAllGroups)
      setMyGroups(processedMyGroups)

      // Set some random groups as favorites for demo
      setFavoriteGroups((previousFavorites) => {
        if (previousFavorites.length > 0 || processedAllGroups.length === 0) {
          return previousFavorites
        }

        return [...processedAllGroups]
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.min(3, processedAllGroups.length))
          .map((group) => group._id)
      })

      setError(null)
    } catch (err) {
      console.error("Error fetching study groups:", err)
      setError("Failed to load study groups. Please try again later.")
      toast.error("Failed to load study groups")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  const fetchSubjects = useCallback(async () => {
    try {
      const response = await api.get("/api/subjects")
      setSubjects(response.data)
    } catch (error) {
      console.error("Error fetching subjects:", error)
      toast.error("Failed to load subjects")
    }
  }, [])

  useEffect(() => {
    fetchStudyGroups()
    fetchSubjects()

    // Responsive sidebar handling
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowSidebar(false)
      } else {
        setShowSidebar(true)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [fetchStudyGroups, fetchSubjects])

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

  const fetchMessages = async (groupId) => {
    try {
      setLoadingMessages(true)
      const response = await api.get(`/api/study-groups/${groupId}/messages`)
      setMessages(response.data)
    } catch (error) {
      console.error("Error fetching messages:", error)
      setMessages([])
      toast.error("Failed to load messages")
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
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
      toast.success("Study group created successfully!")
    } catch (err) {
      console.error("Error creating study group:", err)
      setError(err.response?.data?.message || "Failed to create study group")
      toast.error(err.response?.data?.message || "Failed to create study group")
    }
  }

  const handleJoinGroup = async (groupId) => {
    try {
      await api.post(`/api/study-groups/${groupId}/join`)
      toast.success("Joined study group successfully!")
      // Update the groups lists
      fetchStudyGroups()
    } catch (err) {
      console.error("Error joining study group:", err)
      toast.error("Failed to join study group")
    }
  }

  const handleLeaveGroup = async (groupId) => {
    try {
      await api.post(`/api/study-groups/${groupId}/leave`)
      toast.success("Left study group successfully!")

      // Update the groups lists
      fetchStudyGroups()

      // If leaving the active group, clear it
      if (activeGroup && activeGroup._id === groupId) {
        setActiveGroup(null)
        setMessages([])
      }
    } catch (err) {
      console.error("Error leaving study group:", err)
      toast.error("Failed to leave study group")
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size exceeds 10MB limit")
        return
      }
      setSelectedFile(file)

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setFilePreview(e.target.result)
        }
        reader.readAsDataURL(file)
      } else {
        setFilePreview(null)
      }
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if ((!messageInput.trim() && !selectedFile) || !activeGroup) return

    try {
      setSendingMessage(true)

      const formData = new FormData()
      // Always include content field, even if empty
      formData.append("content", messageInput.trim() || "")

      if (selectedFile) {
        formData.append("file", selectedFile)
      }

      const response = await api.post(`/api/study-groups/${activeGroup._id}/messages`, formData)

      // Add the new message to the list
      setMessages([...messages, response.data])
      setMessageInput("")
      setSelectedFile(null)
      setFilePreview(null)
      toast.success("Message sent successfully")
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    } finally {
      setSendingMessage(false)
    }
  }

  const handleFileButtonClick = () => {
    fileInputRef.current.click()
  }

  const getFileIcon = (fileType) => {
    if (!fileType) return <FiFile className="w-5 h-5" />

    if (fileType.startsWith("image/")) {
      return <FiImage className="w-5 h-5" />
    } else if (fileType.includes("pdf")) {
      return <FiFileText className="w-5 h-5" />
    } else {
      return <FiFile className="w-5 h-5" />
    }
  }

  const downloadFile = async (fileUrl, fileName) => {
    if (!fileUrl) return

    try {
      setDownloadingFile(fileName)

      // Get the file from the server
      const response = await api.get(fileUrl, {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.status === 200) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Create a blob URL for the file
      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/octet-stream",
      })

      const url = window.URL.createObjectURL(blob)

      // Create a temporary link and trigger download
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", fileName || "download")
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success(`Downloaded ${fileName}`)
    } catch (error) {
      console.error("Error downloading file:", error)
      toast.error(`Failed to download ${fileName}`)
    } finally {
      setDownloadingFile(null)
    }
  }

  const toggleFavorite = (groupId) => {
    if (favoriteGroups.includes(groupId)) {
      setFavoriteGroups(favoriteGroups.filter((id) => id !== groupId))
    } else {
      setFavoriteGroups([...favoriteGroups, groupId])
    }
  }

  // Apply filters and search
  const applyFilters = (groupList) => {
    return groupList.filter((group) => {
      // Apply search filter
      const matchesSearch =
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (group.subject?.name && group.subject.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        group.description.toLowerCase().includes(searchTerm.toLowerCase())

      // Apply semester filter
      const matchesSemester = !filters.semester || group.semester.toString() === filters.semester

      // Apply subject filter
      const matchesSubject = !filters.subject || (group.subject && group.subject._id === filters.subject)

      return matchesSearch && matchesSemester && matchesSubject
    })
  }

  // Filter groups based on search term and other filters
  const filteredAvailableGroups = applyFilters(
    groups.filter((group) => !myGroups.some((myGroup) => myGroup._id === group._id)),
  )

  const filteredMyGroups = applyFilters(myGroups)

  const filteredFavoriteGroups = applyFilters(groups.filter((group) => favoriteGroups.includes(group._id)))

  // Group card component for reuse
  const GroupCard = ({ group, isMember }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 flex flex-col h-full transform hover:-translate-y-1">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">{group.name}</h3>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs px-2 py-1 rounded-full">
              Semester {group.semester}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFavorite(group._id)
              }}
              className="text-gray-400 hover:text-yellow-500 transition-colors"
            >
              {favoriteGroups.includes(group._id) ? (
                <FiHeart className="fill-yellow-500 text-yellow-500" />
              ) : (
                <FiHeart />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
          <span className="flex items-center gap-1 bg-teal-100 dark:bg-teal-900/30 px-2 py-1 rounded-md">
            <FiBook className="text-teal-600 dark:text-teal-400" />
            {group.subject?.name || "Unknown Subject"}
          </span>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2 text-sm">{group.description}</p>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <FiUsers className="text-emerald-500" /> {group.members?.length || 0} members
            </span>
          </div>
          <span className="flex items-center gap-1">
            <FiCalendar className="text-gray-400" /> {new Date(group.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 flex justify-between items-center">
        {isMember ? (
          <>
            <button
              onClick={() => setActiveGroup(group)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 shadow-sm"
            >
              <FiMessageSquare /> Chat
            </button>
            <button
              onClick={() => handleLeaveGroup(group._id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium hover:underline"
            >
              Leave
            </button>
          </>
        ) : (
          <button
            onClick={() => handleJoinGroup(group._id)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1 shadow-sm"
          >
            <FiUsers /> Join Group
          </button>
        )}
      </div>
    </div>
  )

  // List view item component
  const GroupListItem = ({ group, isMember }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="bg-emerald-100 dark:bg-emerald-900/50 p-3 rounded-full">
          <FiUsers className="text-emerald-600 dark:text-emerald-400 w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-emerald-700 dark:text-emerald-400">{group.name}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFavorite(group._id)
              }}
              className="text-gray-400 hover:text-yellow-500 transition-colors"
            >
              {favoriteGroups.includes(group._id) ? (
                <FiHeart className="fill-yellow-500 text-yellow-500 w-4 h-4" />
              ) : (
                <FiHeart className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>{group.subject?.name || "Unknown Subject"}</span>
            <span>•</span>
            <span>Semester {group.semester}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <FiUsers className="text-gray-400" /> {group.members?.length || 0}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isMember ? (
          <>
            <button
              onClick={() => setActiveGroup(group)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 shadow-sm"
            >
              <FiMessageSquare /> Chat
            </button>
            <button
              onClick={() => handleLeaveGroup(group._id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium hover:underline"
            >
              Leave
            </button>
          </>
        ) : (
          <button
            onClick={() => handleJoinGroup(group._id)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 shadow-sm"
          >
            <FiUsers /> Join
          </button>
        )}
      </div>
    </div>
  )

  // Render the main content based on active tab
  const renderMainContent = () => {
    if (activeTab === "myGroups") {
      return (
        <div>
          <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
            <FiUsers /> My Study Groups
          </h2>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : filteredMyGroups.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg text-center shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center">
                <FiUsers className="text-gray-300 dark:text-gray-600 w-16 h-16 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg font-medium">
                  You haven't joined any study groups yet
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Join a group below or create your own to collaborate with other students
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-md font-semibold hover:opacity-90 transition-all shadow-md"
                >
                  Create a Group
                </button>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMyGroups.map((group) => (
                <GroupCard key={group._id} group={group} isMember={true} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMyGroups.map((group) => (
                <GroupListItem key={group._id} group={group} isMember={true} />
              ))}
            </div>
          )}
        </div>
      )
    } else if (activeTab === "discover") {
      return (
        <div>
          <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
            <FiUsers /> Discover Study Groups
          </h2>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : filteredAvailableGroups.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg text-center shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center">
                <FiUsers className="text-gray-300 dark:text-gray-600 w-16 h-16 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg font-medium">No study groups available</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {searchTerm || filters.semester || filters.subject
                    ? "No groups match your search criteria"
                    : "Be the first to create a study group!"}
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-md font-semibold hover:opacity-90 transition-all shadow-md"
                >
                  Create a Group
                </button>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAvailableGroups.map((group) => (
                <GroupCard key={group._id} group={group} isMember={false} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAvailableGroups.map((group) => (
                <GroupListItem key={group._id} group={group} isMember={false} />
              ))}
            </div>
          )}
        </div>
      )
    } else if (activeTab === "favorites") {
      return (
        <div>
          <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
            <FiHeart /> Favorite Groups
          </h2>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : filteredFavoriteGroups.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg text-center shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center">
                <FiHeart className="text-gray-300 dark:text-gray-600 w-16 h-16 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg font-medium">No favorite groups yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Click the heart icon on any group to add it to your favorites
                </p>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFavoriteGroups.map((group) => (
                <GroupCard
                  key={group._id}
                  group={group}
                  isMember={myGroups.some((myGroup) => myGroup._id === group._id)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFavoriteGroups.map((group) => (
                <GroupListItem
                  key={group._id}
                  group={group}
                  isMember={myGroups.some((myGroup) => myGroup._id === group._id)}
                />
              ))}
            </div>
          )}
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen">
      {activeGroup ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
          <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{activeGroup.name}</h2>
              <div className="text-sm flex items-center gap-2">
                <span className="mr-3">{activeGroup.subject?.name || "Unknown Subject"}</span>
                <span>•</span>
                <span>Semester {activeGroup.semester}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <FiUsers size={14} /> {activeGroup.members?.length || 0}
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveGroup(null)}
              className="text-white hover:text-blue-200 flex items-center gap-2 bg-white bg-opacity-20 px-3 py-1 rounded-md transition-all hover:bg-opacity-30"
            >
              <FiArrowLeft /> Back to Groups
            </button>
          </div>

          {/* Message display area */}
          <div className="p-4 h-[600px] overflow-y-auto bg-gray-50 dark:bg-gray-700 flex flex-col">
            {loadingMessages ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 flex flex-col items-center flex-grow justify-center">
                <FiMessageSquare size={48} className="mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-lg font-medium mb-2">No messages yet</p>
                <p>Be the first to start a conversation!</p>
              </div>
            ) : (
              <div className="space-y-2 flex-grow">
                {messages.map((message, index) => {
                  const isCurrentUser = message.sender._id === currentUser._id
                  const showSenderInfo = index === 0 || messages[index - 1].sender._id !== message.sender._id
                  const messageDate = new Date(message.createdAt)
                  const today = new Date()
                  const yesterday = new Date(today)
                  yesterday.setDate(yesterday.getDate() - 1)

                  let dateDisplay
                  if (messageDate.toDateString() === today.toDateString()) {
                    dateDisplay = "Today"
                  } else if (messageDate.toDateString() === yesterday.toDateString()) {
                    dateDisplay = "Yesterday"
                  } else {
                    dateDisplay = messageDate.toLocaleDateString()
                  }

                  // Check if we need to show date separator
                  const showDateSeparator =
                    index === 0 || new Date(messages[index - 1].createdAt).toDateString() !== messageDate.toDateString()

                  return (
                    <React.Fragment key={index}>
                      {showDateSeparator && (
                        <div className="flex justify-center my-4">
                          <div className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs px-3 py-1 rounded-full">
                            {dateDisplay}
                          </div>
                        </div>
                      )}

                      <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[70%] rounded-lg p-3 shadow-sm ${
                            isCurrentUser
                              ? "bg-emerald-500 text-white rounded-tr-none"
                              : "bg-white dark:bg-gray-600 text-gray-800 dark:text-white rounded-tl-none"
                          }`}
                        >
                          {!isCurrentUser && showSenderInfo && (
                            <div className="text-xs font-semibold mb-1 text-emerald-700 dark:text-emerald-300">
                              {message.sender.name}
                            </div>
                          )}

                          {message.content && <div className="mb-1">{message.content}</div>}

                          {message.fileUrl && (
                            <div
                              className={`mt-2 pt-1 ${message.content ? "border-t border-gray-200 dark:border-gray-500" : ""}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {getFileIcon(message.fileType)}
                                  <span className="text-sm truncate max-w-[150px]">{message.fileName}</span>
                                </div>
                                <button
                                  onClick={() => downloadFile(message.fileUrl, message.fileName)}
                                  className={`text-xs flex items-center gap-1 ${
                                    isCurrentUser
                                      ? "bg-emerald-600 hover:bg-emerald-700"
                                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                  } rounded px-2 py-1 ${downloadingFile === message.fileName ? "opacity-50 cursor-not-allowed" : ""}`}
                                  disabled={downloadingFile === message.fileName}
                                >
                                  {downloadingFile === message.fileName ? (
                                    <>Downloading...</>
                                  ) : (
                                    <>
                                      <FiDownload size={12} /> Download
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="text-xs mt-1 opacity-75 text-right">
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            {isCurrentUser && (
                              <span className="ml-1">✓</span> // Simple checkmark for sent messages
                            )}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message input area - enhanced with emoji button and better styling */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            {filePreview && (
              <div className="mb-2 p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <img
                    src={filePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded"
                  />
                  <span className="truncate max-w-[200px] text-sm">{selectedFile?.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null)
                    setFilePreview(null)
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <FiX />
                </button>
              </div>
            )}

            {selectedFile && !filePreview && (
              <div className="mb-2 p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm">
                  <FiFile className="text-emerald-600" />
                  <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                </div>
                <button type="button" onClick={() => setSelectedFile(null)} className="text-red-500 hover:text-red-700">
                  <FiX />
                </button>
              </div>
            )}

            <div className="flex items-center">
              <button
                type="button"
                onClick={handleFileButtonClick}
                className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 mr-2"
                disabled={sendingMessage}
                title="Attach file"
              >
                <FiPaperclip />
              </button>

              <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />

              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-grow border border-gray-300 dark:border-gray-600 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                placeholder="Type a message..."
                disabled={sendingMessage}
              />

              <button
                type="submit"
                className="p-3 ml-2 rounded-full bg-emerald-500 text-white disabled:opacity-50 hover:bg-emerald-600"
                disabled={sendingMessage || (!messageInput.trim() && !selectedFile)}
              >
                {sendingMessage ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent border-white"></div>
                ) : (
                  <FiSend />
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          {showSidebar && (
            <div className="w-full md:w-64 flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700 h-fit">
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => setActiveTab("myGroups")}
                  className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                    activeTab === "myGroups"
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <FiUsers className={activeTab === "myGroups" ? "text-emerald-600" : ""} />
                  <span>My Groups</span>
                </button>

                <button
                  onClick={() => setActiveTab("discover")}
                  className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                    activeTab === "discover"
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <FiSearch className={activeTab === "discover" ? "text-emerald-600" : ""} />
                  <span>Discover</span>
                </button>

                <button
                  onClick={() => setActiveTab("favorites")}
                  className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                    activeTab === "favorites"
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <FiHeart className={activeTab === "favorites" ? "text-emerald-600" : ""} />
                  <span>Favorites</span>
                </button>

                <div className="border-t border-gray-200 dark:border-gray-700 my-2 pt-2">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-2 rounded-md font-medium hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-1"
                  >
                    <FiPlus /> Create Group
                  </button>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 my-2 pt-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filters</p>

                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Semester</label>
                      <select
                        name="semester"
                        value={filters.semester}
                        onChange={handleFilterChange}
                        className="w-full mt-1 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">All Semesters</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <option key={sem} value={sem}>
                            Semester {sem}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Subject</label>
                      <select
                        name="subject"
                        value={filters.subject}
                        onChange={handleFilterChange}
                        className="w-full mt-1 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">All Subjects</option>
                        {subjects.map((subject) => (
                          <option key={subject._id} value={subject._id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="flex-grow">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="md:hidden bg-gray-100 dark:bg-gray-700 p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <FiMenu />
                </button>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Study Groups
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Collaborate with other students in your courses
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white pl-10"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FiSearch className="h-4 w-4" />
                  </div>
                </div>

                <button
                  onClick={() => fetchStudyGroups()}
                  className={`p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${refreshing ? "animate-spin" : ""}`}
                  title="Refresh"
                >
                  <FiRefreshCw />
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md ${
                      viewMode === "grid"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                        : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    title="Grid view"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md ${
                      viewMode === "list"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                        : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    title="List view"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6 shadow-sm flex items-center">
                <FiInfo className="mr-2 flex-shrink-0" />
                <span>{error}</span>
                <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
                  <FiX />
                </button>
              </div>
            )}

            {renderMainContent()}
          </div>
        </div>
      )}

      {/* Create Study Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold dark:text-white bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Create Study Group
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
              >
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
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
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
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
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
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
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
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
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
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-md font-medium hover:opacity-90 shadow-sm"
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

