import React, { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  Clock, 
  Plus, 
  Filter,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { mockEmployees, mockLeaves as initialLeaves } from '../data/mockData';
import { Leave } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import LeaveRequestModal from './modals/LeaveRequestModal';

const LeaveManagement: React.FC = () => {
  const [leaves, setLeaves] = useLocalStorage<Leave[]>('leaves', initialLeaves);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);

  const leaveTypes = {
    personal: { name: 'ลากิจ', color: 'bg-blue-100 text-blue-800' },
    vacation: { name: 'ลาพักผ่อน', color: 'bg-green-100 text-green-800' },
    sick: { name: 'ลาป่วย', color: 'bg-red-100 text-red-800' },
    hourly: { name: 'ลาชั่วโมง', color: 'bg-purple-100 text-purple-800' }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Previous month's trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i);
      days.push({ date: day, isCurrentMonth: false });
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    // Next month's leading days
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, isCurrentMonth: false });
    }

    return days;
  };

  const getLeavesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return leaves.filter(leave => 
      leave.startDate <= dateStr && 
      leave.endDate >= dateStr && 
      leave.status === 'approved'
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const calculateLeaveBalance = (employeeId: string) => {
    const employeeLeaves = leaves.filter(leave => 
      leave.employeeId === employeeId && 
      leave.status === 'approved' &&
      leave.type === 'vacation'
    );
    const usedDays = employeeLeaves.reduce((sum, leave) => sum + leave.days, 0);
    return Math.max(0, 10 - usedDays); // Assuming 10 days annual leave
  };

  const handleSaveLeave = (leave: Leave) => {
    setLeaves(prev => [...prev, leave]);
  };

  const handleApproveLeave = (leaveId: string) => {
    setLeaves(prev => prev.map(leave => 
      leave.id === leaveId ? { ...leave, status: 'approved', approvedBy: 'ผู้จัดการ' } : leave
    ));
  };

  const handleRejectLeave = (leaveId: string) => {
    setLeaves(prev => prev.map(leave => 
      leave.id === leaveId ? { ...leave, status: 'rejected' } : leave
    ));
  };

  const filteredLeaves = leaves.filter(leave => {
    const matchesEmployee = !selectedEmployee || leave.employeeId === selectedEmployee;
    const matchesType = !selectedType || leave.type === selectedType;
    return matchesEmployee && matchesType;
  });

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการการลา</h1>
          <p className="text-gray-600">จัดการคำขอลาและติดตามวันลาคงเหลือ</p>
        </div>
        <button 
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowRequestModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          ขอลา
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Object.entries(leaveTypes).map(([key, type]) => {
          const count = leaves.filter(leave => 
            leave.type === key && 
            leave.status === 'approved' &&
            new Date(leave.startDate).getMonth() === currentMonth.getMonth()
          ).length;
          
          return (
            <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{type.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{count}</p>
                </div>
                <div className={`p-3 rounded-full ${type.color.replace('text-', 'bg-').replace('100', '200')}`}>
                  <FileText className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Calendar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">ปฏิทินการลา</h2>
              <div className="flex items-center space-x-2">
                <button
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium text-gray-900">
                  {currentMonth.toLocaleDateString('th-TH', { year: 'numeric', month: 'long' })}
                </span>
                <button
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {/* Week Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const dayLeaves = getLeavesForDate(day.date);
                const isToday = day.date.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={index}
                    className={`min-h-[80px] p-1 border border-gray-200 rounded ${
                      !day.isCurrentMonth ? 'bg-gray-50 opacity-50' : 'bg-white'
                    } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      !day.isCurrentMonth ? 'text-gray-400' : 
                      isToday ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {day.date.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {dayLeaves.slice(0, 2).map((leave) => {
                        const employee = mockEmployees.find(emp => emp.id === leave.employeeId);
                        const leaveType = leaveTypes[leave.type as keyof typeof leaveTypes];
                        
                        return (
                          <div
                            key={leave.id}
                            className={`text-xs px-1 py-0.5 rounded ${leaveType.color} truncate`}
                            title={`${employee?.firstName} ${employee?.lastName} - ${leaveType.name}`}
                          >
                            {employee?.firstName}
                          </div>
                        );
                      })}
                      {dayLeaves.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayLeaves.length - 2} อื่นๆ
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Leave Balance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">วันลาคงเหลือ</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {mockEmployees.map((employee) => {
                const balance = calculateLeaveBalance(employee.id);
                
                return (
                  <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={employee.photo || 'https://via.placeholder.com/40'}
                        alt={employee.firstName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{employee.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${
                        balance <= 2 ? 'text-red-600' : 
                        balance <= 5 ? 'text-amber-600' : 'text-green-600'
                      }`}>
                        {balance}
                      </p>
                      <p className="text-xs text-gray-600">วันคงเหลือ</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">คำขอลา</h2>
            <div className="flex space-x-3">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">ทุกคน</option>
                {mockEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">ทุกประเภท</option>
                {Object.entries(leaveTypes).map(([key, type]) => (
                  <option key={key} value={key}>{type.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  พนักงาน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ประเภท
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จำนวนวัน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  เหตุผล
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeaves.map((leave) => {
                const employee = mockEmployees.find(emp => emp.id === leave.employeeId);
                const leaveType = leaveTypes[leave.type as keyof typeof leaveTypes];
                
                return (
                  <tr key={leave.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <img
                          src={employee?.photo || 'https://via.placeholder.com/40'}
                          alt={employee?.firstName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {employee?.firstName} {employee?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{employee?.department}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${leaveType.color}`}>
                        {leaveType.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(leave.startDate).toLocaleDateString('th-TH')}
                      {leave.startDate !== leave.endDate && (
                        <> - {new Date(leave.endDate).toLocaleDateString('th-TH')}</>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {leave.days} วัน
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {leave.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                        leave.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {leave.status === 'approved' ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            อนุมัติ
                          </>
                        ) : leave.status === 'rejected' ? (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            ปฏิเสธ
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 mr-1" />
                            รอพิจารณา
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {leave.status === 'pending' && (
                        <div className="flex items-center justify-center space-x-2">
                          <button 
                            className="text-green-600 hover:text-green-800 text-sm"
                            onClick={() => handleApproveLeave(leave.id)}
                          >
                            อนุมัติ
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800 text-sm"
                            onClick={() => handleRejectLeave(leave.id)}
                          >
                            ปฏิเสธ
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Request Modal */}
      <LeaveRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSave={handleSaveLeave}
        employees={mockEmployees}
      />
    </div>
  );
};

export default LeaveManagement;