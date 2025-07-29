import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  Users, 
  Plus, 
  Filter,
  Download,
  CheckCircle,
  AlertTriangle,
  DollarSign
} from 'lucide-react';
import { mockEmployees, mockWorkSchedules as initialSchedules } from '../data/mockData';
import { WorkSchedule, shifts } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { exportToExcel } from '../utils/excelUtils';
import WorkScheduleModal from './modals/WorkScheduleModal';

const WorkScheduleComponent: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [schedules, setSchedules] = useLocalStorage<WorkSchedule[]>('workSchedules', initialSchedules);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [editingSchedule, setEditingSchedule] = useState<WorkSchedule | null>(null);

  const getWeekDays = (date: Date) => {
    const week = [];
    const startDate = new Date(date);
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startDate.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
      return newDate;
    });
  };

  const getScheduleForEmployeeAndDate = (employeeId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return schedules.find(schedule => 
      schedule.employeeId === employeeId && schedule.date === dateStr
    );
  };

  const calculateSpecialPay = (shift: string, isWeekend: boolean) => {
    if (shift.startsWith('afternoon')) {
      return isWeekend ? 250 : 300;
    }
    return isWeekend ? 250 : 0;
  };

  const handleSaveSchedule = (schedule: WorkSchedule) => {
    if (editingSchedule) {
      setSchedules(prev => prev.map(s => s.id === schedule.id ? schedule : s));
    } else {
      setSchedules(prev => [...prev, schedule]);
    }
    setEditingSchedule(null);
  };

  const handleAddSchedule = (employeeId: string, date: Date) => {
    setSelectedEmployeeId(employeeId);
    setSelectedDate(date.toISOString().split('T')[0]);
    setEditingSchedule(null);
    setShowScheduleModal(true);
  };

  const handleEditSchedule = (schedule: WorkSchedule) => {
    setEditingSchedule(schedule);
    setSelectedDate(schedule.date);
    setSelectedEmployeeId(schedule.employeeId);
    setShowScheduleModal(true);
  };

  const handleMarkComplete = (scheduleId: string) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.id === scheduleId ? { ...schedule, status: 'completed' } : schedule
    ));
  };

  const handleMarkAbsent = (scheduleId: string) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.id === scheduleId ? { ...schedule, status: 'absent' } : schedule
    ));
  };

  const handleExportSchedule = () => {
    const exportData = schedules.map(schedule => {
      const employee = mockEmployees.find(emp => emp.id === schedule.employeeId);
      return {
        วันที่: schedule.date,
        พนักงาน: `${employee?.firstName} ${employee?.lastName}`,
        แผนก: employee?.department,
        รอบการทำงาน: shifts[schedule.shift as keyof typeof shifts]?.time,
        สถานที่: schedule.location,
        สถานะ: schedule.status === 'completed' ? 'เสร็จสิ้น' : 
                schedule.status === 'absent' ? 'ขาดงาน' : 'กำหนดการ'
      };
    });
    exportToExcel(exportData, 'ตารางการทำงาน');
  };

  const weekDays = getWeekDays(currentWeek);
  const filteredEmployees = selectedDepartment 
    ? mockEmployees.filter(emp => emp.department === selectedDepartment)
    : mockEmployees;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ตารางการทำงาน</h1>
          <p className="text-gray-600">จัดการตารางการทำงานประจำวัน จันทร์-ศุกร์</p>
        </div>
        <div className="flex space-x-3">
          <button 
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            onClick={handleExportSchedule}
          >
            <Download className="w-4 h-4 mr-2" />
            ส่งออก
          </button>
          <button 
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              setEditingSchedule(null);
              setSelectedDate(new Date().toISOString().split('T')[0]);
              setSelectedEmployeeId('');
              setShowScheduleModal(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มตาราง
          </button>
        </div>
      </div>

      {/* Filters and Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              onClick={() => navigateWeek('prev')}
            >
              ←
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              สัปดาห์ที่ {weekDays[0].toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} - {weekDays[6].toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
            </h2>
            <button
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              onClick={() => navigateWeek('next')}
            >
              →
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="">ทุกแผนก</option>
                {Array.from(new Set(mockEmployees.map(emp => emp.department))).map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                  พนักงาน
                </th>
                {weekDays.map((day, index) => (
                  <th key={index} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    <div>
                      <div className="font-semibold">
                        {day.toLocaleDateString('th-TH', { weekday: 'short' })}
                      </div>
                      <div className="text-sm font-normal">
                        {day.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10 border-r border-gray-200">
                    <div className="flex items-center space-x-3">
                      <img
                        src={employee.photo || 'https://via.placeholder.com/40'}
                        alt={employee.firstName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{employee.department}</div>
                      </div>
                    </div>
                  </td>
                  {weekDays.map((day, dayIndex) => {
                    const schedule = getScheduleForEmployeeAndDate(employee.id, day);
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                    const isWorkDay = day.getDay() >= 1 && day.getDay() <= 5;
                    
                    return (
                      <td key={dayIndex} className={`px-6 py-4 text-center ${isWeekend ? 'bg-gray-50' : ''}`}>
                        {isWorkDay ? (
                          schedule ? (
                            <div className="space-y-1">
                              <button
                                onClick={() => handleEditSchedule(schedule)}
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium hover:opacity-80 ${
                                  schedule.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  schedule.status === 'absent' ? 'bg-red-100 text-red-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {schedule.status === 'completed' ? (
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                ) : schedule.status === 'absent' ? (
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                ) : (
                                  <Clock className="w-3 h-3 mr-1" />
                                )}
                                {shifts[schedule.shift as keyof typeof shifts]?.time}
                              </button>
                              <div className="text-xs text-gray-600">
                                {schedule.location}
                              </div>
                              {schedule.shift.startsWith('afternoon') && (
                                <div className="inline-flex items-center text-xs text-green-600">
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  +300
                                </div>
                              )}
                              {schedule.status === 'scheduled' && (
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => handleMarkComplete(schedule.id)}
                                    className="text-xs text-green-600 hover:text-green-800"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={() => handleMarkAbsent(schedule.id)}
                                    className="text-xs text-red-600 hover:text-red-800"
                                  >
                                    ✗
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <button 
                              className="w-full h-12 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 flex items-center justify-center"
                              onClick={() => handleAddSchedule(employee.id, day)}
                            >
                              <Plus className="w-4 h-4 text-gray-400" />
                            </button>
                          )
                        ) : (
                          <span className="text-xs text-gray-400">หยุด</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shift Legend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-medium text-gray-900 mb-4">รอบการทำงาน</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(shifts).map(([key, shift]) => (
            <div key={key} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                key === 'morning' ? 'bg-blue-500' : 'bg-purple-500'
              }`}></div>
              <div>
                <div className="text-sm font-medium text-gray-900">{shift.name}</div>
                <div className="text-xs text-gray-600">{shift.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Special Pay Information */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-green-600" />
          เงินช่วยเหลือพิเศษ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-4 rounded-lg">
            <div className="font-medium text-gray-900 mb-1">ผลัดบ่าย (จ-ศ)</div>
            <div className="text-green-600 font-semibold">300 บาท/วัน</div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="font-medium text-gray-900 mb-1">วันหยุด (8:30-16:30)</div>
            <div className="text-blue-600 font-semibold">250 บาท + วันหยุดชดเชย</div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="font-medium text-gray-900 mb-1">วันหยุด (ถึง 20:00+)</div>
            <div className="text-purple-600 font-semibold">300 บาท</div>
          </div>
        </div>
      </div>

      {/* Work Schedule Modal */}
      <WorkScheduleModal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          setEditingSchedule(null);
        }}
        onSave={handleSaveSchedule}
        employees={mockEmployees}
        date={selectedDate}
        existingSchedule={editingSchedule}
      />
    </div>
  );
};

export default WorkScheduleComponent;