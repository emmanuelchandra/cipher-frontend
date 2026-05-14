import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const StatCard = ({ label, value, sub, color }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 border-l-4 ${color}`}>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-3xl font-bold text-gray-800 mt-1">{value ?? '—'}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

const Dashboard = () => {
  const { user, hasRole } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/attendance/dashboard')
      .then(r => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const attendanceBarData = {
    labels: data?.weekly_labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Present',
        data: data?.weekly_present || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 6,
      },
      {
        label: 'Late',
        data: data?.weekly_late || [],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderRadius: 6,
      },
    ],
  };

  const statusDoughnutData = {
    labels: ['Present', 'Late', 'Absent'],
    datasets: [{
      data: [
        data?.today_present || 0,
        data?.today_late || 0,
        data?.today_absent || 0,
      ],
      backgroundColor: [
        'rgba(34, 197, 94, 0.85)',
        'rgba(234, 179, 8, 0.85)',
        'rgba(239, 68, 68, 0.85)',
      ],
      borderWidth: 0,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back, {user?.name}</p>
        </div>
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Employees" value={data?.total_employees} color="border-blue-500" />
        <StatCard label="Present Today" value={data?.today_present} color="border-green-500" />
        <StatCard label="Late Today" value={data?.today_late} color="border-yellow-500" />
        <StatCard label="Absent Today" value={data?.today_absent} color="border-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Weekly Attendance</h2>
          <Bar data={attendanceBarData} options={chartOptions} />
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Today's Status</h2>
          <Doughnut data={statusDoughnutData}
            options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
        </div>
      </div>

      {hasRole(['admin', 'hr']) && data?.top_late?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Top Late Employees (This Month)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2 font-medium">Employee</th>
                  <th className="pb-2 font-medium">Department</th>
                  <th className="pb-2 font-medium text-right">Late Count</th>
                </tr>
              </thead>
              <tbody>
                {data.top_late.map((e, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 font-medium text-gray-800">{e.name}</td>
                    <td className="py-2.5 text-gray-500">{e.department}</td>
                    <td className="py-2.5 text-right">
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                        {e.late_count}x
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {hasRole('employee') && data?.my_attendance && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">My Attendance (This Month)</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-green-600">{data.my_attendance.present || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Present</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-yellow-600">{data.my_attendance.late || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Late</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-red-600">{data.my_attendance.absent || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Absent</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
