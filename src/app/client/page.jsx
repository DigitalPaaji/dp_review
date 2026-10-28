"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import {
  FiMapPin,
  FiBriefcase,
  FiTool,
  FiFileText,
  FiZap,
  FiLoader,
  FiCopy,
  FiDownload,
  FiCheck,
  FiExternalLink,
  FiRefreshCw,
  FiShield,
  FiClock,
  FiAlertCircle,
  FiStar,
} from "react-icons/fi";
import { RiFindReplaceLine } from "react-icons/ri";
import { TbBrandGoogleMaps } from "react-icons/tb";

axios.defaults.withCredentials = true;

export default function Page() {
  const [currentClient, setCurrentClient] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const [bgColor,setBgcolor]=useState("#ffffff")
  const [fgColor,setfgColorr]=useState("#000000")




  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get("/api/clients");
        const data = response.data;

        if (data.success && data.client) {
          setCurrentClient(data.client);
        } else {
          setError(data.message || "Unable to load your business details.");
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load your account. Please try again."
        );
      } finally {
        setPageLoading(false);
      }
    };

    getData();
  }, []);

  const handleClientGenerateQr = async (
    placeId,
    googleUrl,
    location,
    industry,
    services,
    description
  ) => {

  
    if (!currentClient || saving) return;

    setError("");
    setSaving(true);

    try {
      const expiryTimestamp = new Date(currentClient.expiryDate).getTime();

      if (!Number.isFinite(expiryTimestamp)) {
        throw new Error("Your account expiry date is invalid.");
      }

      const params = new URLSearchParams({
        business: currentClient.businessName || "",
        location,
        industry,
        services,
        desc: description,
        placeid: placeId || "",
        googleurl: googleUrl || "",
        expires: String(expiryTimestamp),
      });

      const url = `${window.location.origin}/review?${params.toString()}`;
  console.log({ params,url})

    // return 
      const response = await axios.put("/api/clients", {
        id: currentClient._id,
        hasGeneratedQr: true,
        savedQrUrl: url,
          placeId,
    googleUrl,
      });

      if (response.data.success) {
        setCurrentClient(response.data.client);
      } else {
        setError(response.data.message || "Failed to generate your QR code.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong while generating your QR code."
      );
    } finally {
      setSaving(false);
    }
  };

  const copyLink = async () => {
    if (!currentClient?.savedQrUrl) return;

    try {
      await navigator.clipboard.writeText(currentClient.savedQrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy the link. Please copy the URL manually.");
    }
  };

 
const downloadQr = async () => {
  const svg = document.getElementById("client-review-qr");

  if (!svg || !currentClient?.savedQrUrl) {
    setError("QR code is not available.");
    return;
  }

  let svgUrl;
  let pngUrl;

  try {
    setError("");

    const clonedSvg = svg.cloneNode(true);

    clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clonedSvg.setAttribute("width", "800");
    clonedSvg.setAttribute("height", "800");

   
    const images = clonedSvg.querySelectorAll("image");

    for (const img of images) {
      const src =
        img.getAttribute("href") ||
        img.getAttributeNS(
          "http://www.w3.org/1999/xlink",
          "href"
        );

      if (!src || src.startsWith("data:")) continue;

      const response = await fetch(
        new URL(src, window.location.href).href
      );

      if (!response.ok) {
        throw new Error("Unable to load the QR logo.");
      }

      const blob = await response.blob();

      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Logo conversion failed."));
        reader.readAsDataURL(blob);
      });

      img.setAttribute("href", dataUrl);
      img.setAttributeNS(
        "http://www.w3.org/1999/xlink",
        "xlink:href",
        dataUrl
      );
    }

    const svgBlob = new Blob(
      [new XMLSerializer().serializeToString(clonedSvg)],
      { type: "image/svg+xml;charset=utf-8" }
    );

    svgUrl = URL.createObjectURL(svgBlob);

    // Load SVG into an image.
    const image = new window.Image();
    
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error("Unable to render QR code."));
      image.src = svgUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 800;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Unable to create canvas.");
    }

    // Selected background color.
    ctx.fillStyle = bgColor || "#ffffff";
    ctx.fillRect(0, 0, 800, 800);

    // Render QR and center logo.
    ctx.drawImage(image, 0, 0, 800, 800);

    const pngBlob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("PNG generation failed."));
        },
        "image/png"
      );
    });

    pngUrl = URL.createObjectURL(pngBlob);

    const safeName =
      (currentClient.businessName || "business")
        .trim()
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-|-$/g, "") || "business";

    const anchor = document.createElement("a");
    anchor.href = pngUrl;
    anchor.download = `${safeName}-review-qr.png`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    // Do not revoke immediately; give the browser time to start downloading.
    setTimeout(() => {
      if (pngUrl) URL.revokeObjectURL(pngUrl);
    }, 2000);
  } catch (error) {
    console.error("QR download failed:", error);

    setError(
      error instanceof Error
        ? error.message
        : "Unable to download QR image."
    );
  } finally {
    if (svgUrl) URL.revokeObjectURL(svgUrl);
  }
};

const handelLogout =async()=>{
  try {
const response = await axios.post("/api/auth/logout")
const data = await response.data;
if(data.success){
location.href="/"
}
else{
  setError(data.message)
}

} catch (error) {
    setError(error?.response?.data?.message)  
  }
}


  if (pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <FiLoader className="animate-spin text-gray-800" size={32} />
          <p className="text-sm text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen overflow-auto bg-[#f7f8fa] text-gray-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 flex flex-col justify-between gap-5 rounded-3xl bg-[#151515] p-6 text-white shadow-lg sm:flex-row sm:items-center sm:p-8">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm text-gray-300">
              <FiStar className="text-amber-400" />
              Business dashboard
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Review QR Code
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-300">
              Help customers reach your review page instantly. Display your QR
              code at your counter, on packaging, or on printed materials.
            </p>
          </div>

          <button onClick={handelLogout} className="flex cursor-pointer  px-4 py-2 shrink-0 items-center justify-center self-start rounded-2xl border border-white/10 bg-white/10 sm:self-center">
           logout
            
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <FiAlertCircle size={19} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {currentClient?.hasGeneratedQr && currentClient?.savedQrUrl ? (
          <div className="space-y-6">
            {/* Status and business */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <FiBriefcase size={23} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold">
                      {currentClient.businessName}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {currentClient.email}
                    </p>
                  </div>
                </div>

                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                  <FiCheck size={15} />
                  QR Code Generated
                </span>
              </div>
            </section>

            {/* QR and actions */}
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-5 sm:px-7">
                <h2 className="text-lg font-bold">Your review QR code</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Scan to open your personalized review page.
                </p>
              </div>

              <div className="grid gap-8 p-5 sm:p-7 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-center">
                {/* QR preview */}
                <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-gray-50 p-5">
               
                  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <QRCodeSVG
  id="client-review-qr"
  value={currentClient.savedQrUrl}
  title={"Title for my QR Code"}
  size={228}
  bgColor={bgColor}
  fgColor={fgColor}
  level={"L"}
  minVersion={5}
  imageSettings={{
    src: "/logo2.webp",
     x: undefined,
    y: undefined,
    height: 50,
    width:50,
    opacity: 1,
    excavate: true,
  }}
/>
         
         
      
                  </div>
                  

                  <p className="mt-4 text-sm font-semibold text-gray-800">
                    {currentClient.businessName}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Scan to leave a review
                  </p>

                  <button
                    type="button"
                    onClick={downloadQr}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-700"
                  >
                    <FiDownload size={17} />
                    Download QR as PNG
                  </button>
                </div>

                {/* Link and actions */}
                <div className="min-w-0">
                  <div  className="flex justify-between items-center">
                  <div className="mb-5">
                    <h3 className="text-base font-bold">Share your QR link</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Copy the link to share digitally, or open it to check
                      your review page.
                    </p>
                  </div>
   <div className="flex ">
                   <input type="color" value={bgColor} onChange={(e)=>setBgcolor(e.target.value)} />  
                   <input type="color" value={fgColor} onChange={(e)=>setfgColorr(e.target.value)} />  
                    <button onClick={()=>{setBgcolor("#ffffff"),setfgColorr("#000000")}} >Reset</button>

                   </div>

                   </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 sm:p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Your review URL
                    </p>

                    <p className="break-all text-sm leading-6 text-gray-800">
                      {currentClient.savedQrUrl}
                    </p>

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={copyLink}
                        className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                          copied
                            ? "bg-emerald-600 text-white"
                            : "bg-gray-900 text-white hover:bg-gray-700"
                        }`}
                      >
                        {copied ? (
                          <FiCheck size={17} />
                        ) : (
                          <FiCopy size={17} />
                        )}
                        {copied ? "Link Copied!" : "Copy Link"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          window.open(
                            currentClient.savedQrUrl,
                            "_blank",
                            "noopener,noreferrer"
                          )
                        }
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                      >
                        <FiExternalLink size={17} />
                        Open Review Page
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="flex items-start gap-3 rounded-xl border border-gray-100 p-4">
                      <FiShield className="mt-0.5 shrink-0 text-emerald-600" size={19} />
                      <div>
                        <p className="text-sm font-semibold">Easy to share</p>
                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          Print it or share your link with customers.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl border border-gray-100 p-4">
                      <FiClock className="mt-0.5 shrink-0 text-gray-500" size={19} />
                      <div>
                        <p className="text-sm font-semibold">Account expiry</p>
                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          {currentClient.expiryDate
                            ? new Date(
                                currentClient.expiryDate
                              ).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : currentClient ? (
          <GenrateYouQr
            handleClientGenerateQr={handleClientGenerateQr}
            loading={saving}
          />
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <FiAlertCircle className="mx-auto mb-4 text-gray-400" size={36} />
            <h2 className="text-lg font-bold">Business details unavailable</h2>
            <p className="mt-2 text-sm text-gray-500">
              We could not find your client details. Please try again.
            </p>
            <button
              type="button"
              onClick={() => router.refresh()}
              className="mt-5 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-700"
            >
              Refresh page
            </button>
          </div>
        )}
      </div>
    </main>
  );
}






import Image from "next/image";
import {



  FiX,
  FiArrowRight,
} from "react-icons/fi";

import { IoIosHelpCircle } from "react-icons/io";

const PLACE_ID_FINDER =
  "https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder";

const helpContent = {
  placeid: {
    title: "Find your Google Place ID",
    subtitle:
      "Find and copy the unique Place ID for your business listing.",
    image: "/gifs/place.gif",
    externalLink: PLACE_ID_FINDER,
    linkText: "Open Place ID Finder",
    steps: [
      {
        title: "Open Place ID Finder",
        description:
          "Click the button above to open Google's official Place ID Finder in a new tab.",
      },
      {
        title: "Search for your business",
        description:
          "Enter your exact business name. Add your city or location if multiple businesses have similar names.",
      },
      {
        title: "Select your business",
        description:
          "Choose the correct listing and verify that the business name and location match.",
      },
      {
        title: "Find the Place ID",
        description:
          "Look for the Place ID displayed for the selected location in the finder.",
      },
      {
        title: "Copy and paste",
        description:
          "Copy the complete Place ID and paste it into the Google Place ID field in this form.",
      },
    ],
    note:
      "Enter the Place ID itself, not your business name or Google Maps URL.",
  },

  googleurl: {
    title: "Get your Google Business URL",
    subtitle:
      "Copy the shareable Google Maps link for your actual business listing.",
    image: "/gifs/google.gif",
    externalLink: "https://www.google.com/",
    linkText: "Open Google Search",
    steps: [
      {
        title: "Search for your business",
        description:
          "Open Google Search and type your exact business name, including your city if needed.",
      },
      {
        title: "Open your business profile",
        description:
          "Select your business listing and verify that its name and address are correct.",
      },
      {
        title: "Click Share",
        description:
          "Click Share on the business profile. If necessary, open the listing in Google Maps first.",
      },
      {
        title: "Copy the link",
        description:
          "Click Copy link to copy your business listing URL.",
      },
      {
        title: "Paste the URL",
        description:
          "Return to this form and paste the copied link into the Google Business / Review URL field.",
      },
    ],
    note:
      "Use the URL for your actual business listing. A direct Google review link can also be used if that is what your application requires.",
  },
};

 function GenrateYouQr({
  handleClientGenerateQr,
  loading = false,
}) {
  const [newData, setNewData] = useState({
    googleUrl: "",
    placeId: "",
    location: "",
    industry: "",
    services: "",
    description: "",
  });

  const [formError, setFormError] = useState("");
  const [showHelp, setShowHelp] = useState("");
  const [submitError, setSubmitError] = useState("");

  const fields = [
    {
      name: "placeId",
      label: "Google Place ID",
      placeholder: "Paste your Google Place ID",
      icon: RiFindReplaceLine,
      required: true,
      help: "placeid",
    },
    {
      name: "googleUrl",
      label: "Google Business / Review URL",
      placeholder: "https://maps.app.goo.gl/...",
      icon: TbBrandGoogleMaps,
      required: true,
      type: "url",
      help: "googleurl",
    },
    {
      name: "location",
      label: "Business location",
      placeholder: "e.g. Ludhiana, Punjab",
      icon: FiMapPin,
      required: true,
    },
    {
      name: "industry",
      label: "Industry",
      placeholder: "e.g. Restaurant, Salon, Hotel",
      icon: FiBriefcase,
      required: true,
    },
    {
      name: "services",
      label: "Services",
      placeholder: "e.g. Dining, Catering, Home Delivery",
      icon: FiTool,
      required: true,
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setNewData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFormError("");
    setSubmitError("");
  };

  const toggleHelp = (section) => {
    setShowHelp((current) => (current === section ? "" : section));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitError("");

    if (
      !newData.placeId.trim() ||
      !newData.googleUrl.trim() ||
      !newData.location.trim() ||
      !newData.industry.trim() ||
      !newData.services.trim()
    ) {
      setFormError("Please fill in all required fields.");
      return;
    }

    try {
      const parsedUrl = new URL(newData.googleUrl.trim());

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        setFormError("Please enter a valid Google Business URL.");
        return;
      }
    } catch {
      setFormError("Please enter a valid Google Business URL.");
      return;
    }

    try {
      await handleClientGenerateQr(
        newData.placeId.trim(),
        newData.googleUrl.trim(),
        newData.location.trim(),
        newData.industry.trim(),
        newData.services.trim(),
        newData.description.trim()
      );
    } catch (error) {
      setSubmitError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to generate QR code. Please try again."
      );
    }
  };

  const activeHelp = helpContent[showHelp];

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/5 disabled:opacity-60";

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-100 px-5 py-6 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white">
            <FiZap size={22} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Set up your review QR
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Personalize the page your customers will see.
            </p>
          </div>
        </div>
      </div>

      {/* Form and help panel */}
      <form onSubmit={handleSubmit}>
        <div className="grid items-start gap-6 p-5 sm:p-8 xl:grid-cols-2">
          {/* Left: Form fields */}
          <div className="min-w-0 space-y-5">
            {fields.map((field) => {
              const Icon = field.icon;

              return (
                <div key={field.name}>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <label
                      htmlFor={field.name}
                      className="text-sm font-semibold text-gray-700"
                    >
                      {field.label}
                      {field.required && (
                        <span className="ml-1 text-red-500">*</span>
                      )}
                    </label>

                    {field.help && (
                      <button
                        type="button"
                        onClick={() => toggleHelp(field.help)}
                        aria-expanded={showHelp === field.help}
                        className={`inline-flex items-center gap-1 text-xs font-semibold transition ${
                          showHelp === field.help
                            ? "text-indigo-700"
                            : "text-indigo-500 hover:text-indigo-700"
                        }`}
                      >
                        <IoIosHelpCircle size={19} />
                        {field.help === "placeid"
                          ? "How to find?"
                          : "How to get?"}
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <Icon
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type || "text"}
                      value={newData[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      required={field.required}
                      disabled={loading}
                      autoComplete="off"
                      className={inputClass}
                    />
                  </div>
                </div>
              );
            })}

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Business description
                <span className="ml-1 font-normal text-gray-400">
                  (Optional)
                </span>
              </label>

              <div className="relative">
                <FiFileText
                  size={18}
                  className="absolute left-3.5 top-4 text-gray-400"
                />

                <textarea
                  id="description"
                  name="description"
                  value={newData.description}
                  onChange={handleChange}
                  placeholder="Tell customers about your business and the services you provide..."
                  rows={5}
                  maxLength={500}
                  disabled={loading}
                  className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm leading-6 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/5 disabled:opacity-60"
                />
              </div>

              <p className="mt-2 text-right text-xs text-gray-400">
                {newData.description.length}/500 characters
              </p>
            </div>

            {/* QR reminder */}
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <div className="flex gap-3">
                <FiShield
                  className="mt-0.5 shrink-0 text-amber-700"
                  size={18}
                />

                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Keep your QR accessible
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-600">
                    After generating your QR code, download and save the image
                    so you can print it whenever you need it.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Help panel */}
          <aside className="min-w-0 xl:sticky xl:top-4">
            {activeHelp ? (
              <div className="flex max-h-[min(720px,80vh)] min-h-[360px] flex-col overflow-hidden rounded-2xl border border-indigo-100 bg-gray-50 shadow-sm">
                {/* Fixed help header */}
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-200 bg-white p-4">
                  <div>
                    <div className="mb-2 inline-flex rounded-lg bg-indigo-50 p-2 text-indigo-600">
                      <IoIosHelpCircle size={21} />
                    </div>

                    <h3 className="text-sm font-bold text-gray-900">
                      {activeHelp.title}
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      {activeHelp.subtitle}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowHelp("")}
                    aria-label="Close help"
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                  >
                    <FiX size={18} />
                  </button>
                </div>

                {/* Scrollable help content */}
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                  <div className="border-b border-gray-200 bg-white p-3">
                    <Image
                      src={activeHelp.image}
                      alt={activeHelp.title}
                      width={640}
                      height={420}
                      unoptimized
                      className="h-auto max-h-48 w-full rounded-xl border border-gray-100 object-contain"
                    />
                  </div>

                  <div className="p-4">
                    <a
                      href={activeHelp.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                      <FiExternalLink size={16} />
                      {activeHelp.linkText}
                    </a>

                    <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Follow these steps
                    </h4>

                    <ol className="space-y-4">
                      {activeHelp.steps.map((step, index) => (
                        <li
                          key={step.title}
                          className="flex items-start gap-3"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                            {index + 1}
                          </span>

                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-800">
                              {step.title}
                            </p>

                            <p className="mt-1 text-xs leading-5 text-gray-500">
                              {step.description}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>

                    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3">
                      <p className="text-xs leading-5 text-amber-900">
                        <strong>Important:</strong> {activeHelp.note}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[320px] flex-col justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 p-6">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <IoIosHelpCircle size={34} />
                </div>

                <h3 className="text-center text-sm font-bold text-gray-800">
                  Need help with Google setup?
                </h3>

                <p className="mx-auto mt-2 max-w-xs text-center text-xs leading-5 text-gray-500">
                  Select the help link beside either Google field to see the GIF
                  and step-by-step instructions.
                </p>

                <div className="mt-5 space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowHelp("placeid")}
                    className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white p-3 text-left text-xs font-semibold text-gray-700 transition hover:border-indigo-300 hover:text-indigo-700"
                  >
                    <span className="flex items-center gap-2">
                      <RiFindReplaceLine size={17} />
                      Find Google Place ID
                    </span>
                    <FiArrowRight size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowHelp("googleurl")}
                    className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white p-3 text-left text-xs font-semibold text-gray-700 transition hover:border-indigo-300 hover:text-indigo-700"
                  >
                    <span className="flex items-center gap-2">
                      <TbBrandGoogleMaps size={17} />
                      Get Google Business URL
                    </span>
                    <FiArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Form errors */}
        {(formError || submitError) && (
          <p
            role="alert"
            className="mx-5 mb-4 text-sm text-red-600 sm:mx-8"
          >
            {formError || submitError}
          </p>
        )}

        {/* Submit footer */}
        <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/70 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-xs text-gray-500">
            Fields marked with * are required.
          </p>

          <button
            type="submit"
            disabled={
              loading ||
              !newData.placeId.trim() ||
              !newData.googleUrl.trim() ||
              !newData.location.trim() ||
              !newData.industry.trim() ||
              !newData.services.trim()
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin" size={17} />
                Generating QR...
              </>
            ) : (
              <>
                <FiZap size={17} />
                Generate QR Code
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
