import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { Users, Clock, ClipboardList, CheckCircle, XCircle  } from 'lucide-react';
import AdminAnalytics from './AdminAnalytics';

const AdminDashboard = () => {
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [pendingVisitors, setPendingVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pendingVisitorsperpage = 8;

  useEffect(() => {
    const fetchData = async () => {
      const totalRes = await axiosInstance.get('/api/visitors/count');
      const pendingRes = await axiosInstance.get('/api/visitors/unapproved');
      setTotalVisitors(totalRes.data.count);
      setPendingVisitors(pendingRes.data);
    };
    fetchData();
  }, []);

  const handleAction = async (id, status) => {
    setLoading(true);
    try {
      await axiosInstance.put(`/api/visitors/${id}/status`, { status });
      setPendingVisitors((prev) => prev.filter((v) => v._id !== id));
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setLoading(false);
    }
  };

  const paginatedVisitors = pendingVisitors.slice((page - 1) * pendingVisitorsperpage, page * pendingVisitorsperpage);
  const totalPages = Math.ceil(pendingVisitors.length / pendingVisitorsperpage);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Admin Dashboard</h1>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white shadow-lg rounded-xl p-6 flex items-center space-x-4">
          <Users className="text-blue-500" size={32} />
          <div>
            <h2 className="text-sm text-gray-500">Total Visitors</h2>
            <p className="text-xl font-bold">{totalVisitors}</p>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 flex items-center space-x-4">
          <Clock className="text-yellow-500" size={32} />
          <div>
            <h2 className="text-sm text-gray-500">Pending Approvals</h2>
            <p className="text-xl font-bold">{pendingVisitors.length}</p>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 flex items-center space-x-4">
          <ClipboardList className="text-green-500" size={32} />
          <div>
            <h2 className="text-sm text-gray-500">Actions</h2>
            <p className="text-sm text-gray-600">Manage visitors efficiently</p>
          </div>
        </div>
      </div>

      {/* Unapproved Visitors List */}
      <div className="bg-white shadow-md rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Unapproved Visitors</h2>

        {paginatedVisitors.length === 0 ? (
          <p className="text-gray-500 text-sm">No pending visitors</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {paginatedVisitors.map((visitor) => (
              <div
                key={visitor._id}
                className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border-b-4 border-blue-500 rounded-lg shadow-lg hover:bg-blue-50 transition-all"
              >
                <div className="space-y-1 font-semibold">
                  <p className="text-sm font-medium text-gray-900">{visitor.name}</p>
                  <p className="text-sm text-gray-600">{visitor.email}</p>
                  <p className="text-sm text-gray-500">Purpose: {visitor.purpose}</p>
                  <p className="text-xs text-gray-400">Requested on: {new Date(visitor.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-2">
                  {/*<button
                    onClick={() => handleAction(visitor._id, 'approved')}
                    className="flex items-center px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    disabled={loading}
                  >
                    <CheckCircle size={16} className="mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(visitor._id, 'rejected')}
                    className="flex items-center px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    disabled={loading}
                  >
                    <XCircle size={16} className="mr-1" />
                    Reject
                  </button>*/}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className='flex justify-center gap-2 mt-6'>
          {Array.from({ length: totalPages }, (_, i) => (
            <button 
              key={i}
              className={`px-3 py-1 rounded ${
                page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
              onClick={()=> setPage(i+1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
      <div className='p-6'> 
        <AdminAnalytics />
      </div>
      
    </div>
  );
};

export default AdminDashboard;
