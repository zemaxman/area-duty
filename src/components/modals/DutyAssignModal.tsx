import React, { useState } from 'react';
import { X, Save, Users } from 'lucide-react';
import { Employee, DutySchedule } from '../../types';

interface DutyAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (duty: DutySchedule) => void;
  date: string;
  employees: Employee[];
  existingDuty?: DutySchedule;
}

const DutyAssignModal: React.FC<DutyAssignModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  date, 
  employees, 
  existingDuty 
}) => {
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>(
    existingDuty?.employees || []
  );
  const [dutyType, setDutyType] = useState<'weekend' | 'holiday' | 'special'>(
    existingDuty?.type || 'weekend'
  );

  // Filter eligible employees (level 4-6)
  const eligibleEmployees = employees.filter(emp => emp.level >= 4 && emp.level <= 6);

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else if (prev.length < 2) {
        return [...prev, employeeId];
      }
      return prev;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedEmployees.length !== 2) {
      alert('กรุณาเลือกพนักงาน 2 คน');
      return;
    }

    const duty: DutySchedule = {
      id: existingDuty?.id || Date.now().toString(),
      date,
      employees: selectedEmployees,
      type: dutyType,
      status: 'draft'
    };

    onSave(duty);
    onClose();
  };

  const autoAssign = () => {
    // Simple auto-assignment logic
    const shuffled = [...eligibleEmployees].sort(() => 0.5 - Math.random());
    setSelectedEmployees(shuffled.slice(0, 2).map(emp => emp.id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              จัดเวรวันที่ {new Date(date).toLocaleDateString('th-TH')}
            </h3>
            <button className="text-gray-400 hover:text-gray-600" onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทเวร</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={dutyType}
                onChange={(e) => setDutyType(e.target.value as 'weekend' | 'holiday' | 'special')}
              >
                <option value="weekend">เวรวันหยุด</option>
                <option value="holiday">เวรวันหยุดนักขัตฤกษ์</option>
                <option value="special">เวรพิเศษ</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  เลือกพนักงาน (เลือก 2 คน)
                </label>
                <button
                  type="button"
                  onClick={autoAssign}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  จัดอัตโนมัติ
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                {eligibleEmployees.map((employee) => (
                  <label
                    key={employee.id}
                    className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedEmployees.includes(employee.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(employee.id)}
                      onChange={() => handleEmployeeToggle(employee.id)}
                      disabled={!selectedEmployees.includes(employee.id) && selectedEmployees.length >= 2}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <img
                      src={employee.photo || 'https://via.placeholder.com/40'}
                      alt={employee.firstName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {employee.firstName} {employee.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {employee.department} • {employee.phone}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      ระดับ {employee.level}
                    </div>
                  </label>
                ))}
              </div>
            </div>

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

export default DutyAssignModal;