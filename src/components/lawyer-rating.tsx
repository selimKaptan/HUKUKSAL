"use client";

import { useState, useCallback } from "react";
import { Star, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface LawyerReview {
  lawyerId: string;
  lawyerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface LawyerRatingProps {
  lawyerId: string;
  lawyerName: string;
  onSubmit?: (review: LawyerReview) => void;
}

const STORAGE_KEY = "jg_lawyer_reviews";

function getStoredReviews(): LawyerReview[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveReview(review: LawyerReview) {
  const reviews = getStoredReviews();
  reviews.push(review);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

export default function LawyerRating({
  lawyerId,
  lawyerName,
  onSubmit,
}: LawyerRatingProps) {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = useCallback(() => {
    if (rating === 0) return;

    const review: LawyerReview = {
      lawyerId,
      lawyerName,
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };

    saveReview(review);
    onSubmit?.(review);
    setSubmitted(true);
  }, [rating, comment, lawyerId, lawyerName, onSubmit]);

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-green-700 font-semibold text-lg mb-1">
          Değerlendirmeniz kaydedildi!
        </p>
        <p className="text-green-600 text-sm">
          {lawyerName} için {rating} yıldız verdiniz.
        </p>
      </div>
    );
  }

  const displayRating = hoveredStar || rating;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        Avukat Değerlendirmesi
      </h3>
      <p className="text-sm text-gray-500 mb-5">
        <span className="font-medium text-gray-700">{lawyerName}</span>{" "}
        hakkındaki deneyiminizi paylaşın.
      </p>

      {/* Star rating */}
      <div className="flex items-center gap-1 mb-5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            className="group p-0.5 transition-transform hover:scale-110 active:scale-95"
          >
            <Star
              className={cn(
                "w-8 h-8 transition-colors duration-150",
                star <= displayRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-transparent text-gray-300 group-hover:text-yellow-300"
              )}
              strokeWidth={1.5}
            />
          </button>
        ))}
        {displayRating > 0 && (
          <span className="ml-2 text-sm font-medium text-gray-500">
            {displayRating}/5
          </span>
        )}
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Yorumunuzu yazın (isteğe bağlı)..."
        rows={3}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none mb-4"
      />

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={rating === 0}
        className={cn(
          "w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all",
          rating > 0
            ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg active:scale-[0.98]"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        )}
      >
        <Send className="w-4 h-4" />
        Değerlendirmeyi Gönder
      </button>
    </div>
  );
}
