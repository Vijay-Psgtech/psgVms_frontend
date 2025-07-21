import React, { useState } from 'react';
import QRCodeDisplay from './QRCodeDisplay';
import VisitorIDCard from './VisitorIDCard';
import axios from 'axios';

const GateEntryForm = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [visitorId, setVisitorId] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateQR = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/security/generate', formData);
      setVisitorId(res.data.visitorId);
    } catch (err) {
      console.error('Error generating visitor ID', err);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-6"
      style={{
        backgroundImage:
          'url(https://images.unsplash.com/photo-1593361721242-a1a2be7c2087?auto=format&fit=crop&w=1740&q=80)',
      }}
    >
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-6 bg-white/10 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 overflow-hidden ring-1 ring-white/10">

        {/* Left Form Section */}

        
        <div className="p-13 flex flex-col justify-center text-white">
          <h2 className="text-4xl font-extrabold text-yellow-400 mb-1">🎫 PSG VPASS</h2>
          <p className="uppercase text-sm tracking-wider text-white/60 mb-8">
            Visitor Entry Registration
          </p>

          <form onSubmit={handleGenerateQR} className="space-y-5">
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              required
              className="w-full px-4 py-3 rounded-lg bg-white/90 text-black placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-200 hover:scale-[1.02]"
            />
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              required
              className="w-full px-4 py-3 rounded-lg bg-white/90 text-black placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-200 hover:scale-[1.02]"
            />
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
              className="w-full px-4 py-3 rounded-lg bg-white/90 text-black placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-200 hover:scale-[1.02]"
            />
            <button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-bold py-2 rounded-lg transition hover:scale-105 duration-200 shadow-md"
            >
              Generate QR Code
            </button>
          </form>
        </div>

        {/* Right Display Section */}
        <div className="p-10 bg-black/60 text-white flex flex-col items-center justify-center text-center rounded-r-3xl">
          <p className="text-xs uppercase tracking-widest text-white/50 mb-1">• PSG Institutions</p>
          <h1 className="text-3xl font-bold text-yellow-400 mb-3">Your Visitor Pass</h1>
          <p className="text-sm text-white/70 mb-6">
            Please show this pass at the entry gate.
          </p>

          {visitorId ? (
            <div className="mt-4 space-y-5 animate-fade-in">
              <VisitorIDCard
                name={formData.name}
                email={formData.email}
                phone={formData.phone}
                visitorId={visitorId}
              />
              <div className="mt-2 flex flex-col items-center space-y-2">
                <QRCodeDisplay visitorId={visitorId} />
                <p className="text-xs text-white/50">
                  Scan this QR code to verify your entry details.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-white/40 text-sm mt-6 italic">
              Your visitor pass will appear here after registration.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GateEntryForm;

