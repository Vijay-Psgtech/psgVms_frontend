import React, { useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import bannerImage from '../assets/visitor-banner.jpg'; // Add a banner image to your assets

const VisitorAppointment = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', department: '',
    whomToMeet: '', purpose: '', address: '',
    visitDate: '', timeSlot: ''
  });
  const [photo, setPhoto] = useState(null);
  const [document, setDocument] = useState(null);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => form.append(key, value));
      if (photo) form.append('photo', photo);
      if (document) form.append('document', document);

      const response = await axiosInstance.post('/api/visitors/register', form);
      setMessage(response.data.message || 'Appointment submitted successfully!');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to submit appointment');
    }
  };

  return (
    <div className="font-sans">
      {/* Hero Section */}
      <section className="relative h-[300px] bg-cover bg-center" style={{ backgroundImage: `url(${bannerImage})` }}>
        <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-center items-center text-white text-center px-4">
          <h1 className="text-4xl font-bold mb-2">Schedule Your Visit</h1>
          <p className="text-lg max-w-2xl">
            Welcome to our campus! Please fill in your details below to schedule your visitor appointment.
          </p>
        </div>
      </section>

      {/* Description */}
      <section className="max-w-6xl mx-auto py-10 px-4 text-center">
        <h2 className="text-2xl font-semibold mb-4 text-blue-800">Visitor Appointment Form</h2>
        <p className="text-gray-700 mb-8">
          Kindly provide your personal details and upload a valid ID proof. Once submitted, your appointment request will be reviewed and you’ll receive a confirmation shortly.
        </p>

        {/* Form Section */}
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="bg-white shadow-lg rounded-lg p-8 space-y-6 text-left max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required className="border p-2 rounded" />
            <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" required className="border p-2 rounded" />
            <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" required className="border p-2 rounded" />
            <input name="department" value={formData.department} onChange={handleChange} placeholder="Department / Company" className="border p-2 rounded" />
            <input name="whomToMeet" value={formData.whomToMeet} onChange={handleChange} placeholder="Whom to Meet" className="border p-2 rounded" />
            <input name="purpose" value={formData.purpose} onChange={handleChange} placeholder="Purpose of Visit" className="border p-2 rounded" />
            <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="border p-2 rounded" />
            <input name="visitDate" type="date" value={formData.visitDate} onChange={handleChange} required className="border p-2 rounded" />
            <select name="timeSlot" value={formData.timeSlot} onChange={handleChange} required className="border p-2 rounded">
              <option value="">Select Time Slot</option>
              <option value="9:00 AM">9:00 AM</option>
              <option value="11:00 AM">11:00 AM</option>
              <option value="1:00 PM">1:00 PM</option>
              <option value="3:00 PM">3:00 PM</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Upload Photo (JPEG/PNG):</label>
            <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} className="border p-2 w-full rounded" />
          </div>

          <div>
            <label className="block mb-1 font-medium">Upload ID Document (PDF/Image):</label>
            <input type="file" onChange={(e) => setDocument(e.target.files[0])} className="border p-2 w-full rounded" />
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition duration-300">
            Submit Appointment
          </button>

          {message && <p className="text-center text-green-600 mt-4">{message}</p>}
        </form>
      </section>
    </div>
  );
};

export default VisitorAppointment;
