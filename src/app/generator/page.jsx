'use client';
import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

// Mock different business reviews for the rotating slides on the left
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

export default function QrGeneratorPage() {
  const [businessName, setBusinessName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [industry, setIndustry] = useState("");
  const [services, setServices] = useState("");
  const [googleUrl, setGoogleUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto rotate review slides every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % reviewSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!businessName || !placeId || !googleUrl) return;

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const params = new URLSearchParams({
      business: businessName,
      location,
      industry,
      services,
      desc: description,
      placeid: placeId,
      googleurl: googleUrl,
    });

    const url = `${baseUrl}/review?${params.toString()}`;
    setGeneratedUrl(url);
  };

  const handleCopy = () => {
    if (!generatedUrl) return;
    navigator.clipboard?.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const currentReview = reviewSlides[activeSlide];

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col lg:flex-row font-sans bg-[#090D16] text-slate-100 selection:bg-indigo-500 selection:text-white">
      
      {/* LEFT SIDE: Image Background with Dark Overlay & Rotating Review Slides */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#060911] p-10 flex-col justify-between overflow-hidden border-r border-indigo-500/20">
        
        {/* Background Image with Dark Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center pointer-events-none" 
          style={{ backgroundImage: `url('/admin.webp')` }}
        ></div>
        <div className="absolute inset-0 bg-linear-to-br from-[#060911]/60 via-[#090D16]/45 to-[#060911]/25 pointer-events-none"></div>


        {/* Center Aesthetic Content & Rotating Slides */}
        <div className="relative z-10 my-auto py-6 flex flex-col items-center text-center">
              <div className="flex items-center">
               <img src="/logo.webp" className="w-full h-20 object-cover" alt="" />
              </div>
      
          <h2 className="text-3xl xl:text-4xl font-light text-slate-100 mt-6">
            What <span className="font-serif italic font-normal text-indigo-400 underline decoration-indigo-500/50 underline-offset-8">clients</span>
          </h2>
          <p className="text-xs uppercase tracking-widest text-slate-300 font-semibold mb-8">say across all businesses</p>
    <div className="inline-block mb-6 px-3.5 py-1  bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide">
            UNIVERSAL BUSINESS REVIEW PORTAL
          </div>
          {/* Glassmorphic Rotating Slide Card */}
          <div className="relative w-full max-w-md mx-auto transition-all duration-700">
            <div className="absolute inset-x-4 -bottom-5 h-20 bg-slate-900/40 rounded-2xl border border-slate-800/50 backdrop-blur-sm transform scale-95 z-0"></div>
            
            <div className="relative z-20 bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-2xl text-left transition-all duration-500">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-bold text-xs text-white shadow-md">
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
              <p className="text-xs text-slate-200 leading-relaxed italic min-h-10">
                {currentReview.comment}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-300">
                <span>Industry: <strong className="text-indigo-300">{currentReview.industry}</strong></span>
                <span className="bg-indigo-500/20 text-indigo-200 px-2 py-0.5 rounded border border-indigo-500/30">Verified Review</span>
              </div>
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="flex items-center space-x-2 mt-6">
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
        <div className="relative z-10 text-[11px] text-slate-300 flex justify-between items-center border-t border-slate-800/80 pt-4">
          <span>&copy; 2026 Digital Paaji. All rights reserved.</span>
          <span className="text-indigo-300 font-medium">Review Panel for All Businesses</span>
        </div>
      </div>

      {/* RIGHT SIDE: Clean White Background Form & QR Generator (Fixed Viewport - No Scrolling) */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-center px-6 sm:px-12 xl:px-16 py-6 overflow-hidden bg-white text-slate-900 shadow-2xl">
        
        <div className="w-full max-w-xl mx-auto flex flex-col justify-center my-auto">
          
          {/* Mobile Brand Header */}
          <div className="lg:hidden flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-xs text-white">DP</div>
              <span className="font-extrabold text-sm tracking-wide text-slate-900">DIGITAL PAAJI</span>
            </div>
            <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full font-semibold">AI QR PORTAL</span>
          </div>

          <div>
        
            <h1 className="text-3xl xl:text-4xl font-light text-slate-900 ">
             Create <span className="font-serif italic font-normal text-indigo-500 "> AI Review QR</span>
            </h1>
            <p className="text-xs text-slate-500 my-4">
              Enter your business details below to generate an automated review QR code instantly.
            </p>
          </div>

          {!generatedUrl ? (
            <form onSubmit={handleGenerate} className="space-y-3">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Club 16 / Digital Paaji"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Google Place ID *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ChIJaakIxpQpEDkR..."
                    value={placeId}
                    onChange={(e) => setPlaceId(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Location / City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Patiala, Punjab"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Marketing Agency / Lounge"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Google Business Profile URL *
                </label>
                <input
                  type="url"
                  placeholder="Paste your Google Maps / Search review URL"
                  value={googleUrl}
                  onChange={(e) => setGoogleUrl(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Services Offered
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SEO, Web Dev, Dining"
                    value={services}
                    onChange={(e) => setServices(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Short Description
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description of your business"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-1 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-700 font-bold text-xs text-white uppercase tracking-wider transition shadow-lg shadow-indigo-500/30 active:scale-[0.99]"
              >
                Generate QR Code & Link 🚀
              </button>
            </form>
          ) : (
            <div className="bg-gray-50 border border-indigo-200 rounded-2xl p-5 text-center shadow-lg animate-fadeIn">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200">
                  {businessName} QR Ready 🎉
                </span>
                <button
                  onClick={() => setGeneratedUrl("")}
                  className="text-xs text-gray-500 hover:text-indigo-500 underline transition"
                >
                  Create New
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-5 my-2">
                <div className="p-3 bg-white rounded-2xl border-2 border-indigo-200 shadow-md inline-block">
                  <QRCodeSVG value={generatedUrl} size={130} level={"H"} includeMargin={true} />
                </div>
                
                <div className="text-left space-y-2 flex-1">
                  <p className="text-[11px] text-gray-600">
                    Scan this QR code with any smartphone camera to instantly test the AI review prompt generator flow.
                  </p>
                  
                  <div className="p-2 bg-white rounded-lg border border-gray-200 text-[10px] text-gray-500 break-all max-h-16 overflow-y-auto">
                    {generatedUrl}
                  </div>

                  <button
                    onClick={handleCopy}
                    className="w-full py-2 px-4 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium transition shadow-md flex items-center justify-center gap-2"
                  >
                    <span>{copied ? "✓ Copied to Clipboard!" : "📋 Copy Direct URL"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}





// "use client";

// import { useState } from "react";
// import { QRCodeSVG } from "qrcode.react";

// export default function QrGeneratorPage() {
//   const [businessName, setBusinessName] = useState("");
//   const [location, setLocation] = useState("");
//   const [description, setDescription] = useState("");
//   const [placeId, setPlaceId] = useState("");
//   const [generatedUrl, setGeneratedUrl] = useState("");
//   const [industry, setIndustry] = useState("");
//   const [services, setServices] = useState("");
//   const [googleUrl, setGoogleUrl] = useState("");
//   const handleGenerate = (e) => {
//     e.preventDefault();

//     if (!businessName || !placeId || !googleUrl) return;

//     const baseUrl = window.location.origin;

//     const params = new URLSearchParams({
//       business: businessName,
//       location,
//       industry,
//       services,
//       desc: description,
//       placeid: placeId,
//       googleurl: googleUrl,
//     });

//     const url = `${baseUrl}/review?${params.toString()}`;

//     setGeneratedUrl(url);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center px-4 py-8">
//       <div className="w-full max-w-lg bg-white p-6 sm:p-8 border border-indigo-500/20">
//         <div className="text-center mb-6">
//           <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
//             🚀 Universal Business Portal
//           </span>
//           <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
//             Create Custom AI Review QR
//           </h1>
//           <p className="text-xs sm:text-sm text-gray-500 mt-1">
//             Enter your business details to train AI review generation for your customers.
//           </p>
//         </div>

//         <form onSubmit={handleGenerate} className="space-y-4">
//           <div>
//             <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
//               Business Name *
//             </label>
//             <input
//               type="text"
//               placeholder="e.g. Club 16, Digital Paaji, or Elite Salon"
//               value={businessName}
//               onChange={(e) => setBusinessName(e.target.value)}
//               required
//               className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             />
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
//                 Location / City
//               </label>
//               <input
//                 type="text"
//                 placeholder="e.g. Patiala, Punjab"
//                 value={location}
//                 onChange={(e) => setLocation(e.target.value)}
//                 className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               />
//             </div>

//             <div>
//               <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
//                 Google Place ID *
//               </label>
//               <input
//                 type="text"
//                 placeholder="e.g. ChIJaakIxpQpEDkR76SF..."
//                 value={placeId}
//                 onChange={(e) => setPlaceId(e.target.value)}
//                 required
//                 className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
//               Short Description & Services
//             </label>
//             <textarea
//               rows={3}
//               placeholder="e.g. Premium lounge & bar serving gourmet snacks and cocktails with vibrant nightlife ambience."
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             />
//           </div>
// <div>
//   <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
//     Industry
//   </label>

//   <input
//     type="text"
//     placeholder="e.g. Digital Marketing Agency"
//     value={industry}
//     onChange={(e) => setIndustry(e.target.value)}
//     className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//   />
// </div>
// <div>
//   <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
//     Google Business Profile URL *
//   </label>

//   <input
//     type="url"
//     placeholder="Paste your Google Maps / Google Business URL"
//     value={googleUrl}
//     onChange={(e) => setGoogleUrl(e.target.value)}
//     required
//     className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//   />

//   <p className="text-[10px] text-gray-400 mt-1">
//     Paste the Google Search/Maps URL where customers can see your business
//     and leave a review.
//   </p>
// </div>
// <div>
//   <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
//     Services Offered
//   </label>

//   <input
//     type="text"
//     placeholder="e.g. SEO, Web Development, Social Media Marketing"
//     value={services}
//     onChange={(e) => setServices(e.target.value)}
//     className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//   />
// </div>

//           <button
//             type="submit"
//             className="w-full py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-700  font-bold text-sm transition shadow-lg shadow-indigo-500/30 active:scale-[0.98]"
//           >
//             Generate QR Code & Link 🎯
//           </button>
//         </form>

//         {generatedUrl && (
//           <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center text-center">
//             <h3 className="text-sm font-bold text-gray-800 mb-3">
//               QR Code Ready for {businessName}:
//             </h3>
            
//             <div className="p-4 bg-white border-2 border-indigo-200 rounded-2xl shadow-md mb-4">
//               <QRCodeSVG value={generatedUrl} size={180} level={"H"} includeMargin={true} />
//             </div>

//             <p className="text-xs text-gray-500 break-all bg-gray-50 p-2.5 rounded-xl border border-gray-200 w-full mb-3">
//               {generatedUrl}
//             </p>

//             <button
//               onClick={() => {
//                 navigator.clipboard.writeText(generatedUrl);
//                 alert("Review URL copied to clipboard!");
//               }}
//               className="text-xs bg-gray-900  px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition"
//             >
//               📋 Copy Direct URL
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }