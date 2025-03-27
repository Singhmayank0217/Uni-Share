"use client"

import { useState, useEffect } from "react"
import api from "../../services/api"

const FilterBar = ({ filters, onFilterChange }) => {
  const [branches, setBranches] = useState([])
  const [subjects, setSubjects] = useState([])
  const [categories, setCategories] = useState([
    "Notes",
    "Past Papers",
    "Assignments",
    "Presentations",
    "Books",
    "Others",
  ])
  const [loading, setLoading] = useState(false)
  const [semesters] = useState([1, 2, 3, 4, 5, 6, 7, 8])

  useEffect(() => {
    fetchBranches()
  }, [])

  useEffect(() => {
    if (filters.branch && filters.semester) {
      fetchSubjects(filters.branch, filters.semester)
    } else {
      setSubjects([])
    }
  }, [filters.branch, filters.semester])

  const fetchBranches = async () => {
    try {
      setLoading(true)
      const response = await api.get("/api/branches")
      setBranches(response.data)
    } catch (error) {
      console.error("Error fetching branches:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubjects = async (branchId, semester) => {
    try {
      setLoading(true)
      const response = await api.get(`/api/subjects?branch=${branchId}&semester=${semester}`)
      setSubjects(response.data)
    } catch (error) {
      console.error("Error fetching subjects:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">
            Branch
          </label>
          <select
            id="branch"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.branch}
            onChange={(e) => onFilterChange({ branch: e.target.value, subject: "" })}
          >
            <option value="">All Branches</option>
            {branches.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
            Semester
          </label>
          <select
            id="semester"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.semester}
            onChange={(e) => onFilterChange({ semester: e.target.value, subject: "" })}
          >
            <option value="">All Semesters</option>
            {semesters.map((semester) => (
              <option key={semester} value={semester}>
                Semester {semester}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <select
            id="subject"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.subject}
            onChange={(e) => onFilterChange({ subject: e.target.value })}
            disabled={loading || !filters.branch || !filters.semester}
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.category}
            onChange={(e) => onFilterChange({ category: e.target.value })}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category.toLowerCase()}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            id="sortBy"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value })}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating">Highest Rated</option>
            <option value="downloads">Most Downloaded</option>
            <option value="views">Most Viewed</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default FilterBar

