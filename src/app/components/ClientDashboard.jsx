'use client';
import React from "react";
import { QRCodeSVG } from "qrcode.react";

export default function ClientDashboard({
  currentClient,
  setCurrentClient,
  setViewMode,
  handleClientGenerateQr,
  location,
  setLocation,
  industry,
  setIndustry,
  services,
  setServices,
  description,
  setDescription,
  handleCopy,
  copied
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3 border-b pb-2">
        <div>
          <h1 className="text-2xl font-light text-slate-900">
            Welcome, <span className="font-serif italic text-indigo-500">{currentClient.businessName}</span>
          </h1>
          <p className="text-xs text-slate-500">1-Year Valid Review Portal Dashboard</p>
        </div>
        <button onClick={() => { setCurrentClient(null); setViewMode("client-login"); }} className="text-xs text-red-600 font-semibold hover:underline">
          Logout
        </button>
      </div>

      {!currentClient.hasGeneratedQr ? (
        <form onSubmit={handleClientGenerateQr} className="space-y-3 mt-2">
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-800">
            ⚠️ <strong>Important:</strong> You can only configure and generate your QR code <strong>once</strong>. After generation, your QR code will be locked and saved to your account for 1 year.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Location / City</label>
              <input type="text" placeholder="e.g. Patiala, Punjab" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Industry</label>
              <input type="text" placeholder="e.g. Lounge & Bar" value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Services Offered</label>
            <input type="text" placeholder="e.g. Cocktails, Dining, Music" value={services} onChange={(e) => setServices(e.target.value)} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs" />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Short Description</label>
            <input type="text" placeholder="Brief description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs" />
          </div>

          <button type="submit" className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg">
            Generate My Permanent QR Code 🚀
          </button>
        </form>
      ) : (
        <div className="bg-gray-50 border border-indigo-200 rounded-2xl p-5 text-center shadow-lg mt-2">
          <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200">
            {currentClient.businessName} QR Ready 🎉 (Active for 1 Year)
          </span>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 my-3">
            <div className="p-3 bg-white rounded-2xl border-2 border-indigo-200 shadow-md inline-block">
              <QRCodeSVG value={currentClient.savedQrUrl} size={130} level={"H"} includeMargin={true} />
            </div>
            
            <div className="text-left space-y-2 flex-1">
              <p className="text-[11px] text-gray-600">
                Your QR code has already been generated and locked as per your subscription terms. You can copy the URL anytime.
              </p>
              
              <div className="p-2 bg-white rounded-lg border border-gray-200 text-[10px] text-gray-500 break-all max-h-16 overflow-y-auto">
                {currentClient.savedQrUrl}
              </div>

              <button
                onClick={() => handleCopy(currentClient.savedQrUrl)}
                className="w-full py-2 px-4 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium transition shadow-md flex items-center justify-center gap-2"
              >
                <span>{copied ? "✓ Copied to Clipboard!" : "📋 Copy Direct URL"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}