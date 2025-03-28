"use client"

import { useState } from "react"

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
      return setError("Please select a rating")
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
    } catch (err) {
      console.error("Error submitting review:", err)
      setError(err.response?.data?.message || "Failed to submit review. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
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
                <span className="text-yellow-400">★</span>
              ) : (
                <span className="text-gray-300 dark:text-gray-600">☆</span>
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
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 shadow-sm transition-all"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  )
}

export default ReviewForm

