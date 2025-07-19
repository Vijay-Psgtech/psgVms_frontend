import React,{useState, useEffect} from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { 
    BarChart, Bar, LineChart, Line, 
    PieChart, Pie, Cell, Legend,
    XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import dayjs from 'dayjs';

const AdminAnalytics = () => {
    const [analytics, setAnalytics] = useState({
        totalMonthly: 0,
        statusCounts: [],
    });
    const [dailyChartData, setDailyChartData] = useState([]);
    const [data, setData] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));
    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#a4de6c', '#d0ed57', '#888888'];
 
    useEffect(()=>{
        const fetchStats = async() => {
            const res = await axiosInstance.get(`/api/visitors/visitor-stats?month=${selectedMonth}`);
            setAnalytics(res.data);
            setData(res.data.purposeStats);
        };
        fetchStats();
    },[selectedMonth]);

    useEffect(()=>{
        const fetchChartData = async() => {
            const res = await axiosInstance.get(`/api/visitors/visitor-daily-chart?month=${selectedMonth}`);
            setDailyChartData(res.data);
        };
        fetchChartData();
    },[selectedMonth]);

    const statusData = analytics.statusCounts.map((s)=>({
        name: s._id,
        value: s.count,
    }));

    return (
        <div className="p-6 bg-white rounded-xl shadow space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Visitor Analytics</h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <label className="text-sm text-gray-600">Select Month:</label>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="border px-3 py-1.5 rounded-md text-sm w-full sm:w-auto"
                    />
                </div>
            </div>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div className="bg-green-100 text-green-800 p-4 rounded-xl">
                    <p className="text-sm">{dayjs(selectedMonth).format('MMMM YYYY')}</p>
                    <p className="text-2xl font-bold">{analytics.totalMonthly}</p>
                </div>
                {statusData.map((s) => (
                    <div key={s.name} className="bg-gray-100 text-gray-800 p-4 rounded-xl">
                        <p className="text-sm capitalize">{s.name}</p>
                        <p className="text-2xl font-bold">{s.value}</p>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-2">Visitor Status Chart - {dayjs(selectedMonth).format('MMMM YYYY')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={statusData}>
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className='bg-white rounded-lg shadow-md p-6'>
                    <h3 className='text-lg font-semibold mb-2'>Visitor Purpose Distribution - {dayjs(selectedMonth).format('MMMM YYYY')}</h3>
                    {data.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={data}
                                    dataKey="count"
                                    nameKey="purpose"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    label
                                >
                                    {data.map((_,index)=>(
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="horizontal" verticalAlign='bottom' align="center" />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-500 text-sm text-center mt-10">No data available for the selected range.</p>
                    )}
                    
                </div>
            </div>
            <div className='bg-white rounded-lg shadow-md p-6'>
                <h3 className="text-lg font-semibold mb-2">Daily Visitors - {dayjs(selectedMonth).format('MMMM YYYY')}</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyChartData}>
                        <XAxis dataKey="date" tickFormatter={(d) => dayjs(d).format('D')} />
                        <YAxis allowDecimals={false} />
                        <Tooltip labelFormatter={(d) => dayjs(d).format('DD MMM YYYY')} />
                        <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default AdminAnalytics