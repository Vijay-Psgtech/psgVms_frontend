import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const AdminVisitorLog = () => {
    const [visitors, setVisitors] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    useEffect(() => {
        const fetchVisitors = async () => {
        const res = await axiosInstance.get('/api/visitors/all');
        setVisitors(res.data);
        setFiltered(res.data);
        };
        fetchVisitors();
    }, []);

    useEffect(()=>{
        let data = [...visitors];

        //filter by status
        if(statusFilter !== 'all'){
            data = data.filter((v)=>v.status === statusFilter);
        }

        // Filter by search term
        if(searchTerm){
            const term = searchTerm.toLowerCase();
            data = data.filter(
                (v) => 
                    v.first_name.toLowerCase().includes(term) || 
                    v.email.toLowerCase().includes(term) || 
                    v.purpose.toLowerCase().includes(term)
            );
        }

        // Filter by Date Range
        if(fromDate){
            const from = dayjs(fromDate).startOf('day');
            data = data.filter((v) => dayjs(v.createdAt).isAfter(from.subtract(1, 'day')));
        }

        if(toDate){
            const to = dayjs(toDate).endOf('day');
            data = data.filter((v) => dayjs(v.createdAt).isBefore(to.add(1, 'day')));
        }

        setFiltered(data);

    },[visitors, statusFilter, searchTerm, fromDate, toDate ]);

  
    const exportToExcel = () => {
        const exportData = filtered.map((v) => ({
            Name: v.first_name,
            Email: v.email,
            Purpose: v.purpose,
            Status: v.status,
            CheckIn: v.checkInTime ? dayjs(v.checkInTime).format('hh:mm A') : '-',
            CheckOut: v.checkOutTime ? dayjs(v.checkOutTime).format('hh:mm A') : '-',
            Date: dayjs(v.createdAt).format('DD MMM YYYY'),
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Visitors');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(fileData, 'visitor_log.xlsx');
    };
  

    return (
        <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Visitor Log</h2>

                <div className="flex flex-col md:flex-row flex-wrap gap-2 md:items-center justify-between mb-4">
                    <input
                        type="text"
                        placeholder="Search name, email, or purpose"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border px-3 py-1.5 rounded-md text-sm w-full md:w-64"
                    />
                
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border px-3 py-1.5 rounded-md text-sm"
                    >
                        <option value="all">All</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                    </select>

                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="border px-3 py-1.5 rounded-md text-sm"
                    />
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="border px-3 py-1.5 rounded-md text-sm"
                    />

                    <button
                        onClick={exportToExcel}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                    >
                        Export to Excel
                    </button>
                </div>
            </div>

            {filtered.length === 0 ? (
                <p className="text-gray-500 text-sm">No visitors match the selected filter.</p>
            ) : (
                <div className="w-full overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left">Name</th>
                                <th className="px-4 py-2 text-left">Email</th>
                                <th className="px-4 py-2 text-left">Purpose</th>
                                <th className="px-4 py-2 text-left">Status</th>
                                <th className="px-4 py-2 text-left">Check-In</th>
                                <th className="px-4 py-2 text-left">Check-Out</th>
                                <th className="px-4 py-2 text-left">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map((v) => (
                                <tr key={v._id} className="hover:bg-gray-50">
                                <td className="px-4 py-2">{v.first_name} {v.last_name || ''}</td>
                                <td className="px-4 py-2">{v.email}</td>
                                <td className="px-4 py-2">{v.purpose}</td>
                                <td className="px-4 py-2">
                                    <span
                                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                                        v.status === 'approved'
                                        ? 'bg-green-100 text-green-700'
                                        : v.status === 'rejected'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                    }`}
                                    >
                                    {v.status}
                                    </span>
                                </td>
                                <td className="px-4 py-2">
                                    {v.checkInTime ? dayjs(v.checkInTime).format('hh:mm A') : '-'}
                                </td>
                                <td className="px-4 py-2">
                                    {v.checkOutTime ? dayjs(v.checkOutTime).format('hh:mm A') : '-'}
                                </td>
                                <td className="px-4 py-2">
                                    {dayjs(v.createdAt).format('DD MMM YYYY')}
                                </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminVisitorLog;
