import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const AdminVisitorLog = () => {
    const [visitors, setVisitors] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [page, setPage] = useState(1);
    const visitorsPerPage = 20;

    useEffect(() => {
        const fetchVisitors = async () => {
            const res = await axiosInstance.get('/api/visitors/all');
            setVisitors(res.data);
            setFiltered(res.data);
        };
        fetchVisitors();
    }, []);

     useEffect(() => {
        filterData();
    }, [searchTerm, statusFilter, fromDate, toDate, visitors]);


    const filterData = () => {
        let data = [...visitors];

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            data = data.filter(v =>
                v.name.toLowerCase().includes(term) ||
                v.email.toLowerCase().includes(term) ||
                v.purpose.toLowerCase().includes(term)
            );
        }

        if (statusFilter !== 'all') {
            data = data.filter(v => v.status === statusFilter);
        }

        if (fromDate) {
            const from = dayjs(fromDate).startOf('day');
            data = data.filter(v => dayjs(v.createdAt).isSameOrAfter(from));
        }

        if (toDate) {
            const to = dayjs(toDate).endOf('day');
            data = data.filter(v => dayjs(v.createdAt).isSameOrBefore(to));
        }

        setFiltered(data);
    };

  
    const exportToExcel = () => {
        const exportData = filtered.map((v) => ({
            Name: v.name,
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

    const handleResetFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setFromDate('');
        setToDate('');
        setFiltered(visitors); // Reset to all
    };

    const paginatedVisitors = filtered.slice((page - 1) * visitorsPerPage, page * visitorsPerPage);
    const totalPages = Math.ceil(filtered.length / visitorsPerPage);
  

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
                        onClick={handleResetFilters}
                        className="px-3 py-1.5 bg-gray-200 text-sm rounded-md hover:bg-gray-300"
                    >
                        Reset Filters
                    </button>

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
                <div className="w-full overflow-x-auto rounded-lg shadow-md">
                    <table className="w-full border-collapse divide-y divide-gray-200 text-md ">
                        <thead className="bg-blue-400">
                            <tr>
                                <th className="px-4 py-2 text-left">Name</th>
                                <th className="px-4 py-2 text-left">Email</th>
                                <th className="px-4 py-2 text-left">Phone</th>
                                <th className="px-4 py-2 text-left">Purpose</th>
                                <th className="px-4 py-2 text-left">Status</th>
                                <th className="px-4 py-2 text-left">Check-In</th>
                                <th className="px-4 py-2 text-left">Check-Out</th>
                                <th className="px-4 py-2 text-left">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-500">
                            {paginatedVisitors.map((v) => (
                                <tr key={v._id} className="hover:bg-blue-50">
                                    <td className="px-4 py-2">{v.name}</td>
                                    <td className="px-4 py-2">{v.email}</td>
                                    <td className="px-4 py-2">{v.phone}</td>
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
            <div className='flex justify-center items-center mt-6 gap-2'>
                <button 
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className={`px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Prev
                </button>

                <span>Page {page} of {totalPages}</span>

                <button 
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                     className={`px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default AdminVisitorLog;
