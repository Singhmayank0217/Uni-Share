"use client"

import { useState } from "react"
import { FiStar } from "react-icons/fi"
import toast from "react-hot-toast"

const ReviewForm = ({ onSubmit }) => {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [hoverRating, setHoverRating] = useState(0)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (rating === 0) {
      setError("Please select a rating")
      toast.error("Please select a rating")
      return
    }

    try {
      setError("")
      setSuccess("")
      setLoading(true)

      await onSubmit({ rating, comment })

      // Reset form
      setRating(0)
      setComment("")
      setSuccess("Review submitted successfully!")
      toast.success("Review submitted successfully!")
    } catch (err) {
      console.error("Error submitting review:", err)
      const errorMessage = err.response?.data?.message || "Failed to submit review. Please try again."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
    >
      {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 shadow-sm">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4 shadow-sm">{success}</div>}

      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Your Rating</label>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="text-3xl focus:outline-none transition-colors duration-200"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            >
              {star <= (hoverRating || rating) ? (
                <FiStar className="w-8 h-8 fill-yellow-400 text-yellow-400" />
              ) : (
                <FiStar className="w-8 h-8 text-gray-300 dark:text-gray-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="comment" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
          Your Review (Optional)
        </label>
        <textarea
          id="comment"
          rows="4"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Share your thoughts about this resource..."
        ></textarea>
      </div>

      <button
        type="submit"
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 shadow-sm transition-all w-full"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  )
}

export default ReviewForm

