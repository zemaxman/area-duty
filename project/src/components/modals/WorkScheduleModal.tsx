import React, { useState } from 'react';
import { X, Save, Clock } from 'lucide-react';
import { Employee, WorkSchedule, shifts } from '../../types';

interface WorkScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedule: WorkSchedule) => void;
  employees: Employee[];
  date: string;
  existingSchedule?: WorkSchedule;
}

const WorkScheduleModal: React.FC<WorkScheduleModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  employees, 
  date,
  existingSchedule 
}) => {
  const [formData, setFormData] = useState({
    employeeId: existingSchedule?.employeeId || '',
    shift: existingSchedule?.shift || 'morning' as keyof typeof shifts,
    location: existingSchedule?.location || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const schedule: WorkSchedule = {
      id: existingSchedule?.id || Date.now().toString(),
      employeeId: formData.employeeId,
      date,
      shift: formData.shift,
      location: formData.location,
      status: 'scheduled'
    };

    onSave(schedule);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              จัดตารางการทำงาน - {new Date(date).toLocaleDateString('th-TH')}
            </h3>
            <button className="text-gray-400 hover:text-gray-600" onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">พนักงาน</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.employeeId}
                onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
              >
                <option value="">เลือกพนักงาน</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} - {emp.department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">รอบการทำงาน</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.shift}
                onChange={(e) => setFormData(prev => ({ ...prev, shift: e.target.value as keyof typeof shifts }))}
              >
                {Object.entries(shifts).map(([key, shift]) => (
                  <option key={key} value={key}>
                    {shift.name} ({shift.time})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">สถานที่ปฏิบัติงาน</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="เช่น สำนักงานใหญ่, แผนกอนุมัติ"
              />
            </div>

            {formData.shift.startsWith('afternoon') && (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  💰 ได้รับเงินช่วยเหลือพิเศษ 300 บาท/วัน
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                บันทึก
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkScheduleModal;