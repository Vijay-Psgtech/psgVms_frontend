import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import { UserPlus } from 'lucide-react';

const VisitorRegister = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    hostEmail: ''
  });

  const resetFields = () => setFormData({ first_name:'', last_name: '', email: '', phone: '', purpose: '', hostEmail: ''});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post('/api/visitors/register', formData);
      if(res.data.success){
        toast.success('Registration submitted. Waiting for host approval.');
        setFormData({ first_name: '', last_name: '', email: '', phone: '', purpose: '', hostEmail: ''});
      }else{
        toast.error('Failed to Register.')
      }
    } catch (error) {
      toast.error('Registration failed');
    }
  };

  return ( 
    <div className='min-h-screen flex items-center justify-center bg-gray-900'>
      <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 w-full max-w-md mx-auto">
        {/* <h2 className="text-xl font-bold mb-8">Visitor Registration</h2> */}
         <div className="flex flex-col items-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full mb-2">
              <UserPlus className="text-blue-700" size={20} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Visitor Registration</h2>
          </div>
         <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex gap-3">
              <input
                name="first_name"
                placeholder="First Name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                name="last_name"
                placeholder="Last Name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex gap-3">
              <input
                name="phone"
                type="number"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                name="purpose"
                type="text"
                placeholder="Purpose"
                value={formData.purpose}
                onChange={handleChange}
                className="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <input
              name="hostEmail"
              type="text"
              placeholder="Host Email"
              value={formData.hostEmail}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex justify-between pt-3">
              <button
                type="button"
                 onClick={resetFields}
                className="text-blue-600 hover:underline font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg shadow"
              >
                Register
              </button>
            </div>
          </form>
      </div>
    </div>
    
  );
};

export default VisitorRegister;
