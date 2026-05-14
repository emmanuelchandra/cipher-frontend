import React from 'react';
import { Link } from 'react-router-dom';

const typeColors = {
  late:       'bg-yellow-100 text-yellow-700',
  absence:    'bg-red-100 text-red-700',
  overtime:   'bg-blue-100 text-blue-700',
  permission: 'bg-purple-100 text-purple-700',
};

const statusColors = {
  pending:  'bg-orange-100 text-orange-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const ReportCard = ({ report }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-3">
      <div>
        <p className="font-semibold text-gray-800">{report?.employee?.name || 'N/A'}</p>
        <p className="text-xs text-gray-400">{report?.created_at?.slice(0, 10)}</p>
      </div>
      <div className="flex flex-col items-end space-y-1">
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${typeColors[report?.type] || 'bg-gray-100 text-gray-600'}`}>
          {report?.type}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[report?.status] || 'bg-gray-100 text-gray-600'}`}>
          {report?.status}
        </span>
      </div>
    </div>
    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{report?.reason}</p>
    <Link to={`/reports/${report?.id}`}
      className="text-sm text-blue-600 hover:text-blue-700 font-medium">
      View Details →
    </Link>
  </div>
);

export default ReportCard;
