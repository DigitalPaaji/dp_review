'use client';
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";




const reviewSlides = [
  {
    business: "Club 16 Lounge & Bar",
    industry: "Hospitality & Nightlife",
    name: "Rohan Verma",
    role: "Regular Patron",
    avatar: "RV",
    comment: '“The AI review generator QR code made sharing feedback effortless! Our Google reviews spiked by 300% in just two weeks.”'
  },
  {
    business: "Elite Salon & Spa",
    industry: "Beauty & Wellness",
    name: "Priya Sharma",
    role: "Verified Client",
    avatar: "PS",
    comment: "“Amazing experience! Customers just scan the QR code at the desk and our custom AI prompt instantly creates a glowing review.”"
  },
  {
    business: "Patiala Gourmet Sweets",
    industry: "Food & Bakery",
    name: "Harpreet Singh",
    role: "Food Blogger",
    avatar: "HS",
    comment: "“Digital Paaji's smart review portal is a game changer for local businesses. Seamless, fast, and extremely professional!”"
  }
];

function ReviewContent() {
  const searchParams = useSearchParams();
  
  const businessName = searchParams.get("business") || "Local Business";
  const location = searchParams.get("location") || "";
  const description = searchParams.get("desc") || "";
  const placeId = searchParams.get("placeid") || "ChIJj7dpzeIpEDkRFA_89AlSWzk";
  const services = searchParams.get("services") || "";
  const industry = searchParams.get("industry") || "";
  const customerExperience = searchParams.get("experience") || "";
  const expiryTimestamp = searchParams.get("expires");

  const googleReviewUrl = `https://search.google.com/local/writereview?placeid=${placeId}`;

  const [stars, setStars] = useState(5);
  const [reviewsList, setReviewsList] = useState([]);
  const [selectedReview, setSelectedReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  // Check 1-year validity expiration
  useEffect(() => {
    if (expiryTimestamp) {
      const currentTime = Date.now();
      if (currentTime > Number(expiryTimestamp)) {
        setIsExpired(true);
      }
    }
  }, [expiryTimestamp]);

  // Auto rotate review slides every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % reviewSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Fetch 5 dynamic options from Gemini API based on business context
  const fetchAiReviews = async (selectedStars) => {
    if (isExpired) return;
    setLoading(true);
    try {
      const res = await fetch("/api/generate-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          businessName, 
          location,
          description,
          services,
          industry,
          customerExperience,
          stars: selectedStars
        }),
      });
      const data = await res.json();


      if (!res.ok) {
  throw new Error(data.details || data.error || `Request failed: ${res.status}`);
}

if (Array.isArray(data.reviews) && data.reviews.length > 0) {
  setReviewsList(data.reviews);
  setSelectedReview(data.reviews[0]);

  if (data.source === "fallback") {
    console.warn("Using fallback reviews:", data.warning);
  }
} else {
  throw new Error("No reviews were returned by the API.");
}

      // if (data.reviews && data.reviews.length > 0) {
      //   setReviewsList(data.reviews);
      //   setSelectedReview(data.reviews[0]);
      // }
    } catch (err) {
      console.error(err);
      const fallback = ["Great service and wonderful experience overall! Highly recommended."];
      setReviewsList(fallback);
      setSelectedReview(fallback[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isExpired) {
      fetchAiReviews(stars);
    }
  }, [stars, isExpired]);

  const handleCopyAndOpen = async (textToPost) => {
    const text = textToPost || selectedReview;
    if (!text || isExpired) return;

    try {
      await navigator.clipboard.writeText(text);
      setToast(true);
      setTimeout(() => setToast(false), 2500);

      if (googleReviewUrl) {
        window.open(googleReviewUrl, "_blank");
      }
    } catch (error) {
      console.error("Copy error:", error);
      if (googleReviewUrl) {
        window.open(googleReviewUrl, "_blank");
      }
    }
  };

  const currentReview = reviewSlides[activeSlide];

  return (
    <div className="w-screen overflow-hidden flex flex-col lg:flex-row font-sans bg-[#090D16] text-slate-100 selection:bg-indigo-500 selection:text-white">
      
      {/* LEFT SIDE: Image Background with Dark Overlay & Rotating Review Slides (Compact on mobile) */}
      <div className="flex lg:w-1/2 h-[20vh] lg:h-screen relative bg-[#060911] p-4 lg:p-10 flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-indigo-500/20">
        
        {/* Background Image with Dark Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center pointer-events-none" 
          style={{ backgroundImage: `url('/admin.webp')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#060911]/60 via-[#090D16]/45 to-[#060911]/25 pointer-events-none"></div>

        {/* Top / Center Aesthetic Content & Rotating Slides */}
        <div className="relative z-10 my-auto py-2 lg:py-6 flex flex-col items-center text-center">
          <div className="flex items-center">
            <img src="/logo.webp" className="w-full h-14 lg:h-20 object-contain" alt="Digital Paaji Logo" />
          </div>
      
          <h2 className="hidden lg:block text-3xl xl:text-4xl font-light text-slate-100 mt-6">
            What <span className="font-serif italic font-normal text-indigo-400 underline decoration-indigo-500/50 underline-offset-8">clients</span>
          </h2>
          <p className="hidden lg:block text-xs uppercase tracking-widest text-slate-300 font-semibold mb-8">say across all businesses</p>
          
          <div className="hidden lg:inline-block mb-6 px-3.5 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide">
            UNIVERSAL BUSINESS REVIEW PORTAL
          </div>
          
          {/* Glassmorphic Rotating Slide Card (Hidden or miniaturized on very small screens if preferred, shown here nicely scaled) */}
          <div className="relative w-full max-w-md mx-auto transition-all duration-700 hidden sm:block">
            <div className="absolute inset-x-4 -bottom-5 h-20 bg-slate-900/40 rounded-2xl border border-slate-800/50 backdrop-blur-sm transform scale-95 z-0"></div>
            
            <div className="relative z-20 bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 lg:p-6 shadow-2xl backdrop-blur-2xl text-left transition-all duration-500">
              <div className="flex items-center justify-between mb-2 lg:mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-bold text-xs text-white shadow-md">
                    {currentReview.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{currentReview.name}</h4>
                    <p className="text-[11px] text-indigo-300">{currentReview.role} • <span className="text-slate-300">{currentReview.business}</span></p>
                  </div>
                </div>
                <div className="flex space-x-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed italic min-h-[35px]">
                {currentReview.comment}
              </p>
              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-300">
                <span>Industry: <strong className="text-indigo-300">{currentReview.industry}</strong></span>
                <span className="bg-indigo-500/20 text-indigo-200 px-2 py-0.5 rounded border border-indigo-500/30">Verified Review</span>
              </div>
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="hidden sm:flex items-center space-x-2 mt-4 lg:mt-6">
            {reviewSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${activeSlide === idx ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-700'}`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-[10px] lg:text-[11px] text-slate-300 flex justify-between items-center border-t border-slate-800/80 pt-2 lg:pt-4">
          <span>&copy; 2026 Digital Paaji. All rights reserved.</span>
          <span className="text-indigo-300 font-medium">Review Portal</span>
        </div>
      </div>

      {/* RIGHT SIDE: Clean Review Generator Interface */}
      <div className="w-full lg:w-1/2 h-[80vh] lg:h-screen flex flex-col justify-center px-4 sm:px-12 xl:px-16 py-4 overflow-hidden bg-white text-slate-900 shadow-2xl">
        
        <div className="w-full max-w-xl mx-auto flex flex-col justify-center my-auto">
          
          {isExpired ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center shadow-lg">
              <span className="text-3xl">⏳</span>
              <h2 className="text-xl font-bold text-red-700 mt-2">QR Code Expired</h2>
              <p className="text-xs text-red-600 mt-2">
                This review QR code has completed its 1-year validity period. Please contact the <strong>Digital Paaji</strong> team to renew your subscription and reactivate this portal.
              </p>
            </div>
          ) : (
            <>
              {/* Header Badge */}
              <div className="text-center mb-3">
                <span className="inline-block bg-indigo-100 text-indigo-800 text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-1">
                  ✨ Customer Feedback
                </span>
                <h2 className="font-serif italic font-normal text-indigo-500 underline decoration-indigo-500/50 text-3xl ">
                  {businessName}
                </h2>
                {location && <p className="text-xs text-gray-400">{location}</p>}
                <p className="text-xs text-gray-500 mt-0.5">
                  Select your rating & pick an AI-crafted review option
                </p>
              </div>

              {/* Star Rating Selector */}
              <div className="flex justify-center gap-2 my-2.5 bg-indigo-50/60 py-2.5 rounded-2xl border border-indigo-100">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStars(s)}
                    className={`text-2xl lg:text-3xl transition transform active:scale-95 hover:scale-110 ${
                      s <= stars ? "text-amber-400 drop-shadow-sm" : "text-gray-300"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>

              {/* Review Options Cards Container */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                    AI Review Suggestions ({reviewsList.length})
                  </label>
                  <button
                    onClick={() => fetchAiReviews(stars)}
                    disabled={loading}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium underline"
                  >
                    🔄 Refresh AI
                  </button>
                </div>

                <div className="max-h-[250px] overflow-y-auto space-y-2 pr-1">
                  {loading ? (
                    <div className="py-8 text-center text-xs text-indigo-700 font-medium animate-pulse flex flex-col items-center gap-1.5">
                      <span>🤖</span> Gemini is writing tailored reviews...
                    </div>
                  ) : (
                    reviewsList.map((rev, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedReview(rev)}
                        className={`p-2.5 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all ${
                          selectedReview === rev
                            ? "border-indigo-600 bg-indigo-50/75 shadow-xs ring-1 ring-indigo-500"
                            : "border-gray-200 bg-gray-50/50 hover:bg-gray-100/80 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-semibold text-indigo-900 text-[10px] uppercase">
                            Option #{index + 1}
                          </span>
                          {selectedReview === rev && (
                            <span className="text-[9px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-medium">
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="italic leading-relaxed text-xs">"{rev}"</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Post Button */}
              <button
                onClick={() => handleCopyAndOpen()}
                disabled={loading || !selectedReview}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-indigo-600/30 active:scale-[0.98] disabled:opacity-50"
              >
                ⭐ Copy & Post on Google Maps
              </button>

              <p className="text-[10px] text-gray-400 text-center mt-2">
                Review copies automatically. Just paste it on Google & submit!
              </p>
            </>
          )}

          {/* Toast Notification */}
          {toast && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-4 py-2 rounded-full shadow-xl flex items-center gap-2 animate-bounce">
              <span>✅</span> Copied! Opening Google Maps...
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#090D16] flex items-center justify-center text-indigo-500">Loading Portal...</div>}>
      <ReviewContent />
    </Suspense>
  );
}



// "use client";

// import { useState, useEffect, Suspense } from "react";
// import { useSearchParams } from "next/navigation";

// function ReviewContent() {
//   const searchParams = useSearchParams();
  
//   const businessName = searchParams.get("business") || "Local Business";
//   const location = searchParams.get("location") || "";
//   const description = searchParams.get("desc") || "";
//   const placeId = searchParams.get("placeid") || "ChIJaakIxpQpEDkR76SF9ueUk2I";
//   const services = searchParams.get("services") || "";
//   const industry = searchParams.get("industry") || "";
//   const customerExperience = searchParams.get("experience") || "";

// const googleReviewUrl =
//   `https://search.google.com/local/writereview?placeid=${placeId}`;

//   const [stars, setStars] = useState(5);
//   const [reviewsList, setReviewsList] = useState([]);
//   const [selectedReview, setSelectedReview] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [toast, setToast] = useState(false);

//   // Fetch 5 dynamic options from Gemini API based on business context
//   const fetchAiReviews = async (selectedStars) => {
//     setLoading(true);
//     try {
//       const res = await fetch("/api/generate-review", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ 
//           businessName, 
//           location,
//           description,
//           services,
//           industry,
//           customerExperience,
//           stars: selectedStars
//         }),
//       });
//       const data = await res.json();
//       if (data.reviews && data.reviews.length > 0) {
//         setReviewsList(data.reviews);
//         setSelectedReview(data.reviews[0]);
//       }
//     } catch (err) {
//       console.error(err);
//       const fallback = ["Great service and wonderful experience overall! Highly recommended."];
//       setReviewsList(fallback);
//       setSelectedReview(fallback[0]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAiReviews(stars);
//   }, [stars]);

// const handleCopyAndOpen = async (textToPost) => {
//   const text = textToPost || selectedReview;

//   if (!text) return;

//   try {
//     await navigator.clipboard.writeText(text);

//     setToast(true);

//     setTimeout(() => {
//       setToast(false);
//     }, 2500);

//     if (googleReviewUrl) {
//       window.open(googleReviewUrl, "_blank");
//     }
//   } catch (error) {
//     console.error("Copy error:", error);

//     if (googleReviewUrl) {
//       window.open(googleReviewUrl, "_blank");
//     }
//   }
// };

//   return (
//     <div className="min-h-screen flex items-center justify-center  px-3 py-6">
//       <div className="w-full max-w-md bg-white p-5 sm:p-6 relative border border-indigo-500/20">
        
//         {/* Header Badge */}
//         <div className="text-center mb-4">
//           <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-1.5">
//             ✨ Customer Feedback
//           </span>
//           <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
//             {businessName}
//           </h2>
//           {location && <p className="text-xs text-gray-400">{location}</p>}
//           <p className="text-xs text-gray-500 mt-1">
//             Select your rating & pick an AI-crafted review option
//           </p>
//         </div>

//         {/* Star Rating Selector */}
//         <div className="flex justify-center gap-2 my-4 bg-indigo-50/60 py-3 rounded-2xl border border-indigo-100">
//           {[1, 2, 3, 4, 5].map((s) => (
//             <button
//               key={s}
//               type="button"
//               onClick={() => setStars(s)}
//               className={`text-3xl transition transform active:scale-95 hover:scale-110 ${
//                 s <= stars ? "text-amber-400 drop-shadow-sm" : "text-gray-300"
//               }`}
//             >
//               ★
//             </button>
//           ))}
//         </div>

//         {/* Review Options Cards Container */}
//         <div className="mb-4">
//           <div className="flex justify-between items-center mb-1.5">
//             <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
//               AI Review Suggestions ({reviewsList.length})
//             </label>
//             <button
//               onClick={() => fetchAiReviews(stars)}
//               disabled={loading}
//               className="text-xs text-indigo-600 hover:text-indigo-700 font-medium underline"
//             >
//               🔄 Refresh AI
//             </button>
//           </div>

//           <div className="max-h-[230px] overflow-y-auto space-y-2.5 pr-1">
//             {loading ? (
//               <div className="py-12 text-center text-sm text-indigo-700 font-medium animate-pulse flex flex-col items-center gap-2">
//                 <span>🤖</span> Gemini is writing tailored reviews...
//               </div>
//             ) : (
//               reviewsList.map((rev, index) => (
//                 <div
//                   key={index}
//                   onClick={() => setSelectedReview(rev)}
//                   className={`p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all ${
//                     selectedReview === rev
//                       ? "border-indigo-600 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-500"
//                       : "border-gray-200 bg-gray-50/50 hover:bg-gray-100/80 text-gray-700"
//                   }`}
//                 >
//                   <div className="flex items-center justify-between mb-1">
//                     <span className="font-semibold text-indigo-900 text-[10px] uppercase">
//                       Option #{index + 1}
//                     </span>
//                     {selectedReview === rev && (
//                       <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-medium">
//                         Selected
//                       </span>
//                     )}
//                   </div>
//                   <p className="italic leading-relaxed">"{rev}"</p>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         {/* Post Button */}
//         <button
//           onClick={() => handleCopyAndOpen()}
//           disabled={loading || !selectedReview}
//           className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/30 active:scale-[0.98] disabled:opacity-50"
//         >
//           ⭐ Copy & Post on Google Maps
//         </button>

//         <p className="text-[10px] text-gray-400 text-center mt-2.5">
//           Review copies automatically. Just paste it on Google & submit!
//         </p>

//         {/* Toast Notification */}
//         {toast && (
//           <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-4 py-2 rounded-full shadow-xl flex items-center gap-2 animate-bounce">
//             <span>✅</span> Copied! Opening Google Maps...
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default function ReviewPage() {
//   return (
//     <Suspense fallback={<div className="min-h-screen bg-stone-900 flex items-center justify-center text-indigo-500">Loading...</div>}>
//       <ReviewContent />
//     </Suspense>
//   );
// }