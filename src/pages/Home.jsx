"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"
import ResourceCard from "../components/resources/ResourceCard"
import FilterBar from "../components/resources/FilterBar"
import { useAuth } from "../contexts/AuthContext"

const Home = () => {
  const { currentUser } = useAuth()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    branch: "",
    semester: "",
    subject: "",
    category: "",
    sortBy: "newest",
  })

  useEffect(() => {
    fetchResources()
  }, [filters])

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

  return (
    <div>
      <section className="bg-blue-600 text-white py-16 px-4 rounded-lg mb-8">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to UniShare</h1>
          <p className="text-xl mb-8">Share and discover educational resources with fellow university students</p>
          <div className="flex justify-center gap-4">
            {!currentUser ? (
              <>
                <Link
                  to="/register"
                  className="bg-white text-blue-600 px-6 py-3 rounded-md font-semibold hover:bg-blue-100"
                >
                  Join Now
                </Link>
                <Link
                  to="/login"
                  className="bg-blue-700 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-800"
                >
                  Login
                </Link>
              </>
            ) : (
              <Link
                to="/upload"
                className="bg-blue-700 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-800"
              >
                Share a Resource
              </Link>
            )}
          </div>
        </div>
      </section>

      <FilterBar filters={filters} onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md text-center">{error}</div>
      ) : resources.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">No resources found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your filters or be the first to share a resource!</p>
          <Link to="/upload" className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700">
            Upload a Resource
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {resources.map((resource) => (
            <ResourceCard key={resource._id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Home

