import React, { useState, useEffect } from 'react';
import bannerImage from '../assets/visitor-banner.jpg';
import axiosInstance from '../utils/axiosInstance';

const departments = ['HR', 'IT', 'Finance', 'Admin', 'Operations'];

const VisitorRegistrationForm = () => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    gender: '', company: '', nid: '', address: '',
    department: '', employee: '', purpose: '', timeSlot: ''
  });

  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployeePhone, setSelectedEmployeePhone] = useState('');
  const [message, setMessage] = useState('');

  const dummyEmployees = [
    { name: 'Anita Rao', phone: '9566844908', department: 'HR' },
    { name: 'Karthik Kumar', phone: '8754885648', department: 'IT' },
    { name: 'Priya Singh', phone: '9876543333', department: 'Finance' },
    { name: 'Arjun Mehta', phone: '9876543444', department: 'IT' },
    { name: 'Divya Menon', phone: '9876543555', department: 'Admin' },
  ];

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axiosInstance.get('/api/employees');
        const enriched = res.data.map(emp => ({
          ...emp,
          department: dummyEmployees.find(d => d.name === emp.name)?.department || 'IT',
        }));
        setEmployees(enriched);
      } catch (err) {
        console.warn('Falling back to dummy employee data:', err.message);
        setEmployees(dummyEmployees);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (formData.department) {
      const filtered = employees.filter(emp => emp.department === formData.department);
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees([]);
    }
  }, [formData.department, employees]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.post('/api/visitors/register', formData);

      if (selectedEmployeePhone) {
        await axiosInstance.post('/api/notify', {
          to: `+91${selectedEmployeePhone}`,
          message: `You have a visitor: ${formData.firstName} ${formData.lastName} at ${formData.timeSlot}.`,
        });
      }

      setMessage('✅ Visitor registered and employee notified!');
      setFormData({
        firstName: '', lastName: '', email: '', phone: '',
        gender: '', company: '', nid: '', address: '',
        department: '', employee: '', purpose: '', timeSlot: ''
      });
      setSelectedEmployeePhone('');
    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage('❌ Failed to submit. Please check backend and internet connection.');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bannerImage  ')" }} // 👉 Set your logo or background image here
    >
      <div className="bg-white/90 backdrop-blur-md p-10 rounded-2xl shadow-xl w-full max-w-3xl">
        <h2 className="text-3xl font-extrabold text-center text-blue-900 mb-6">
          Visitor Registration
        </h2>

        {message && (
          <div className="mb-4 font-medium text-center text-blue-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required className="input-style" />
          <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required className="input-style" />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="input-style" />
          <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required className="input-style" />

          <select name="gender" value={formData.gender} onChange={handleChange} required className="input-style">
            <option value="">Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>

          <input type="text" name="company" placeholder="Company" value={formData.company} onChange={handleChange} className="input-style" />
          <input type="text" name="nid" placeholder="Aadhaar Number" value={formData.nid} onChange={handleChange} required className="input-style" />
          <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} className="input-style" />
          <input type="text" name="purpose" placeholder="Purpose of Visit" value={formData.purpose} onChange={handleChange} required className="input-style" />
          <input type="time" name="timeSlot" value={formData.timeSlot} onChange={handleChange} required className="input-style" />

          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
            className="input-style"
          >
            <option value="">Select Department</option>
            {departments.map((dept, idx) => (
              <option key={idx} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            name="employee"
            value={formData.employee}
            onChange={(e) => {
              const selectedName = e.target.value;
              const selectedEmp = employees.find(emp => emp.name === selectedName);
              setSelectedEmployeePhone(selectedEmp?.phone || '');
              setFormData(prev => ({ ...prev, employee: selectedName }));
            }}
            required
            className="input-style"
          >
            <option value="">Whom to Meet</option>
            {filteredEmployees.map((emp, idx) => (
              <option key={idx} value={emp.name}>{emp.name}</option>
            ))}
          </select>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-xl mt-4 transition"
            >
              Register Visitor
            </button>
          </div>    
        </form>
      </div>
    </div>
  );
};

export default VisitorRegistrationForm;   







