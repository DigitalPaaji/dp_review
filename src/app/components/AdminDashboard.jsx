'use client';
import React, { useState } from "react";

export default function AdminDashboard({ clientsList, setClientsList, setViewMode }) {
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newBusinessName, setNewBusinessName] = useState("");
  const [newPlaceId, setNewPlaceId] = useState("");
  const [newGoogleUrl, setNewGoogleUrl] = useState("");
  const [createSuccess, setCreateSuccess] = useState(false);

  const handleCreateClient = async (e) => {
    e.preventDefault();
    if (!newEmail || !newPassword || !newBusinessName || !newPlaceId || !newGoogleUrl) return;

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail.trim().toLowerCase(),
          password: newPassword,
          businessName: newBusinessName,
          placeId: newPlaceId,
          googleUrl: newGoogleUrl,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setClientsList([data.client, ...clientsList]);
        setNewEmail("");
        setNewPassword("");
        setNewBusinessName("");
        setNewPlaceId("");
        setNewGoogleUrl("");
        setCreateSuccess(true);
        setTimeout(() => setCreateSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to create client", err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 border-b pb-3">
        <h1 className="text-xl font-bold text-slate-900">Admin Dashboard: Enrolled Clients 📋</h1>
        <button onClick={() => setViewMode("client-login")} className="text-xs text-red-600 font-semibold hover:underline">
          Logout Admin
        </button>
      </div>

      {createSuccess && <div className="mb-3 p-2 bg-green-50 text-green-700 text-xs rounded-lg">✅ Client Account Created Successfully in DB!</div>}

      <div className="bg-gray-50 border rounded-xl p-4 mb-4">
        <h3 className="text-xs font-bold uppercase text-indigo-700 mb-2">➕ Create New Client Login</h3>
        <form onSubmit={handleCreateClient} className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input type="email" placeholder="Client Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required className="p-2 border rounded-lg text-xs" />
            <input type="password" placeholder="Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="p-2 border rounded-lg text-xs" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input type="text" placeholder="Business Name" value={newBusinessName} onChange={(e) => setNewBusinessName(e.target.value)} required className="p-2 border rounded-lg text-xs" />
            <input type="text" placeholder="Google Place ID" value={newPlaceId} onChange={(e) => setNewPlaceId(e.target.value)} required className="p-2 border rounded-lg text-xs" />
            <input type="url" placeholder="Google Review URL" value={newGoogleUrl} onChange={(e) => setNewGoogleUrl(e.target.value)} required className="p-2 border rounded-lg text-xs" />
          </div>
          <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg uppercase">
            Create Client Account 🚀
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase text-gray-700 mb-2">Enrolled List ({clientsList.length})</h3>
        <div className="max-h-[220px] overflow-y-auto space-y-2">
          {clientsList.map((c) => (
            <div key={c._id || c.id} className="p-3 bg-white border rounded-xl text-xs flex justify-between items-center shadow-xs">
              <div>
                <strong className="text-indigo-900">{c.businessName}</strong>
                <p className="text-[11px] text-gray-500">Email: {c.email} | Status: {c.hasGeneratedQr ? "QR Generated ✅" : "Pending First Login ⏳"}</p>
              </div>
              <span className="text-[10px] bg-gray-100 px-2 py-1 rounded">Pass: {c.password}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}