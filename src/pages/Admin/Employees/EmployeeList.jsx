import React, { useState, useEffect } from "react";
import DataTable from "../../../components/Datatable";
import { Container, Typography } from "@mui/material";
import { toast } from "react-toastify";
import axiosInstance from "../../../utils/axiosInstance";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const departmentOptions = ["IT", "HR", "Purchase", "Accounts"];
  const columns = [
    { field: "empId", headerName: "Employee-ID" },
    { field: "name", headerName: "Name" },
    { field: "email", headerName: "Email Id" },
    { field: "phone", headerName: "Phone" },
  ];
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axiosInstance.get("/api/employee/get");
        setEmployees(res.data);
      } catch (error) {
        console.error("Failed to fetch", error);
      }
    };
    fetchEmployees();
  }, []);

  const exportEmployeeToExcel = (employeesList) => {
    const exportData = employeesList.map((emp, index) => ({
      "S.no": index + 1,
      "Emp Id": emp.empId,
      Name: emp.name,
      Email: emp.email,
      Phone: emp.phone,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "appliacation/octet-stream" });
    saveAs(blob, `Employee_lists.xlsx`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post("/api/employee/save", form);
      if (res.data.success) {
        toast.success(res.data.message);
        setForm({ name: "", email: "", phone: "", department: "" });
        setLoading(false);
      } else {
        toast.error("Failed to save employee");
      }
    } catch (error) {
      console.error("Error", error);
      toast.error("Failed to Save Employee");
      setLoading(false);
    }
  };

  const handleEdit = async (employee) => {
    try {
      const res = await axiosInstance.get(
        `/api/employee/getEmpById/${employee.empId}`
      );
      setShowModal(true);
      setForm({ ...res.data });
    } catch (error) {
      console.log("Error", error);
    }
  };

  return (
    <div className="p-6 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Employee Lists</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 px-12">
          <button
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            onClick={() => exportEmployeeToExcel(employees)}
          >
            <Download className="text-md" />
            <span className="sm:inline">Export</span>
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => setShowModal(true)}
          >
            Add Employee
          </button>
        </div>
      </div>
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          maxWidth: "1500px",
          margin: "0 auto",
          overflowX: "auto",
        }}
      >
        <Typography variant="h5" gutterBottom></Typography>
        <DataTable
          columns={columns}
          rows={employees}
          onEdit={handleEdit}
          onDelete={{}}
        />
      </Container>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-[300px]">
            <h2 className="text-lg font-semibold mb-4">Add Employee</h2>
            <div className="space-y-3">
              <input
                type="text"
                value={form.name}
                name="name"
                onChange={handleChange}
                placeholder="Enter Full Name"
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                value={form.email}
                name="email"
                onChange={handleChange}
                placeholder="Enter Email"
                className="w-full border p-2 rounded"
              />
              <input
                type="number"
                value={form.phone}
                name="phone"
                onChange={handleChange}
                placeholder="Enter Mobile Number"
                className="w-full border p-2 rounded"
              />
              <select
                className="w-full border p-2 rounded"
                name="department"
                value={form.department}
                onChange={handleChange}
              >
                <option value="">Select Department</option>
                {departmentOptions.map((dep, idx) => (
                  <option key={idx} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3 py-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Close
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
