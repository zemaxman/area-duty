import React from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { mockEmployees } from '../data/mockData';
import { shifts } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

const Dashboard: React.FC = () => {
  const [leaves] = useLocalStorage('leaves', []);
  const [workSchedules] = useLocalStorage('workSchedules', []);
  const [dutySchedules] = useLocalStorage('dutySchedules', []);
  
  const today = new Date().toISOString().split('T')[0];
  
  // Calculate today's statistics
  const todayLeaves = leaves.filter(leave => 
    leave.startDate <= today && leave.endDate >= today && leave.status === 'approved'
  );
  
  const todaySchedules = workSchedules.filter(schedule => 
    schedule.date === today
  );
  
  const workingEmployees = mockEmployees.filter(emp => 
    !todayLeaves.some(leave => leave.employeeId === emp.id)
  ).length;
  
  const onLeave = todayLeaves.length;
  
  // Get weekend duty for upcoming weekend
  const nextWeekend = dutySchedules.filter(duty => 
    duty.date >= today && duty.status === 'approved'
  ).slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          ภาพรวมการทำงานวันนี้
        </h1>
        <p className="text-blue-100">
          วันที่ {new Date().toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
          })}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">พนักงานทั้งหมด</p>
              <p className="text-3xl font-bold text-gray-900">{mockEmployees.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">มาทำงานวันนี้</p>
              <p className="text-3xl font-bold text-green-600">{workingEmployees}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ลาวันนี้</p>
              <p className="text-3xl font-bold text-amber-600">{onLeave}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-full">
              <UserX className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">เวรวันหยุด</p>
              <p className="text-3xl font-bold text-purple-600">{nextWeekend.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Work Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              ตารางการทำงานวันนี้
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {todaySchedules.length > 0 ? (
                todaySchedules.map((schedule) => {
                  const employee = mockEmployees.find(emp => emp.id === schedule.employeeId);
                  return (
                    <div key={schedule.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <img
                          src={employee?.photo || 'https://via.placeholder.com/40'}
                          alt={employee?.firstName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            {employee?.firstName} {employee?.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{schedule.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {shifts[schedule.shift as keyof typeof shifts]?.time}
                        </p>
                        <p className="text-xs text-gray-600">
                          {shifts[schedule.shift as keyof typeof shifts]?.name}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-4">ไม่มีตารางการทำงานที่กำหนดไว้</p>
              )}
            </div>
          </div>
        </div>

        {/* Weekend Duty Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-600" />
              เวรวันหยุดที่จะถึง
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {nextWeekend.length > 0 ? (
                nextWeekend.map((duty) => (
                  <div key={duty.id} className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-medium text-gray-900">
                        {new Date(duty.date).toLocaleDateString('th-TH', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        อนุมัติแล้ว
                      </span>
                    </div>
                    <div className="space-y-2">
                      {duty.employees.map((empId) => {
                        const employee = mockEmployees.find(emp => emp.id === empId);
                        return (
                          <div key={empId} className="flex items-center space-x-3">
                            <img
                              src={employee?.photo || 'https://via.placeholder.com/32'}
                              alt={employee?.firstName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {employee?.firstName} {employee?.lastName}
                              </p>
                              <p className="text-xs text-gray-600">{employee?.phone}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">ไม่มีเวรวันหยุดที่กำหนดไว้</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Employees on Leave Today */}
      {todayLeaves.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <UserX className="w-5 h-5 mr-2 text-amber-600" />
              พนักงานที่ลาวันนี้
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayLeaves.map((leave) => {
                const employee = mockEmployees.find(emp => emp.id === leave.employeeId);
                return (
                  <div key={leave.id} className="flex items-center space-x-3 p-4 bg-amber-50 rounded-lg">
                    <img
                      src={employee?.photo || 'https://via.placeholder.com/40'}
                      alt={employee?.firstName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {employee?.firstName} {employee?.lastName}
                      </p>
                      <p className="text-sm text-amber-600">
                        {leave.type === 'vacation' ? 'ลาพักผ่อน' : 
                         leave.type === 'sick' ? 'ลาป่วย' : 
                         leave.type === 'personal' ? 'ลากิจ' : 'ลาชั่วโมง'}
                      </p>
                      <p className="text-xs text-gray-600">{leave.reason}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Department Coverage Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            สรุปการครอบคลุมแผนก
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from(new Set(mockEmployees.map(emp => emp.department))).map((dept) => {
              const deptEmployees = mockEmployees.filter(emp => emp.department === dept);
              const deptOnLeave = todayLeaves.filter(leave => 
                deptEmployees.some(emp => emp.id === leave.employeeId)
              ).length;
              const coverage = ((deptEmployees.length - deptOnLeave) / deptEmployees.length) * 100;
              
              return (
                <div key={dept} className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">{dept}</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      {deptEmployees.length - deptOnLeave}/{deptEmployees.length} คน
                    </span>
                    <span className={`text-sm font-medium ${coverage === 100 ? 'text-green-600' : coverage >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                      {Math.round(coverage)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${coverage === 100 ? 'bg-green-500' : coverage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${coverage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;