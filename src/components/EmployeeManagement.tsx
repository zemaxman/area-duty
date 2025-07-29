import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Phone, 
  Car, 
  Calendar,
  FileText,
  Download,
  Upload,
  Filter
} from 'lucide-react';
import { mockEmployees as initialEmployees } from '../data/mockData';
import { Employee, departments } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { exportToExcel, importFromExcel } from '../utils/excelUtils';
import EmployeeModal from './modals/EmployeeModal';

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useLocalStorage<Employee[]>('employees', initialEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.firstName.includes(searchTerm) || 
                         emp.lastName.includes(searchTerm) || 
                         emp.code.includes(searchTerm) ||
                         emp.phone.includes(searchTerm);
    const matchesDepartment = !selectedDepartment || emp.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
  };

  const handleSaveEmployee = (employee: Employee) => {
    if (editingEmployee) {
      setEmployees(prev => prev.map(emp => emp.id === employee.id ? employee : emp));
    } else {
      setEmployees(prev => [...prev, employee]);
    }
    setEditingEmployee(null);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowAddModal(true);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบพนักงานคนนี้?')) {
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    }
  };

  const handleExportExcel = () => {
    const exportData = employees.map(emp => ({
      รหัส: emp.code,
      ชื่อ: emp.firstName,
      นามสกุล: emp.lastName,
      ตำแหน่ง: emp.position,
      แผนก: emp.department,
      เบอร์โทร: emp.phone,
      ระดับ: emp.level,
      วันที่เริ่มงาน: emp.transferDate,
      ครบ4ปี: emp.completionDate
    }));
    exportToExcel(exportData, 'รายชื่อพนักงาน');
  };

  const handleImportExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importFromExcel(file).then(data => {
        console.log('Imported data:', data);
        // Process imported data here
      }).catch(error => {
        alert('เกิดข้อผิดพลาดในการนำเข้าไฟล์: ' + error.message);
      });
    }
  };

  const getYearsOfService = (transferDate: string) => {
    const years = (new Date().getTime() - new Date(transferDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    return Math.floor(years * 10) / 10;
  };

  const getDaysUntilCompletion = (completionDate: string) => {
    const days = (new Date(completionDate).getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000);
    return Math.ceil(days);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการข้อมูลพนักงาน</h1>
          <p className="text-gray-600">จัดการข้อมูลพนักงานทั้งหมด {employees.length} คน</p>
        </div>
        <div className="flex space-x-3">
          <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            นำเข้า Excel
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleImportExcel}
              className="hidden"
            />
          </label>
          <button 
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            onClick={handleExportExcel}
          >
            <Download className="w-4 h-4 mr-2" />
            ส่งออก Excel
          </button>
          <button 
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              setEditingEmployee(null);
              setShowAddModal(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มพนักงาน
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาพนักงาน (ชื่อ, รหัส, เบอร์โทร)"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <select
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="">ทุกแผนก</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">พบ {filteredEmployees.length} คน</span>
            {(searchTerm || selectedDepartment) && (
              <button 
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDepartment('');
                }}
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => (
          <div key={employee.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={employee.photo || 'https://via.placeholder.com/60'}
                  alt={employee.firstName}
                  className="w-15 h-15 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {employee.firstName} {employee.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{employee.position}</p>
                  <p className="text-xs text-blue-600 font-medium">{employee.code}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  {employee.department}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {employee.phone}
                </div>
                {employee.vehicle && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Car className="w-4 h-4 mr-2" />
                    {employee.vehicle.brand} {employee.vehicle.color} {employee.vehicle.licensePlate}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  อายุงาน {getYearsOfService(employee.transferDate)} ปี
                </div>
              </div>

              {/* Service Completion Status */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>ครบ 4 ปี</span>
                  <span>{getDaysUntilCompletion(employee.completionDate)} วัน</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getDaysUntilCompletion(employee.completionDate) <= 0 ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ 
                      width: `${Math.min(100, Math.max(0, 100 - (getDaysUntilCompletion(employee.completionDate) / (4 * 365)) * 100))}%` 
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button 
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => handleViewEmployee(employee)}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  ดูรายละเอียด
                </button>
                <button 
                  className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => handleEditEmployee(employee)}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  className="inline-flex items-center justify-center px-3 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                  onClick={() => handleDeleteEmployee(employee.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบข้อมูลพนักงาน</h3>
          <p className="text-gray-600">ลองเปลี่ยนเงื่อนไขการค้นหาหรือเพิ่มพนักงานใหม่</p>
        </div>
      )}

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setSelectedEmployee(null)} />
            
            <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">ข้อมูลพนักงาน</h3>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setSelectedEmployee(null)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedEmployee.photo || 'https://via.placeholder.com/80'}
                    alt={selectedEmployee.firstName}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">
                      {selectedEmployee.firstName} {selectedEmployee.lastName}
                    </h4>
                    <p className="text-gray-600">{selectedEmployee.position}</p>
                    <p className="text-sm text-blue-600 font-medium">{selectedEmployee.code}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">ข้อมูลทั่วไป</h5>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">แผนก:</span> {selectedEmployee.department}</div>
                      <div><span className="font-medium">เบอร์โทร:</span> {selectedEmployee.phone}</div>
                      <div><span className="font-medium">ระดับ:</span> {selectedEmployee.level}</div>
                      <div><span className="font-medium">วันที่เริ่มงาน:</span> {new Date(selectedEmployee.transferDate).toLocaleDateString('th-TH')}</div>
                      <div><span className="font-medium">ครบ 4 ปี:</span> {new Date(selectedEmployee.completionDate).toLocaleDateString('th-TH')}</div>
                    </div>
                  </div>

                  {selectedEmployee.vehicle && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">ข้อมูลยานพาหนะ</h5>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">ยี่ห้อ:</span> {selectedEmployee.vehicle.brand}</div>
                        <div><span className="font-medium">สี:</span> {selectedEmployee.vehicle.color}</div>
                        <div><span className="font-medium">ทะเบียน:</span> {selectedEmployee.vehicle.licensePlate}</div>
                      </div>
                    </div>
                  )}
                </div>

                {selectedEmployee.documents.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">เอกสารแนบ</h5>
                    <div className="space-y-2">
                      {selectedEmployee.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                              <p className="text-xs text-gray-600">{new Date(doc.uploadDate).toLocaleDateString('th-TH')}</p>
                            </div>
                          </div>
                          <button className="text-blue-600 hover:text-blue-800 text-sm">ดาวน์โหลด</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee Add/Edit Modal */}
      <EmployeeModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingEmployee(null);
        }}
        onSave={handleSaveEmployee}
        employee={editingEmployee}
      />
    </div>
  );
};

export default EmployeeManagement;