import React, { useState } from 'react';
import { X, Save, RefreshCw } from 'lucide-react';
import { Employee, DutyChangeRequest } from '../../types';

interface DutyChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (request: DutyChangeRequest) => void;
  employees: Employee[];
  dutyDate: string;
  currentEmployee?: string;
}

const DutyChangeModal: React.FC<DutyChangeModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  employees, 
  dutyDate,
  currentEmployee 
}) => {
  const [formData, setFormData] = useState({
    fromEmployee: currentEmployee || '',
    toEmployee: '',
    reason: ''
  });

  // Filter eligible employees (level 4-6, excluding current employee)
  const eligibleEmployees = employees.filter(emp => 
    emp.level >= 4 && emp.level <= 6 && emp.id !== formData.fromEmployee
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const request: DutyChangeRequest = {
      id: Date.now().toString(),
      fromEmployee: formData.fromEmployee,
      toEmployee: formData.toEmployee,
      date: dutyDate,
      reason: formData.reason,
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0]
    };

    onSave(request);
    setFormData({
      fromEmployee: currentEmployee || '',
      toEmployee: '',
      reason: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">ขอเปลี่ยนเวร</h3>
            <button className="text-gray-400 hover:text-gray-600" onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              วันที่เวร: <span className="font-semibold">
                {new Date(dutyDate).toLocaleDateString('th-TH', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">จาก (พนักงานที่อยู่เวร)</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.fromEmployee}
                onChange={(e) => setFormData(prev => ({ ...prev, fromEmployee: e.target.value }))}
              >
                <option value="">เลือกพนักงาน</option>
                {employees.filter(emp => emp.level >= 4 && emp.level <= 6).map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} - {emp.department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ไป (พนักงานที่จะมาแทน)</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.toEmployee}
                onChange={(e) => setFormData(prev => ({ ...prev, toEmployee: e.target.value }))}
              >
                <option value="">เลือกพนักงาน</option>
                {eligibleEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} - {emp.department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">เหตุผล</label>
              <textarea
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="ระบุเหตุผลการขอเปลี่ยนเวร"
              />
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
                <RefreshCw className="w-4 h-4 mr-2" />
                ส่งคำขอ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DutyChangeModal;