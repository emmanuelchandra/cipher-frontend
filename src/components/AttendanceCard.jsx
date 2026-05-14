import React from 'react';

const statusColors = {
  present: 'bg-green-100 text-green-700',
  late:    'bg-yellow-100 text-yellow-700',
  absent:  'bg-red-100 text-red-700',
  leave:   'bg-blue-100 text-blue-700',
};

const AttendanceCard = ({ record }) => {
  const status = record?.status || 'absent';
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold text-gray-800">{record?.employee?.name || 'N/A'}</p>
          <p className="text-xs text-gray-500">{record?.employee?.department?.name}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[status] || 'bg-gray-100 text-gray-600'}`}>
          {status}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
        <div>
          <p className="text-xs text-gray-400">Check In</p>
          <p className="font-medium">{record?.check_in || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Check Out</p>
          <p className="font-medium">{record?.check_out || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Date</p>
          <p className="font-medium">{record?.date || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Shift</p>
          <p className="font-medium">{record?.shift?.name || '—'}</p>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCard;
