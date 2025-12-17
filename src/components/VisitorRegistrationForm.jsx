import React, { useState, useEffect } from "react";
import axios from "axios"; // ✅ REQUIRED
import api from "../utils/api";
import bannerImage from "../assets/visitor-banner.jpg";

const departments = ["HR", "IT", "Finance", "Admin", "Operations"];

const VisitorRegistrationForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    company: "",
    nid: "",
    address: "",
    department: "",
    employee: "",
    purpose: "",
    timeSlot: "",
    building: "",
  });

  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [selectedEmployeePhone, setSelectedEmployeePhone] = useState("");
  const [message, setMessage] = useState("");

  const dummyEmployees = [
    { name: "Anita Rao", phone: "9566844908", department: "HR" },
    { name: "Karthik Kumar", phone: "8754885648", department: "IT" },
    { name: "Priya Singh", phone: "9876543333", department: "Finance" },
    { name: "Arjun Mehta", phone: "9876543444", department: "IT" },
    { name: "Divya Menon", phone: "9876543555", department: "Admin" },
  ];

  const dummyBuildings = [
    { _id: "b1", name: "Main Block" },
    { _id: "b2", name: "Admin Block" },
    { _id: "b3", name: "R&D Block" },
  ];

  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/employees");
        setEmployees(res.data);
      } catch {
        setEmployees(dummyEmployees);
      }
    };

    const fetchBuildings = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/buildings");
        setBuildings(res.data);
      } catch {
        setBuildings(dummyBuildings);
      }
    };

    fetchEmployees();
    fetchBuildings();
  }, []);

  // ---------------- FILTER EMPLOYEES ----------------
  useEffect(() => {
    if (!formData.department) {
      setFilteredEmployees([]);
      return;
    }
    setFilteredEmployees(
      employees.filter((e) => e.department === formData.department)
    );
  }, [formData.department, employees]);

  // ---------------- HANDLERS ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/visitor", formData);

      if (selectedEmployeePhone) {
        await api.post("/notify", {
          to: `+91${selectedEmployeePhone}`,
          message: `Visitor ${formData.firstName} ${formData.lastName} scheduled at ${formData.timeSlot}`,
        });
      }

      setMessage("Visitor registered successfully!");

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        gender: "",
        company: "",
        nid: "",
        address: "",
        department: "",
        employee: "",
        purpose: "",
        timeSlot: "",
        building: "",
      });
    } catch (err) {
      console.error("Submission failed:", err);
      setMessage(err.response?.data?.message || "Submission failed");
    }
  };

  // ---------------- UI ----------------
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bannerImage})` }}
    >
      <div className="bg-white/90 backdrop-blur-md p-10 rounded-2xl shadow-xl w-full max-w-3xl">
        <h2 className="text-3xl font-bold text-center mb-6">
          Visitor Registration
        </h2>

        {message && (
          <p className="text-center text-blue-700 font-medium mb-4">
            {message}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {[
            ["firstName", "First Name"],
            ["lastName", "Last Name"],
            ["email", "Email"],
            ["phone", "Phone"],
            ["company", "Company"],
            ["nid", "Aadhaar Number"],
            ["address", "Address"],
            ["purpose", "Purpose of Visit"],
          ].map(([name, placeholder]) => (
            <input
              key={name}
              name={name}
              placeholder={placeholder}
              value={formData[name]}
              onChange={handleChange}
              className="input-style"
              required={["firstName", "lastName", "email", "phone", "nid"].includes(
                name
              )}
            />
          ))}

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="input-style"
            required
          >
            <option value="">Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>

          <input
            type="time"
            name="timeSlot"
            value={formData.timeSlot}
            onChange={handleChange}
            className="input-style"
            required
          />

          <select
            name="building"
            value={formData.building}
            onChange={handleChange}
            className="input-style"
            required
          >
            <option value="">Select Building</option>
            {buildings.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="input-style"
            required
          >
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>

          <select
            name="employee"
            value={formData.employee}
            onChange={(e) => {
              const emp = employees.find((x) => x.name === e.target.value);
              setSelectedEmployeePhone(emp?.phone || "");
              handleChange(e);
            }}
            className="input-style"
            required
          >
            <option value="">Whom to Meet</option>
            {filteredEmployees.map((e) => (
              <option key={e.name}>{e.name}</option>
            ))}
          </select>

          <div className="md:col-span-2">
            <button className="w-full bg-blue-700 text-white py-2 rounded-xl">
              Register Visitor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VisitorRegistrationForm;







