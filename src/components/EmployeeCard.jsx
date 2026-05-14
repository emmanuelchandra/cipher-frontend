import React from 'react';

const EmployeeCard = ({ employee, onEdit, onDelete }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow flex items-start space-x-4">
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
      {employee?.name?.charAt(0)?.toUpperCase() || '?'}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-gray-800 truncate">{employee?.name}</p>
          <p className="text-sm text-gray-500">{employee?.position || 'N/A'}</p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          employee?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
        }`}>
          {employee?.status}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-gray-500">
        <span>📧 {employee?.user?.email}</span>
        <span>🏢 {employee?.department?.name || 'No dept'}</span>
        <span>🕐 {employee?.shift?.name || 'No shift'}</span>
        <span>📅 {employee?.hire_date || '—'}</span>
      </div>
      {(onEdit || onDelete) && (
        <div className="mt-3 flex space-x-2">
          {onEdit && (
            <button onClick={() => onEdit(employee)}
              className="px-3 py-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition-colors">
              Edit
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(employee.id)}
              className="px-3 py-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors">
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  </div>
);

export default EmployeeCard;
