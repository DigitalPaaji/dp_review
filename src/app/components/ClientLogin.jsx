'use client';
import Link from "next/link";
import React from "react";

export default function ClientLogin({
  clientEmail,
  setClientEmail,
  clientPassword,
  setClientPassword,
  handleClientLogin,
  clientLoginError,
  setViewMode,
}) {
  const [showRequestForm, setShowRequestForm] = React.useState(false);
  const [requestData, setRequestData] = React.useState({
    contactName: "",
    businessName: "",
    email: "",
    phone: "",
    location: "",
    googleUrl: "",
    message: "",
  });
  const [requestStatus, setRequestStatus] = React.useState("");
  const [requestLoading, setRequestLoading] = React.useState(false);

  const updateRequest = (e) => {
    setRequestData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestStatus("");
    setRequestLoading(true);

    try { 
      const res = await fetch("/api/account-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const data = await res.json();    

      if (!res.ok || !data.success) {
        setRequestStatus(
          data.message || "Unable to submit your request."
        );
        return;
      }

      setRequestStatus(
        data.message || "Your request has been submitted successfully."
      );

      setRequestData({
        contactName: "",
        businessName: "",
        email: "",
        phone: "",
        location: "",
        googleUrl: "",
        message: "",
      });
    } catch {
      setRequestStatus("Connection error. Please try again.");
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div className="w-full min-w-0 max-w-md mx-auto">
      <div
        className="
          w-full
          max-h-[calc(100dvh-2rem)]
          overflow-y-auto
          overscroll-contain
          rounded-2xl
          border border-gray-200
          bg-gray-50
          p-5 sm:p-7
          shadow-xl
          [scrollbar-width:thin]
        "
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-indigo-700 leading-tight">
              {showRequestForm
                ? "Business Account Request"
                : "Client Portal Login 🔐"}
            </h1>

            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              {showRequestForm
                ? "Share your business details and our team will contact you about access."
                : "Access your 1-year valid business review QR code."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setViewMode("admin-login")}
            className="shrink-0 text-[10px] sm:text-[11px] bg-indigo-50 text-indigo-600 px-2.5 py-2 rounded-lg border border-indigo-200 hover:bg-indigo-100 font-semibold"
          >
            Admin Portal ⚙️
          </button>
        </div>

        {!showRequestForm ? (
          <>
            {clientLoginError && (
              <div
                role="alert"
                className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl"
              >
                {clientLoginError}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleClientLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Business Email *
                </label>

                <input
                  type="email"
                  autoComplete="username"
                  placeholder="e.g. club16@digitalpaaji.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  required
                  className="w-full min-w-0 bg-white border border-gray-200 rounded-xl px-3.5 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password *
                </label>

                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={clientPassword}
                  onChange={(e) => setClientPassword(e.target.value)}
                  required
                  className="w-full min-w-0 bg-white border border-gray-200 rounded-xl px-3.5 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-700 active:scale-[0.99] transition font-bold text-xs text-white uppercase tracking-wider shadow-lg"
              >
                Login to Portal 🚀
              </button>
            </form>

            {/* Account Request Toggle */}
            <div className="mt-5 border-t border-gray-200 pt-4 text-center">
              <p className="text-xs text-gray-500">
                Don&apos;t have a business account yet?
              </p>

              <Link
              
              href={"/createclient"}
              // onClick={() => {
                //   setShowRequestForm(true);
                //   setRequestStatus("");
                // }}
                className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Request a Business Account →
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Back to Login */}
            <button
              type="button"
              onClick={() => {
                setShowRequestForm(false);
                setRequestStatus("");
              }}
              className="mb-4 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              ← Back to Login
            </button>

            {/* Account Request Form */}
         
<form onSubmit={handleRequestSubmit} className="space-y-4">
  {/* Two-column responsive layout */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {[
      ["contactName", "Your Name", "text"],
      ["businessName", "Business Name", "text"],
      ["email", "Business Email", "email"],
      ["phone", "Phone Number", "tel"],
      ["location", "Business Location", "text"],
      ["googleUrl", "Google Business Profile URL (optional)", "url"],
    ].map(([name, label, type]) => (
      <div key={name} className="min-w-0">
        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
          {label}
          {name !== "googleUrl" && " *"}
        </label>

        <input
          name={name}
          type={type}
          autoComplete={
            name === "email"
              ? "email"
              : name === "phone"
              ? "tel"
              : name === "contactName"
              ? "name"
              : "off"
          }
          value={requestData[name]}
          onChange={updateRequest}
          required={name !== "googleUrl"}
          maxLength={name === "googleUrl" ? 1000 : 254}
          placeholder={
            name === "googleUrl"
              ? "https://..."
              : `Enter ${label.toLowerCase()}`
          }
          className="w-full min-w-0 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    ))}
  </div>

  {/* Full-width message field */}
  <div>
    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
      Anything else we should know? (optional)
    </label>

    <textarea
      name="message"
      value={requestData.message}
      onChange={updateRequest}
      maxLength={1000}
      rows={2}
      placeholder="Tell us about your requirements..."
      className="w-full min-w-0 resize-y rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>

  {requestStatus && (
    <p
      role="status"
      aria-live="polite"
      className="rounded-lg bg-indigo-50 border border-indigo-100 p-3 text-xs text-indigo-700 break-words"
    >
      {requestStatus}
    </p>
  )}

  <button
    type="submit"
    disabled={requestLoading}
    className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-indigo-700 transition disabled:cursor-not-allowed disabled:opacity-50"
  >
    {requestLoading ? "Submitting..." : "Submit Account Request"}
  </button>
</form>

          </>
        )}
      </div>
    </div>
  );
}

// 'use client';
// import React from "react";

// export default function ClientLogin({
//   clientEmail,
//   setClientEmail,
//   clientPassword,
//   setClientPassword,
//   handleClientLogin,
//   clientLoginError,
//   setViewMode
// }) {

//   const [showRequestForm, setShowRequestForm] = React.useState(false);
// const [requestData, setRequestData] = React.useState({
//   contactName: "",
//   businessName: "",
//   email: "",
//   phone: "",
//   location: "",
//   googleUrl: "",
//   message: "",
// });
// const [requestStatus, setRequestStatus] = React.useState("");
// const [requestLoading, setRequestLoading] = React.useState(false);

// const updateRequest = (e) => {
//   setRequestData((prev) => ({
//     ...prev,
//     [e.target.name]: e.target.value,
//   }));
// };

// const handleRequestSubmit = async (e) => {
//   e.preventDefault();
//   setRequestStatus("");
//   setRequestLoading(true);

//   try {
//     const res = await fetch("/api/account-requests", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(requestData),
//     });

//     const data = await res.json();

//     if (!res.ok || !data.success) {
//       setRequestStatus(data.message || "Unable to submit your request.");
//       return;
//     }

//     setRequestStatus(data.message);
//     setRequestData({
//       contactName: "",
//       businessName: "",
//       email: "",
//       phone: "",
//       location: "",
//       googleUrl: "",
//       message: "",
//     });
//   } catch {
//     setRequestStatus("Connection error. Please try again.");
//   } finally {
//     setRequestLoading(false);
//   }
// };


//   return (
//     <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 shadow-xl">
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-indigo-700">Client Portal Login 🔐</h1>
//           <p className="text-xs text-gray-500 mt-1">Access your 1-year valid business review QR code.</p>
//         </div>
//         <button 
//           onClick={() => setViewMode("admin-login")}
//           className="text-[11px] bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg border border-indigo-200 hover:bg-indigo-100 font-semibold"
//         >
//           Admin Portal ⚙️
//         </button>
//       </div>

//       {clientLoginError && (
//         <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl">
//           {clientLoginError}
//         </div>
//       )}

//       <form onSubmit={handleClientLogin} className="space-y-4">
//         <div>
//           <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Business Email *</label>
//           <input
//             type="email"
//             placeholder="e.g. club16@digitalpaaji.com"
//             value={clientEmail}
//             onChange={(e) => setClientEmail(e.target.value)}
//             required
//             className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
//           />
//         </div>
//         <div>
//           <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Password *</label>
//           <input
//             type="password"
//             placeholder="••••••••"
//             value={clientPassword}
//             onChange={(e) => setClientPassword(e.target.value)}
//             required
//             className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
//           />
//         </div>
//         <button type="submit" className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-700 font-bold text-xs text-white uppercase tracking-wider shadow-lg">
//           Login to Portal 🚀
//         </button>
//       </form>


//       <div className="mt-6 border-t border-gray-200 pt-5 text-center">
//   <p className="text-xs text-gray-500">
//     Don't have a business account yet?
//   </p>

//   <button
//     type="button"
//     onClick={() => {
//       setShowRequestForm((prev) => !prev);
//       setRequestStatus("");
//     }}
//     className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
//   >
//     {showRequestForm
//       ? "Back to Login"
//       : "Request a Business Account →"}
//   </button>
// </div>

// {showRequestForm && (
//   <form onSubmit={handleRequestSubmit} className="mt-5 space-y-3">
//     <h2 className="text-lg font-bold text-slate-900">
//       Request Your Business Panel
//     </h2>
//     <p className="text-xs text-gray-500">
//       Share your details and our team will contact you about access.
//     </p>

//     {[
//       ["contactName", "Your Name", "text"],
//       ["businessName", "Business Name", "text"],
//       ["email", "Business Email", "email"],
//       ["phone", "Phone Number", "tel"],
//       ["location", "Business Location", "text"],
//       ["googleUrl", "Google Business Profile URL (optional)", "url"],
//     ].map(([name, label, type]) => (
//       <div key={name}>
//         <label className="mb-1 block text-xs font-semibold text-slate-700">
//           {label}{name !== "googleUrl" ? " *" : ""}
//         </label>
//         <input
//           name={name}
//           type={type}
//           value={requestData[name]}
//           onChange={updateRequest}
//           required={name !== "googleUrl"}
//           maxLength={name === "googleUrl" ? 1000 : 254}
//           className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500"
//         />
//       </div>
//     ))}

//     <div>
//       <label className="mb-1 block text-xs font-semibold text-slate-700">
//         Anything else we should know? (optional)
//       </label>
//       <textarea
//         name="message"
//         value={requestData.message}
//         onChange={updateRequest}
//         maxLength={1000}
//         rows={3}
//         className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500"
//       />
//     </div>

//     {requestStatus && (
//       <p role="status" className="text-xs text-indigo-700">
//         {requestStatus}
//       </p>
//     )}

//     <button
//       type="submit"
//       disabled={requestLoading}
//       className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold uppercase text-white hover:bg-indigo-700 disabled:opacity-50"
//     >
//       {requestLoading ? "Submitting..." : "Submit Account Request"}
//     </button>
//   </form>
// )}
//     </div>
//   );
// }