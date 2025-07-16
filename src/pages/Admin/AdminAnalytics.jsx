import React,{useState, useEffect} from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AdminAnalytics = () => {
    const [analytics, setAnalytics] = useState({
        totalWeekly: 0,
        totalMonthly: 0,
        statusCounts: [],
    });

    useEffect(()=>{
        const fetchStats = async() => {
            const res = await axiosInstance.get('/api/visitors/visitor-stats');
            setAnalytics(res.data);
        };
        fetchStats();
    },[]);

    const statusData = analytics.statusCounts.map((s)=>({
        name: s._id,
        value: s.count,
    }));

    return (
        <div className="p-6 bg-white rounded-xl shadow space-y-6">
            <h2 className='text-xl font-semibold text-gray-800'>Visitor Analytics</h2>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div className="bg-blue-100 text-blue-800 p-4 rounded-xl">
                    <p className="text-sm">This Week</p>
                    <p className="text-2xl font-bold">{analytics.totalWeekly}</p>
                </div>
                <div className="bg-green-100 text-green-800 p-4 rounded-xl">
                    <p className="text-sm">This Month</p>
                    <p className="text-2xl font-bold">{analytics.totalMonthly}</p>
                </div>
                {statusData.map((s) => (
                    <div key={s.name} className="bg-gray-100 text-gray-800 p-4 rounded-xl">
                        <p className="text-sm capitalize">{s.name}</p>
                        <p className="text-2xl font-bold">{s.value}</p>
                    </div>
                ))}
            </div>
            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2">Visitor Status Chart</h3>
                <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default AdminAnalytics