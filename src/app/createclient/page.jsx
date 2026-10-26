
"use client";

import React, { useState } from "react";
import axios from "axios";
import Image from "next/image";
import { IoIosHelpCircle } from "react-icons/io";
import {
  FiMail,
  FiLock,
  FiBriefcase,
  FiMapPin,
  FiLink,
  FiArrowRight,
  FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiLoader,
  FiExternalLink,
} from "react-icons/fi";

import LeftHeroPanel from "../components/LeftHeroPanel";
import { useRouter } from "next/navigation";

const PLACE_ID_FINDER =
  "https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder";

const Page = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    businessName: "",
    placeId: "",
    googleUrl: "",
  });

  const route = useRouter()
  const [showhelp, setShowhelp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const helpContent = {
    placeid: {
      title: "Find your Google Place ID",
      subtitle:
        "Follow these steps to find and copy your business's unique Place ID.",
      image: "/gifs/place.gif",
      externalLink: PLACE_ID_FINDER,
      linkText: "Open Place ID Finder",
      steps: [
        {
          title: "Open Place ID Finder",
          description:
            "Click the button below to open Google's official Place ID Finder in a new tab.",
        },
        {
          title: "Search for your business",
          description:
            "Enter your exact business name. Add your city or location if multiple businesses have similar names.",
        },
        {
          title: "Select your business",
          description:
            "Choose the correct listing and check that the business location is accurate.",
        },
        {
          title: "Scroll down to Place ID",
          description:
            "Find the Place ID field below the map or search area. It contains the unique identifier for your selected business.",
        },
        {
          title: "Copy the Place ID",
          description:
            "Copy the complete Place ID and paste it into the Google Place ID field in this form.",
        },
      ],
      note: "Copy the Place ID itself, not the business name or the Google Maps URL.",
    },

    googleurl: {
      title: "Get your Google Business URL",
      subtitle:
        "Find your business on Google and copy its shareable profile link.",
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
            "Find your business in the search results and make sure the name and address match.",
        },
        {
          title: "Click Share",
          description:
            "On your business profile, click the Share option. If needed, open the listing in Google Maps first.",
        },
        {
          title: "Copy the link",
          description:
            "Click Copy link to copy the URL for your business listing.",
        },
        {
          title: "Paste the URL",
          description:
            "Return to this form and paste the copied link into the Google Business / Review URL field.",
        },
      ],
      note: "Use the link for your actual business listing. You can also use a direct Google review link if you have one.",
    },
  };

  const handleInput = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (message.text) {
      setMessage({ type: "", text: "" });
    }
  };

  const toggleHelp = (section) => {
    setShowhelp((current) => (current === section ? "" : section));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      setLoading(true);

      const response = await axios.post(
        "/api/account-requests",
        formData
      );

      const data = response.data;

      if (data.success) {
        setMessage({
          type: "success",
          text:
            data.message ||
            "Your account request has been submitted successfully.",
        });

        setFormData({
          email: "",
          password: "",
          businessName: "",
          placeId: "",
          googleUrl: "",
        });
      
route.push("/")


      } else {
        setMessage({
          type: "error",
          text: data.message || "Unable to submit your request.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const activeHelp = helpContent[showhelp];

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10";

  return (
    <div className="h-screen w-full overflow-hidden bg-[#090D16] font-sans text-slate-100 selection:bg-indigo-500 selection:text-white">
      <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-3">

        {/* LEFT HERO: fixed to viewport height */}
        <aside className="hidden min-h-0 lg:sticky lg:top-0 lg:col-span-1 lg:block lg:h-screen lg:overflow-hidden">
          <LeftHeroPanel />
        </aside>

        {/* RIGHT SIDE: independent scrolling */}
        <main className="col-span-1 h-screen min-h-0 overflow-y-auto overscroll-contain bg-white text-slate-900 lg:col-span-2">
          <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col justify-center px-5 py-6 sm:px-8 lg:px-8 xl:px-10">

            {/* Heading */}
            <div className="mb-6 shrink-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                BUSINESS REGISTRATION
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Create your account
              </h1>

              <p className="mt-2 max-w-lg text-sm leading-5 text-slate-500">
                Register your business to get started with your Google review
                management dashboard.
              </p>
            </div>

            {/* Success / Error */}
            {message.text && (
              <div
                role="alert"
                className={`mb-5 flex shrink-0 items-start gap-3 rounded-xl border p-3 text-sm ${
                  message.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message.type === "success" ? (
                  <FiCheckCircle className="mt-0.5 shrink-0" size={18} />
                ) : (
                  <FiAlertCircle className="mt-0.5 shrink-0" size={18} />
                )}

                <p>{message.text}</p>
              </div>
            )}

            {/* Form + Help */}
            <div className="grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-2">

              {/* FORM */}
              <form onSubmit={handleSubmit} className="min-w-0 space-y-4">

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <FiMail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={17}
                    />

                    <input
                      id="email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      className={inputClass}
                      value={formData.email}
                      onChange={handleInput}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <FiLock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={17}
                    />

                    <input
                      id="password"
                      type="password"
                      name="password"
                      autoComplete="new-password"
                      placeholder="Create a strong password"
                      className={inputClass}
                      value={formData.password}
                      onChange={handleInput}
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                {/* Business name */}
                <div>
                  <label
                    htmlFor="businessName"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
                  >
                    Business name
                  </label>

                  <div className="relative">
                    <FiBriefcase
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={17}
                    />

                    <input
                      id="businessName"
                      type="text"
                      name="businessName"
                      placeholder="Your business name"
                      className={inputClass}
                      value={formData.businessName}
                      onChange={handleInput}
                      required
                    />
                  </div>
                </div>

                {/* Place ID */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <label
                      htmlFor="placeId"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Google Place ID
                    </label>

                    <button
                      type="button"
                      onClick={() => toggleHelp("placeid")}
                      aria-expanded={showhelp === "placeid"}
                      className={`inline-flex items-center gap-1 text-xs font-semibold ${
                        showhelp === "placeid"
                          ? "text-indigo-700"
                          : "text-indigo-500 hover:text-indigo-700"
                      }`}
                    >
                      <IoIosHelpCircle size={20} />
                      How to find?
                    </button>
                  </div>

                  <div className="relative">
                    <FiMapPin
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={17}
                    />

                    <input
                      id="placeId"
                      type="text"
                      name="placeId"
                      placeholder="Enter your Google Place ID"
                      className={inputClass}
                      value={formData.placeId}
                      onChange={handleInput}
                      required
                    />
                  </div>
                </div>

                {/* Google URL */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <label
                      htmlFor="googleUrl"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Google Business / Review URL
                    </label>

                    <button
                      type="button"
                      onClick={() => toggleHelp("googleurl")}
                      aria-expanded={showhelp === "googleurl"}
                      className={`inline-flex items-center gap-1 text-xs font-semibold ${
                        showhelp === "googleurl"
                          ? "text-indigo-700"
                          : "text-indigo-500 hover:text-indigo-700"
                      }`}
                    >
                      <IoIosHelpCircle size={20} />
                      How to get?
                    </button>
                  </div>

                  <div className="relative">
                    <FiLink
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={17}
                    />

                    <input
                      id="googleUrl"
                      type="url"
                      name="googleUrl"
                      placeholder="https://maps.app.goo.gl/..."
                      className={inputClass}
                      value={formData.googleUrl}
                      onChange={handleInput}
                      required
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <FiLoader className="animate-spin" size={18} />
                      Submitting request...
                    </>
                  ) : (
                    <>
                      Create account
                      <FiArrowRight
                        className="transition-transform group-hover:translate-x-1"
                        size={18}
                      />
                    </>
                  )}
                </button>

                <p className="pb-2 text-center text-xs leading-5 text-slate-400">
                  Your account request will be processed according to your
                  platform&apos;s registration workflow.
                </p>
              </form>

              {/* HELP PANEL: sticky on desktop */}
              <aside className="min-w-0 xl:sticky xl:top-4">
                {activeHelp ? (
                  <div className="flex max-h-[calc(100vh-2rem)] min-h-0 flex-col overflow-hidden rounded-2xl border border-indigo-100 bg-slate-50 shadow-sm">

                    {/* Fixed help header */}
                    <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 bg-white p-4">
                      <div>
                        <div className="mb-2 inline-flex rounded-lg bg-indigo-50 p-2 text-indigo-600">
                          <IoIosHelpCircle size={21} />
                        </div>

                        <h2 className="text-sm font-bold text-slate-900">
                          {activeHelp.title}
                        </h2>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {activeHelp.subtitle}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowhelp("")}
                        aria-label="Close help"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      >
                        <FiX size={18} />
                      </button>
                    </div>

                    {/* Scrollable help content */}
                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                      <div className="border-b border-slate-200 bg-white p-3">
                        <Image
                          src={activeHelp.image}
                          alt={activeHelp.title}
                          width={640}
                          height={420}
                          unoptimized
                          className="h-auto max-h-48 w-full rounded-xl border border-slate-100 object-contain"
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

                        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Follow these steps
                        </h3>

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
                                <p className="text-xs font-bold text-slate-800">
                                  {step.title}
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
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
                  <div className="flex min-h-[260px] flex-col justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                      <IoIosHelpCircle size={34} />
                    </div>

                    <h2 className="text-center text-sm font-bold text-slate-800">
                      Need help with setup?
                    </h2>

                    <p className="mx-auto mt-2 max-w-xs text-center text-xs leading-5 text-slate-500">
                      Select the help icon beside either field to view the GIF
                      and step-by-step instructions.
                    </p>

                    <div className="mt-5 space-y-2">
                      <button
                        type="button"
                        onClick={() => setShowhelp("placeid")}
                        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-left text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
                      >
                        <span className="flex items-center gap-2">
                          <FiMapPin size={16} />
                          Find Google Place ID
                        </span>
                        <FiArrowRight size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowhelp("googleurl")}
                        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-left text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
                      >
                        <span className="flex items-center gap-2">
                          <FiLink size={16} />
                          Get Google business URL
                        </span>
                        <FiArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Page;
