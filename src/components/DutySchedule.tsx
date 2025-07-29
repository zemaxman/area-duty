import React, { useState } from 'react';
import { 
  Calendar, 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Edit,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import { mockEmployees, mockDutySchedules as initialDutySchedules, mockDutyChangeRequests as initialChangeRequests } from '../data/mockData';
import { DutySchedule, DutyChangeRequest } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { exportToExcel } from '../utils/excelUtils';
import DutyAssignModal from './modals/DutyAssignModal';
import DutyChangeModal from './modals/DutyChangeModal';

const DutyScheduleComponent: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dutySchedules, setDutySchedules] = useLocalStorage<DutySchedule[]>('dutySchedules', initialDutySchedules);
  const [changeRequests, setChangeRequests] = useLocalStorage<DutyChangeRequest[]>('dutyChangeRequests', initialChangeRequests);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [editingDuty, setEditingDuty] = useState<DutySchedule | null>(null);

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

  const getDutyForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return dutySchedules.find(duty => duty.date === dateStr);
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
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

  const autoAssignDuty = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const eligibleEmployees = mockEmployees.filter(emp => emp.level >= 4 && emp.level <= 6);
    
    // Find all weekends in the month
    const weekends = [];
    for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) {
      const date = new Date(year, month, day);
      if (isWeekend(date)) {
        weekends.push(date.toISOString().split('T')[0]);
      }
    }
    
    // Auto-assign 2 employees per weekend
    const newSchedules: DutySchedule[] = [];
    let employeeIndex = 0;
    
    weekends.forEach(date => {
      if (!dutySchedules.find(duty => duty.date === date)) {
        const assignedEmployees = [];
        for (let i = 0; i < 2; i++) {
          assignedEmployees.push(eligibleEmployees[employeeIndex % eligibleEmployees.length].id);
          employeeIndex++;
        }
        
        newSchedules.push({
          id: Date.now().toString() + Math.random(),
          date,
          employees: assignedEmployees,
          type: 'weekend',
          status: 'draft'
        });
      }
    });
    
    setDutySchedules(prev => [...prev, ...newSchedules]);
  };

  const handleSaveDuty = (duty: DutySchedule) => {
    if (editingDuty) {
      setDutySchedules(prev => prev.map(d => d.id === duty.id ? duty : d));
    } else {
      setDutySchedules(prev => [...prev, duty]);
    }
    setEditingDuty(null);
  };

  const handleApproveDuty = (dutyId: string) => {
    setDutySchedules(prev => prev.map(duty => 
      duty.id === dutyId ? { ...duty, status: 'approved' } : duty
    ));
  };

  const handleApproveChangeRequest = (requestId: string) => {
    const request = changeRequests.find(req => req.id === requestId);
    if (request) {
      // Update duty schedule
      setDutySchedules(prev => prev.map(duty => {
        if (duty.date === request.date) {
          const newEmployees = duty.employees.map(empId => 
            empId === request.fromEmployee ? request.toEmployee : empId
          );
          return { 
            ...duty, 
            employees: newEmployees, 
            isChanged: true,
            originalEmployees: duty.originalEmployees || duty.employees
          };
        }
        return duty;
      }));
      
      // Update request status
      setChangeRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'approved', approvedBy: 'ผู้จัดการ' } : req
      ));
    }
  };

  const handleRejectChangeRequest = (requestId: string) => {
    setChangeRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'rejected' } : req
    ));
  };

  const handleExportSchedule = () => {
    const exportData = dutySchedules.map(duty => {
      const employees = duty.employees.map(empId => {
        const emp = mockEmployees.find(e => e.id === empId);
        return `${emp?.firstName} ${emp?.lastName}`;
      }).join(', ');
      
      return {
        วันที่: duty.date,
        พนักงาน: employees,
        ประเภท: duty.type === 'weekend' ? 'วันหยุด' : duty.type === 'holiday' ? 'นักขัตฤกษ์' : 'พิเศษ',
        สถานะ: duty.status === 'approved' ? 'อนุมัติ' : duty.status === 'draft' ? 'ร่าง' : 'เสร็จสิ้น'
      };
    });
    exportToExcel(exportData, 'ตารางเวรวันหยุด');
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ตารางเวรวันหยุด</h1>
          <p className="text-gray-600">จัดการตารางเวรพนักงานในวันหยุด</p>
        </div>
        <div className="flex space-x-3">
          <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            นำเข้า Excel
            <input type="file" accept=".csv,.xlsx,.xls" className="hidden" />
          </label>
          <button 
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            onClick={handleExportSchedule}
          >
            <Download className="w-4 h-4 mr-2" />
            ส่งออก Excel
          </button>
          <button 
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            onClick={autoAssignDuty}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            จัดเวรอัตโนมัติ
          </button>
          <button 
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              setEditingDuty(null);
              setSelectedDate(new Date().toISOString().split('T')[0]);
              setShowAssignModal(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มเวร
          </button>
        </div>
      </div>

      {/* Pending Change Requests */}
      {changeRequests.filter(req => req.status === 'pending').length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mr-2" />
            <h3 className="font-medium text-amber-900">คำขอเปลี่ยนเวรรอการอนุมัติ</h3>
          </div>
          <div className="space-y-2">
            {changeRequests.filter(req => req.status === 'pending').map((request) => {
              const fromEmp = mockEmployees.find(emp => emp.id === request.fromEmployee);
              const toEmp = mockEmployees.find(emp => emp.id === request.toEmployee);
              return (
                <div key={request.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {fromEmp?.firstName} {fromEmp?.lastName} → {toEmp?.firstName} {toEmp?.lastName}
                    </p>
                    <p className="text-xs text-gray-600">
                      วันที่ {new Date(request.date).toLocaleDateString('th-TH')} • {request.reason}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full hover:bg-green-200"
                      onClick={() => handleApproveChangeRequest(request.id)}
                    >
                      อนุมัติ
                    </button>
                    <button 
                      className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full hover:bg-red-200"
                      onClick={() => handleRejectChangeRequest(request.id)}
                    >
                      ปฏิเสธ
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Calendar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {currentMonth.toLocaleDateString('th-TH', { year: 'numeric', month: 'long' })}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                onClick={() => setCurrentMonth(new Date())}
              >
                วันนี้
              </button>
              <button
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          {/* Week Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const duty = getDutyForDate(day.date);
              const isToday = day.date.toDateString() === new Date().toDateString();
              const isWeekendDay = isWeekend(day.date);

              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border border-gray-200 rounded-lg ${
                    !day.isCurrentMonth ? 'bg-gray-50 opacity-50' : 'bg-white'
                  } ${isToday ? 'ring-2 ring-blue-500' : ''} ${
                    isWeekendDay ? 'bg-blue-50' : ''
                  } hover:bg-gray-50 cursor-pointer`}
                  onClick={() => {
                    if (isWeekendDay) {
                      setSelectedDate(day.date.toISOString().split('T')[0]);
                      const existingDuty = getDutyForDate(day.date);
                      setEditingDuty(existingDuty || null);
                      setShowAssignModal(true);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${
                      !day.isCurrentMonth ? 'text-gray-400' : 
                      isToday ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {day.date.getDate()}
                    </span>
                    {isWeekendDay && (
                      <span className="text-xs text-blue-600 font-medium">วันหยุด</span>
                    )}
                  </div>

                  {duty && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          duty.status === 'approved' ? 'bg-green-100 text-green-800' :
                          duty.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {duty.status === 'approved' ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              อนุมัติ
                            </>
                          ) : duty.status === 'draft' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApproveDuty(duty.id);
                              }}
                              className="flex items-center hover:bg-gray-200 rounded px-1"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              ร่าง (คลิกอนุมัติ)
                            </button>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 mr-1" />
                              เสร็จสิ้น
                            </>
                          )}
                        </span>
                        {duty.isChanged && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDate(duty.date);
                              setShowChangeModal(true);
                            }}
                            className="text-xs text-amber-600 font-medium hover:text-amber-800"
                          >
                            เปลี่ยน
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        {duty.employees.map((empId) => {
                          const employee = mockEmployees.find(emp => emp.id === empId);
                          return (
                            <div key={empId} className="flex items-center space-x-2">
                              <img
                                src={employee?.photo || 'https://via.placeholder.com/20'}
                                alt={employee?.firstName}
                                className="w-5 h-5 rounded-full object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-900 truncate">
                                  {employee?.firstName} {employee?.lastName}
                                </p>
                                <p className="text-xs text-gray-600 truncate">
                                  {employee?.phone}
                                </p>
                              </div>
                              {duty.status === 'approved' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedDate(duty.date);
                                    setShowChangeModal(true);
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  เปลี่ยน
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {isWeekendDay && !duty && (
                    <div className="flex items-center justify-center h-16 border-2 border-dashed border-gray-300 rounded-lg">
                      <Plus className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-medium text-gray-900 mb-4">คำอธิบาย</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
            <span className="text-sm text-gray-600">วันหยุด</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 rounded"></div>
            <span className="text-sm text-gray-600">อนุมัติแล้ว</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 rounded"></div>
            <span className="text-sm text-gray-600">ร่าง</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-amber-600 font-medium">เปลี่ยน</span>
            <span className="text-sm text-gray-600">มีการเปลี่ยนเวร</span>
          </div>
        </div>
      </div>

      {/* Duty Assignment Modal */}
      <DutyAssignModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setEditingDuty(null);
        }}
        onSave={handleSaveDuty}
        date={selectedDate}
        employees={mockEmployees}
        existingDuty={editingDuty}
      />

      {/* Duty Change Modal */}
      <DutyChangeModal
        isOpen={showChangeModal}
        onClose={() => setShowChangeModal(false)}
        onSave={(request) => setChangeRequests(prev => [...prev, request])}
        employees={mockEmployees}
        dutyDate={selectedDate}
      />
    </div>
  );
};

export default DutyScheduleComponent;