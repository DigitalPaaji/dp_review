
"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const reviewSlides = [
  {
    business: "Club 16 Lounge & Bar",
    industry: "Hospitality & Nightlife",
    name: "Rohan Verma",
    role: "Regular Patron",
    avatar: "RV",
    comment:
      "The review portal makes sharing feedback simple and convenient. The QR-based process is quick and easy to use.",
  },
  {
    business: "Elite Salon & Spa",
    industry: "Beauty & Wellness",
    name: "Priya Sharma",
    role: "Client Experience",
    avatar: "PS",
    comment:
      "A clean and convenient way for customers to access a business's review page and share their feedback.",
  },
  {
    business: "Patiala Gourmet Sweets",
    industry: "Food & Bakery",
    name: "Harpreet Singh",
    role: "Customer Experience",
    avatar: "HS",
    comment:
      "The review portal offers a straightforward experience with a professional design and an easy-to-follow process.",
  },
];

function ReviewContent() {
  const searchParams = useSearchParams();

  const businessName = searchParams.get("business") || "Local Business";
  const location = searchParams.get("location") || "";
  const description = searchParams.get("desc") || "";
  const placeId = searchParams.get("placeid") || "";
  const services = searchParams.get("services") || "";
  const industry = searchParams.get("industry") || "";
  const expiryTimestamp = searchParams.get("expires");

  const googleReviewUrl = placeId
    ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(
        placeId
      )}`
    : "";

  const [stars, setStars] = useState(5);
  const [reviewsList, setReviewsList] = useState([]);
  const [selectedReview, setSelectedReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [apiError, setApiError] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);

  const [isExpired, setIsExpired] = useState(() => {
    if (!expiryTimestamp) return false;

    const expiry = Number(expiryTimestamp);

    return !Number.isFinite(expiry) || Date.now() > expiry;
  });

  useEffect(() => {
    if (!expiryTimestamp) {
      setIsExpired(false);
      return;
    }

    const expiry = Number(expiryTimestamp);

    setIsExpired(
      !Number.isFinite(expiry) || Date.now() > expiry
    );
  }, [expiryTimestamp]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((previous) => (previous + 1) % reviewSlides.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, []);

  const fetchAiReviews = useCallback(
    async (selectedStars) => {
      if (isExpired) return;

      setLoading(true);
      setApiError("");
      setReviewsList([]);
      setSelectedReview("");

      try {
        const response = await fetch("/api/generate-review", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            businessName,
            location,
            description,
            services,
            industry,
            stars: selectedStars,
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.details ||
              data.error ||
              `Unable to generate reviews (${response.status}).`
          );
        }

        if (!Array.isArray(data.reviews) || data.reviews.length === 0) {
          throw new Error("The AI did not return any review suggestions.");
        }

        const validReviews = data.reviews.filter(
          (review) =>
            typeof review === "string" && review.trim().length > 0
        );

        if (validReviews.length === 0) {
          throw new Error("No valid review suggestions were returned.");
        }

        setReviewsList(validReviews);
        setSelectedReview(validReviews[0]);
      } catch (error) {
        console.error("Review generation error:", error);

        setApiError(
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      isExpired,
      businessName,
      location,
      description,
      services,
      industry,
    ]
  );

  useEffect(() => {
    if (!isExpired) {
      fetchAiReviews(stars);
    }
  }, [stars, isExpired, fetchAiReviews]);

  const handleCopyAndOpen = async () => {
    if (!selectedReview || isExpired) return;

    if (!googleReviewUrl) {
      setToast("Google Place ID is missing.");
      window.setTimeout(() => setToast(""), 3000);
      return;
    }

    try {
      await navigator.clipboard.writeText(selectedReview);

      setToast("Review copied! Opening Google...");
      window.setTimeout(() => setToast(""), 3000);

      window.open(googleReviewUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Clipboard error:", error);

      setToast("Could not copy automatically. Please copy your review manually.");
      window.setTimeout(() => setToast(""), 4000);
    }
  };

  const currentReview = reviewSlides[activeSlide];

  return (
    <main className="flex h-dvh min-h-0 w-full flex-col overflow-hidden bg-[#090D16] font-sans text-slate-100 selection:bg-indigo-500 selection:text-white lg:flex-row">
      {/* LEFT PANEL */}
      <aside className="relative flex h-[20dvh] min-h-[100px] shrink-0 flex-col overflow-hidden border-b border-indigo-500/20 bg-[#060911] p-3 sm:p-4 lg:h-dvh lg:w-1/2 lg:min-h-0 lg:justify-between lg:border-b-0 lg:border-r lg:p-8 xl:p-10">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: "url('/admin.webp')" }}
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#060911]/80 via-[#090D16]/70 to-[#060911]/60" />

        <div className="relative z-10 flex items-center justify-center lg:justify-start">
          <img
            src="/logo.webp"
            alt="Digital Paaji"
            className="h-10 max-w-[180px] object-contain sm:h-12 lg:h-16 lg:max-w-[230px]"
          />
        </div>

        {/* Desktop testimonial section */}
        <div className="relative z-10 hidden w-full max-w-xl self-center lg:block">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-300">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            Smart review portal
          </div>

          <h1 className="text-4xl font-light leading-tight text-white xl:text-5xl">
            Your experience.
            <br />
            <span className="font-serif italic text-indigo-400">
              Your voice.
            </span>
          </h1>

          <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
            Choose a rating, explore review drafts, and share feedback that
            reflects your actual experience.
          </p>

          <div className="mt-9 rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl backdrop-blur-xl xl:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-sm font-bold text-white">
                  {currentReview.avatar}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {currentReview.name}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {currentReview.role}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 gap-0.5 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-sm">
                    ★
                  </span>
                ))}
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-300">
              “{currentReview.comment}”
            </p>

            <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  Business category
                </p>
                <p className="mt-1 truncate text-xs font-medium text-indigo-300">
                  {currentReview.industry}
                </p>
              </div>

              <span className="shrink-0 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-[10px] text-indigo-200">
                Review portal
              </span>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2">
            {reviewSlides.map((slide, index) => (
              <button
                key={slide.business}
                type="button"
                onClick={() => setActiveSlide(index)}
                aria-label={`Show testimonial ${index + 1}`}
                aria-pressed={activeSlide === index}
                className={`h-1.5 rounded-full transition-all ${
                  activeSlide === index
                    ? "w-8 bg-indigo-400"
                    : "w-2 bg-slate-700 hover:bg-slate-500"
                }`}
              />
            ))}
          </div>
        </div>

        <p className="relative z-10 mt-1 text-center text-[10px] tracking-wider text-slate-300 lg:hidden">
          SMART BUSINESS REVIEW PORTAL
        </p>

        <footer className="relative z-10 hidden items-center justify-between border-t border-white/10 pt-4 text-[10px] text-slate-500 lg:flex">
          <span>© 2026 Digital Paaji</span>
          <span className="text-indigo-300">Review Portal</span>
        </footer>
      </aside>

      {/* RIGHT PANEL */}
      <section className="flex h-[80dvh] min-h-0 flex-1 flex-col overflow-hidden bg-white text-slate-900 lg:h-dvh lg:w-1/2 lg:flex-none">
        {isExpired ? (
          <div className="flex flex-1 items-center justify-center overflow-y-auto p-5 sm:p-8">
            <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-2xl">
                ⏳
              </div>

              <h2 className="mt-4 text-xl font-bold text-red-800">
                QR Code Expired
              </h2>

              <p className="mt-2 text-sm leading-6 text-red-700">
                This review QR code has expired or has an invalid expiry
                timestamp. Please contact the Digital Paaji team to verify
                and reactivate it.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="flex shrink-0 items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-white text-lg shadow-sm">
                ✨
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-bold text-slate-900 sm:text-base">
                  {businessName}
                </h2>

                {location && (
                  <p className="mt-0.5 truncate text-[11px] text-slate-500">
                    📍 {location}
                  </p>
                )}

                <p className="mt-0.5 text-[10px] text-slate-500 sm:text-[11px]">
                  Select your rating and choose a review draft
                </p>
              </div>

              <span className="hidden shrink-0 rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-[10px] font-semibold text-indigo-600 sm:inline-flex">
                ✦ AI Reviews
              </span>
            </header>

            {/* Rating */}
            <div className="shrink-0 px-4 pt-3 sm:px-6 lg:px-8 lg:pt-5">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 sm:px-4">
                <div>
                  <p className="text-xs font-bold text-slate-700">
                    Your rating
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    Choose 1–5 stars
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setStars(star)}
                      aria-label={`Rate ${star} out of 5 stars`}
                      aria-pressed={stars === star}
                      className={`rounded-md p-0.5 text-2xl leading-none transition active:scale-90 sm:text-[28px] ${
                        star <= stars
                          ? "text-amber-400"
                          : "text-slate-300 hover:text-amber-200"
                      }`}
                    >
                      ★
                    </button>
                  ))}

                  <span className="ml-1 text-[10px] font-bold tabular-nums text-slate-500">
                    {stars}/5
                  </span>
                </div>
              </div>
            </div>

            {/* Review heading */}
            <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-2 pt-4 sm:px-6 lg:px-8">
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-slate-800 sm:text-sm">
                  Review suggestions
                  {reviewsList.length > 0 && (
                    <span className="ml-2 rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-600">
                      {reviewsList.length}
                    </span>
                  )}
                </h3>

                <p className="mt-1 text-[10px] text-slate-400">
                  Choose a draft that matches your experience
                </p>
              </div>

              <button
                type="button"
                onClick={() => fetchAiReviews(stars)}
                disabled={loading}
                className="shrink-0 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-[10px] font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50 sm:text-xs"
              >
                {loading ? "Generating..." : "↻ Regenerate"}
              </button>
            </div>

            {/* Scrollable review section */}
            <div
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-3 sm:px-6 lg:px-8"
              aria-live="polite"
            >
              {loading ? (
                <div className="flex min-h-full flex-col items-center justify-center py-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
                    <span className="animate-pulse text-2xl text-indigo-600">
                      ✦
                    </span>
                  </div>

                  <p className="mt-4 text-sm font-semibold text-slate-800">
                    Creating review suggestions
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Please wait while the AI prepares your drafts.
                  </p>
                </div>
              ) : apiError ? (
                <div className="flex min-h-full flex-col items-center justify-center py-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-xl text-red-600">
                    !
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-slate-800">
                    Could not generate reviews
                  </h3>

                  <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
                    {apiError}
                  </p>

                  <button
                    type="button"
                    onClick={() => fetchAiReviews(stars)}
                    className="mt-4 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Try again
                  </button>
                </div>
              ) : reviewsList.length > 0 ? (
                <div className="space-y-2.5">
                  {reviewsList.map((review, index) => {
                    const selected = selectedReview === review;

                    return (
                      <button
                        key={`${index}-${review}`}
                        type="button"
                        onClick={() => setSelectedReview(review)}
                        aria-pressed={selected}
                        className={`block w-full rounded-xl border p-3 text-left transition sm:p-4 ${
                          selected
                            ? "border-indigo-500 bg-indigo-50/70 ring-1 ring-indigo-200"
                            : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                            Option {index + 1}
                          </span>

                          {selected ? (
                            <span className="rounded-full bg-indigo-600 px-2 py-1 text-[9px] font-semibold text-white">
                              ✓ Selected
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">
                              Select draft
                            </span>
                          )}
                        </div>

                        <p className="whitespace-pre-wrap break-words text-xs leading-5 text-slate-600 sm:text-[13px] sm:leading-6">
                          {review}
                        </p>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex min-h-full flex-col items-center justify-center py-8 text-center">
                  <span className="text-3xl">✍️</span>
                  <p className="mt-3 text-sm font-semibold text-slate-800">
                    Ready to write your review?
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Generate suggestions to get started.
                  </p>

                  <button
                    type="button"
                    onClick={() => fetchAiReviews(stars)}
                    className="mt-4 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white"
                  >
                    Generate reviews
                  </button>
                </div>
              )}
            </div>

            {/* Fixed bottom action */}
            <footer className="shrink-0 border-t border-slate-100 bg-white px-4 pb-[max(10px,env(safe-area-inset-bottom))] pt-3 sm:px-6 lg:px-8 lg:pb-5">
              <button
                type="button"
                onClick={handleCopyAndOpen}
                disabled={loading || !selectedReview || Boolean(apiError)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-100 transition hover:from-indigo-700 hover:to-violet-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 sm:py-3.5 sm:text-sm"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <rect x="8" y="8" width="12" height="12" rx="2" />
                  <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
                </svg>

                Copy & Continue to Google
                <span aria-hidden="true">→</span>
              </button>

              <p className="mt-2 text-center text-[9px] leading-4 text-slate-400 sm:text-[10px]">
                Review the draft and make sure it reflects your genuine experience.
              </p>
            </footer>
          </>
        )}
      </section>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-50 w-max max-w-[calc(100%-32px)] -translate-x-1/2 rounded-full border border-slate-700 bg-slate-900 px-4 py-3 text-center text-xs font-medium text-white shadow-2xl"
        >
          {toast}
        </div>
      )}
    </main>
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center bg-[#090D16] text-sm text-indigo-300">
          Loading review portal...
        </div>
      }
    >
      <ReviewContent />
    </Suspense>
  );
}
