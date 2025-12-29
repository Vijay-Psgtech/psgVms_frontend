import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Building,
  Car,
  MapPin,
  CheckCircle,
  AlertCircle,
  Info,
  Shield,
  ArrowRight,
  ArrowLeft,
  X,
  Home,
} from "lucide-react";

export default function VisitorBookingWebsite() {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    purpose: "",
    host: "",
    hostEmail: "",
    gate: "",
    date: "",
    time: "",
    expectedDuration: "120",
    vehicleNumber: "",
  });

  const [employees] = useState([
    { id: "1", name: "John Smith", email: "john@company.com", department: "Engineering" },
    { id: "2", name: "Sarah Johnson", email: "sarah@company.com", department: "HR" },
    { id: "3", name: "Michael Brown", email: "michael@company.com", department: "Sales" },
    { id: "4", name: "Emily Davis", email: "emily@company.com", department: "Marketing" },
  ]);

  const [gates] = useState([
    { id: "GATE-1", name: "Main Gate - Building A" },
    { id: "GATE-2", name: "East Gate - Building B" },
    { id: "GATE-3", name: "West Gate - Building C" },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [confirmationId, setConfirmationId] = useState("");

  const steps = ["Personal Info", "Visit Details", "Confirmation"];

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setForm((prev) => ({
      ...prev,
      date: tomorrow.toISOString().split("T")[0],
      time: "09:00",
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Auto-fill host email when host is selected
      if (name === "host") {
        const selectedEmployee = employees.find((emp) => emp.name === value);
        if (selectedEmployee) {
          updated.hostEmail = selectedEmployee.email;
        }
      }
      
      return updated;
    });
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 0) {
      if (!form.name.trim()) newErrors.name = "Name is required";
      if (!form.email.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        newErrors.email = "Invalid email format";
      if (!form.phone.trim()) newErrors.phone = "Phone is required";
      else if (!/^\d{10}$/.test(form.phone))
        newErrors.phone = "Phone must be 10 digits";
    }

    if (step === 1) {
      if (!form.host) newErrors.host = "Please select a host";
      if (!form.gate) newErrors.gate = "Please select a gate";
      if (!form.date) newErrors.date = "Date is required";
      if (!form.time) newErrors.time = "Time is required";
      if (!form.purpose.trim()) newErrors.purpose = "Purpose is required";

      const selectedDateTime = new Date(`${form.date}T${form.time}`);
      if (selectedDateTime.getTime() < Date.now()) {
        newErrors.date = "Cannot schedule for past date/time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
      setError("");
    } else {
      setError("Please fill in all required fields correctly");
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError("");
  };

  const selectedHost = employees.find((e) => e.name === form.host);

  const handleSubmit = async () => {
    if (!validateStep(1)) {
      setError("Please fill in all required fields correctly");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const allowedUntilDate = new Date(`${form.date}T${form.time}`);
      
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        company: form.company || "",
        purpose: form.purpose,
        host: form.host,
        hostEmail: selectedHost?.email || form.hostEmail,
        gate: form.gate,
        allowedUntil: allowedUntilDate.toISOString(),
        expectedDuration: Number(form.expectedDuration),
        vehicleNumber: form.vehicleNumber || "",
      };

      console.log("Submitting payload:", payload);

      const res = await fetch("http://localhost:5000/api/visitor/public-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Booking failed");
      }

      setConfirmationId(data.visitorId || `VIS-${Date.now()}`);
      setSuccess(true);
      setActiveStep(2);
    } catch (err) {
      console.error("Booking error:", err);
      setError(err.message || "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getAllowedUntil = () => {
    if (!form.date || !form.time) return "";
    const dt = new Date(`${form.date}T${form.time}`);
    dt.setMinutes(dt.getMinutes() + Number(form.expectedDuration));
    return dt.toLocaleString();
  };

  const resetForm = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setForm({
      name: "",
      email: "",
      phone: "",
      company: "",
      purpose: "",
      host: "",
      hostEmail: "",
      gate: "",
      date: tomorrow.toISOString().split("T")[0],
      time: "09:00",
      expectedDuration: "120",
      vehicleNumber: "",
    });
    setActiveStep(0);
    setSuccess(false);
    setError("");
    setErrors({});
  };

  const handleStaffLogin = () => {
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-end mb-4">
            <button
              onClick={handleStaffLogin}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Staff Login
            </button>
          </div>
          <div className="text-center space-y-4">
            <Calendar className="w-16 h-16 mx-auto" />
            <h1 className="text-5xl font-bold">Visitor Appointment Booking</h1>
            <p className="text-xl opacity-90">
              Schedule your visit in advance - No need to come to campus
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Shield className="w-5 h-5" />
                <span>Secure & Verified</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Clock className="w-5 h-5" />
                <span>24/7 Booking</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5" />
                <span>Email Confirmation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Info Cards */}
        {activeStep === 0 && (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <Info className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Easy Booking</h3>
              <p className="text-sm text-gray-600">
                Fill out a simple form to schedule your visit
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <Mail className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Email Confirmation</h3>
              <p className="text-sm text-gray-600">
                Receive instant confirmation and approval notification
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <Shield className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Quick Entry</h3>
              <p className="text-sm text-gray-600">
                Fast-track entry with your booking reference
              </p>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Stepper */}
          <div className="flex justify-between mb-8">
            {steps.map((step, idx) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      idx <= activeStep
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {idx < activeStep ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span className="text-sm mt-2 hidden sm:block">{step}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      idx < activeStep ? "bg-purple-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
              <button onClick={() => setError("")} className="text-red-600">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 0: Personal Info */}
          {activeStep === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Tell us about yourself</h2>
                <div className="h-1 w-20 bg-purple-600 rounded"></div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="your.email@example.com"
                  />
                </div>
                {errors.email ? (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                ) : (
                  <p className="text-gray-500 text-sm mt-1">
                    We'll send confirmation to this email
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    maxLength={10}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="10 digit mobile number"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Company/Organization
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Vehicle Number
                </label>
                <div className="relative">
                  <Car className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="vehicleNumber"
                    value={form.vehicleNumber}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="e.g., TN01AB1234"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleNext}
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center gap-2"
                >
                  Next <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Visit Details */}
          {activeStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Visit Details</h2>
                <div className="h-1 w-20 bg-purple-600 rounded"></div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Purpose of Visit <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="purpose"
                  value={form.purpose}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${
                    errors.purpose ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Brief description of your visit"
                />
                {errors.purpose && (
                  <p className="text-red-500 text-sm mt-1">{errors.purpose}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Person to Meet (Host) <span className="text-red-500">*</span>
                </label>
                <select
                  name="host"
                  value={form.host}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${
                    errors.host ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">-- Select Host --</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.name}>
                      {e.name} — {e.department}
                    </option>
                  ))}
                </select>
                {errors.host && (
                  <p className="text-red-500 text-sm mt-1">{errors.host}</p>
                )}
                {form.host && selectedHost && (
                  <p className="text-sm text-gray-600 mt-1">
                    📧 Approval request will be sent to: {selectedHost.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Entry Gate <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <select
                    name="gate"
                    value={form.gate}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${
                      errors.gate ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">-- Select Gate --</option>
                    {gates.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.gate && (
                  <p className="text-red-500 text-sm mt-1">{errors.gate}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Visit Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${
                        errors.date ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                  {errors.date && (
                    <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Visit Time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="time"
                      name="time"
                      value={form.time}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${
                        errors.time ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                  {errors.time && (
                    <p className="text-red-500 text-sm mt-1">{errors.time}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Expected Duration
                </label>
                <select
                  name="expectedDuration"
                  value={form.expectedDuration}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                  <option value="180">3 hours</option>
                  <option value="240">4 hours</option>
                  <option value="480">Full day (8 hours)</option>
                </select>
              </div>

              {form.date && form.time && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    📅 Your Visit Schedule
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="bg-white px-3 py-1 rounded-full">
                      Entry: {new Date(`${form.date}T${form.time}`).toLocaleString()}
                    </span>
                    <span>→</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                      Valid until: {getAllowedUntil()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Request <CheckCircle className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Confirmation */}
          {activeStep === 2 && success && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-green-600">
                Request Submitted Successfully!
              </h2>
              <p className="text-gray-600">
                Your visitor request has been submitted for approval. A confirmation email
                will be sent to both you and your host once approved.
              </p>

              <div className="bg-gray-50 rounded-lg p-6 text-left">
                <h3 className="text-lg font-semibold mb-4">Booking Details</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Request ID</p>
                    <p className="font-semibold">{confirmationId}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Visitor Name</p>
                    <p className="font-semibold">{form.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Visit Date & Time</p>
                    <p className="font-semibold">
                      {new Date(`${form.date}T${form.time}`).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Host</p>
                    <p className="font-semibold">{form.host}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Entry Gate</p>
                    <p className="font-semibold">
                      {gates.find((g) => g.id === form.gate)?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p className="font-semibold text-orange-600">Pending Approval</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <p className="font-semibold text-blue-900 mb-2">
                  📧 What happens next?
                </p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Your host ({form.host}) will receive an approval email</li>
                  <li>Once approved, you'll receive a confirmation email with entry details</li>
                  <li>Bring a valid government-issued ID on your visit date</li>
                  <li>Show your confirmation email at the security gate</li>
                  <li>Please arrive 10 minutes before your scheduled time</li>
                </ul>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => window.print()}
                  className="px-6 py-3 border border-purple-600 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition"
                >
                  Print Details
                </button>
                <button
                  onClick={resetForm}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                  Book Another Visit
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>
            Need help? Contact us at{" "}
            <a
              href="mailto:visitors@company.com"
              className="text-purple-600 hover:underline"
            >
              visitors@company.com
            </a>{" "}
            or call +91-1800-XXX-XXXX
          </p>
        </div>
      </div>
    </div>
  );
}
