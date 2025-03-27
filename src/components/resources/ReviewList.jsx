const ReviewList = ({ reviews }) => {
    if (reviews.length === 0) {
      return <div className="text-center py-8 text-gray-500">No reviews yet. Be the first to leave a review!</div>
    }
  
    // Sort reviews by date (newest first)
    const sortedReviews = [...reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  
    return (
      <div className="space-y-6">
        {sortedReviews.map((review) => (
          <div key={review._id} className="border-b border-gray-200 pb-6 last:border-0">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-2">
                  {review.user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{review.user.name}</p>
                  <p className="text-xs text-gray-500">UID: {review.user.uid}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex mr-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400">
                      {star <= review.rating ? "★" : "☆"}
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            {review.comment && <p className="text-gray-700 mt-2">{review.comment}</p>}
          </div>
        ))}
      </div>
    )
  }
  
  export default ReviewList
  
  