"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import api from "../services/api"
import ResourceCard from "../components/resources/ResourceCard"
import FilterBar from "../components/resources/FilterBar"
import { useAuth } from "../contexts/AuthContext"
import {
  FiBookOpen,
  FiUsers,
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiChevronRight,
  FiArrowRight,
  FiBook,
  FiFileText,
  FiDownload,
  FiStar,
  FiTrendingUp,
  FiClock,
} from "react-icons/fi"

const Home = () => {
  const { currentUser } = useAuth()
  const location = useLocation()
  const [resources, setResources] = useState([])
  const [trendingResources, setTrendingResources] = useState([])
  const [recentResources, setRecentResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    branch: "",
    semester: "",
    subject: "",
    category: "",
    sortBy: "newest",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState("grid")
  const [stats, setStats] = useState({
    totalResources: 0,
    totalUsers: 0,
    totalDownloads: 0,
    totalGroups: 0,
  })

  // Parse query parameters on component mount and when URL changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const categoryParam = searchParams.get("category")

    if (categoryParam) {
      setFilters((prev) => ({ ...prev, category: categoryParam }))
    }
  }, [location.search])

  useEffect(() => {
    fetchResources()
    fetchStats()
  }, [filters])

  const fetchStats = async () => {
    try {
      // This would be a real API call in a production app
      // For now, we'll use mock data
      setStats({
        totalResources: 1250,
        totalUsers: 450,
        totalDownloads: 8750,
        totalGroups: 65,
      })
    } catch (err) {
      console.error("Error fetching stats:", err)
    }
  }

  const fetchResources = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()

      if (filters.branch) queryParams.append("branch", filters.branch)
      if (filters.semester) queryParams.append("semester", filters.semester)
      if (filters.subject) queryParams.append("subject", filters.subject)
      if (filters.category) queryParams.append("category", filters.category)
      if (filters.sortBy) queryParams.append("sortBy", filters.sortBy)

      const response = await api.get(`/api/resources?${queryParams.toString()}`)
      setResources(response.data)

      // Set trending resources (most downloaded)
      const trending = [...response.data].sort((a, b) => b.downloads - a.downloads).slice(0, 3)
      setTrendingResources(trending)

      // Set recent resources
      const recent = [...response.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3)
      setRecentResources(recent)

      setError(null)
    } catch (err) {
      console.error("Error fetching resources:", err)
      setError("Failed to load resources. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters })
  }

  // Function to handle category click
  const handleCategoryClick = (category) => {
    setFilters((prev) => ({ ...prev, category }))
    // Update URL without reloading the page
    const url = new URL(window.location)
    url.searchParams.set("category", category)
    window.history.pushState({}, "", url)
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16 px-4 rounded-2xl mb-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {/* Using a pattern instead of placeholder image */}
          <div className="absolute inset-0 bg-pattern"></div>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Share Knowledge, <br />
              Empower Learning
            </h1>
            <p className="text-xl mb-8 text-emerald-100">
              Connect with fellow students, share resources, and collaborate in study groups to enhance your academic
              journey.
            </p>

            <div className="flex flex-wrap gap-4">
              {!currentUser ? (
                <>
                  <Link
                    to="/register"
                    className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors shadow-lg flex items-center gap-2"
                  >
                    Join Now <FiArrowRight />
                  </Link>
                  <Link
                    to="/login"
                    className="bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-800 transition-colors shadow-lg"
                  >
                    Login
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/upload"
                    className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors shadow-lg flex items-center gap-2"
                  >
                    Share a Resource <FiArrowRight />
                  </Link>
                  <Link
                    to="/study-groups"
                    className="bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-800 transition-colors shadow-lg flex items-center gap-2"
                  >
                    Join Study Groups <FiUsers />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="container mx-auto mt-12 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.totalResources.toLocaleString()}</div>
              <div className="text-emerald-100 text-sm">Resources Shared</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <div className="text-emerald-100 text-sm">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.totalDownloads.toLocaleString()}</div>
              <div className="text-emerald-100 text-sm">Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.totalGroups.toLocaleString()}</div>
              <div className="text-emerald-100 text-sm">Study Groups</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Sections */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Trending Resources */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <FiTrendingUp /> Trending Resources
              </h2>
              <Link
                to="/?sortBy=downloads"
                className="text-emerald-600 dark:text-emerald-400 text-sm flex items-center hover:underline"
              >
                View All <FiChevronRight className="ml-1" />
              </Link>
            </div>

            <div className="space-y-4">
              {trendingResources.length > 0 ? (
                trendingResources.map((resource) => (
                  <Link key={resource._id} to={`/resources/${resource._id}`} className="block">
                    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg text-emerald-600 dark:text-emerald-400">
                        <FiFileText className="w-6 h-6" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium text-gray-900 dark:text-white">{resource.title}</h3>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <span className="flex items-center gap-1 mr-3">
                            <FiDownload className="text-emerald-500" /> {resource.downloads}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiStar className="text-yellow-500" /> {resource.averageRating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">No trending resources available</div>
              )}
            </div>
          </div>

          {/* Recent Resources */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <FiClock /> Recent Uploads
              </h2>
              <Link
                to="/?sortBy=newest"
                className="text-emerald-600 dark:text-emerald-400 text-sm flex items-center hover:underline"
              >
                View All <FiChevronRight className="ml-1" />
              </Link>
            </div>

            <div className="space-y-4">
              {recentResources.length > 0 ? (
                recentResources.map((resource) => (
                  <Link key={resource._id} to={`/resources/${resource._id}`} className="block">
                    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="bg-teal-100 dark:bg-teal-900/30 p-3 rounded-lg text-teal-600 dark:text-teal-400">
                        <FiFileText className="w-6 h-6" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium text-gray-900 dark:text-white">{resource.title}</h3>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <span className="flex items-center gap-1 mr-3">
                            <FiBook /> {resource.subject?.name || "Unknown Subject"}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiClock /> {new Date(resource.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">No recent resources available</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Explore Resources</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => handleCategoryClick("notes")}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all flex flex-col items-center text-center ${filters.category === "notes" ? "ring-2 ring-blue-500" : ""}`}
          >
            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full text-blue-600 dark:text-blue-400 mb-4">
              <FiBookOpen className="w-8 h-8" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">Notes</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Class notes & summaries</p>
          </button>

          <button
            onClick={() => handleCategoryClick("past-papers")}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all flex flex-col items-center text-center ${filters.category === "past-papers" ? "ring-2 ring-purple-500" : ""}`}
          >
            <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full text-purple-600 dark:text-purple-400 mb-4">
              <FiFileText className="w-8 h-8" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">Past Papers</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Previous exam papers</p>
          </button>

          <button
            onClick={() => handleCategoryClick("assignments")}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all flex flex-col items-center text-center ${filters.category === "assignments" ? "ring-2 ring-amber-500" : ""}`}
          >
            <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-full text-amber-600 dark:text-amber-400 mb-4">
              <FiBook className="w-8 h-8" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">Assignments</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Assignment solutions</p>
          </button>

          <button
            onClick={() => handleCategoryClick("presentations")}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all flex flex-col items-center text-center ${filters.category === "presentations" ? "ring-2 ring-emerald-500" : ""}`}
          >
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full text-emerald-600 dark:text-emerald-400 mb-4">
              <FiFileText className="w-8 h-8" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">Presentations</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Slides & presentations</p>
          </button>
        </div>
      </section>

      {/* Main Content */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">All Resources</h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FiFilter /> Filters
            </button>

            <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
              >
                <FiGrid />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
              >
                <FiList />
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="mb-6">
            <FilterBar filters={filters} onFilterChange={handleFilterChange} />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-md text-center">{error}</div>
        ) : resources.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
            <div className="inline-flex items-center justify-center p-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400 mb-4">
              <FiSearch className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No resources found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your filters or be the first to share a resource!
            </p>
            <Link
              to="/upload"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all shadow-md"
            >
              Upload a Resource
            </Link>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {resources.map((resource) => (
              <ResourceCard key={resource._id} resource={resource} viewMode={viewMode} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Home

