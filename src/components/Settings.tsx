import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Users, 
  Calendar, 
  Clock, 
  DollarSign,
  Bell,
  Shield,
  Database,
  Download,
  Upload,
  Save,
  RotateCcw,
  Building,
  Phone,
  Mail,
  MapPin,
  Palette,
  Globe,
  Monitor
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { exportToExcel, importFromExcel } from '../utils/excelUtils';

interface SystemSettings {
  organization: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
  };
  workSchedule: {
    workDays: string[];
    morningShift: { start: string; end: string };
    afternoonShifts: {
      shift12: { start: string; end: string };
      shift13: { start: string; end: string };
      shift14: { start: string; end: string };
      shift15: { start: string; end: string };
      shift1550: { start: string; end: string };
    };
  };
  specialPay: {
    afternoonPay: number;
    weekendPay: number;
    overtimePay: number;
  };
  leave: {
    annualLeave: number;
    sickLeave: number;
    personalLeave: number;
    maxConsecutiveDays: number;
  };
  duty: {
    eligibleLevels: number[];
    employeesPerDuty: number;
    autoAssign: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    dutyReminders: boolean;
    leaveApprovals: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    primaryColor: string;
    language: 'th' | 'en';
  };
}

const defaultSettings: SystemSettings = {
  organization: {
    name: 'ระบบจัดการหน้าที่พนักงาน',
    address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
    phone: '02-123-4567',
    email: 'admin@company.com'
  },
  workSchedule: {
    workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    morningShift: { start: '08:30', end: '16:30' },
    afternoonShifts: {
      shift12: { start: '12:00', end: '20:00' },
      shift13: { start: '13:00', end: '21:00' },
      shift14: { start: '14:00', end: '22:00' },
      shift15: { start: '15:00', end: '23:00' },
      shift1550: { start: '15:50', end: '23:50' }
    }
  },
  specialPay: {
    afternoonPay: 300,
    weekendPay: 250,
    overtimePay: 300
  },
  leave: {
    annualLeave: 10,
    sickLeave: 30,
    personalLeave: 3,
    maxConsecutiveDays: 5
  },
  duty: {
    eligibleLevels: [4, 5, 6],
    employeesPerDuty: 2,
    autoAssign: true
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    dutyReminders: true,
    leaveApprovals: true
  },
  appearance: {
    theme: 'light',
    primaryColor: '#3B82F6',
    language: 'th'
  }
};

const Settings: React.FC = () => {
  const [settings, setSettings] = useLocalStorage<SystemSettings>('systemSettings', defaultSettings);
  const [activeTab, setActiveTab] = useState('organization');
  const [hasChanges, setHasChanges] = useState(false);

  const tabs = [
    { id: 'organization', name: 'องค์กร', icon: Building },
    { id: 'schedule', name: 'ตารางงาน', icon: Clock },
    { id: 'pay', name: 'เงินพิเศษ', icon: DollarSign },
    { id: 'leave', name: 'การลา', icon: Calendar },
    { id: 'duty', name: 'เวรวันหยุด', icon: Users },
    { id: 'notifications', name: 'การแจ้งเตือน', icon: Bell },
    { id: 'appearance', name: 'รูปลักษณ์', icon: Palette },
    { id: 'data', name: 'ข้อมูล', icon: Database }
  ];

  const updateSettings = (section: keyof SystemSettings, data: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
    alert('บันทึกการตั้งค่าเรียบร้อยแล้ว');
  };

  const handleReset = () => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะรีเซ็ตการตั้งค่าทั้งหมด?')) {
      setSettings(defaultSettings);
      setHasChanges(false);
    }
  };

  const handleExportSettings = () => {
    const exportData = [{
      section: 'System Settings',
      data: JSON.stringify(settings, null, 2)
    }];
    exportToExcel(exportData, 'การตั้งค่าระบบ');
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importFromExcel(file).then(data => {
        try {
          const importedSettings = JSON.parse(data[0]?.data || '{}');
          setSettings({ ...defaultSettings, ...importedSettings });
          setHasChanges(true);
          alert('นำเข้าการตั้งค่าเรียบร้อยแล้ว');
        } catch (error) {
          alert('เกิดข้อผิดพลาดในการนำเข้าไฟล์');
        }
      });
    }
  };

  const renderOrganizationSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อองค์กร</label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={settings.organization.name}
          onChange={(e) => updateSettings('organization', { name: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">ที่อยู่</label>
        <textarea
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={settings.organization.address}
          onChange={(e) => updateSettings('organization', { address: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทร</label>
          <input
            type="tel"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={settings.organization.phone}
            onChange={(e) => updateSettings('organization', { phone: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
          <input
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={settings.organization.email}
            onChange={(e) => updateSettings('organization', { email: e.target.value })}
          />
        </div>
      </div>
    </div>
  );

  const renderScheduleSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">วันทำงาน</label>
        <div className="grid grid-cols-7 gap-2">
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day, index) => {
            const dayNames = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'];
            return (
              <label key={day} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.workSchedule.workDays.includes(day)}
                  onChange={(e) => {
                    const newWorkDays = e.target.checked
                      ? [...settings.workSchedule.workDays, day]
                      : settings.workSchedule.workDays.filter(d => d !== day);
                    updateSettings('workSchedule', { workDays: newWorkDays });
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{dayNames[index]}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">รอบการทำงาน</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-3">รอบเช้า</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เวลาเริ่ม</label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={settings.workSchedule.morningShift.start}
                  onChange={(e) => updateSettings('workSchedule', { 
                    morningShift: { ...settings.workSchedule.morningShift, start: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เวลาเลิก</label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={settings.workSchedule.morningShift.end}
                  onChange={(e) => updateSettings('workSchedule', { 
                    morningShift: { ...settings.workSchedule.morningShift, end: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-3">รอบบ่าย</h4>
            <div className="space-y-3">
              {Object.entries(settings.workSchedule.afternoonShifts).map(([key, shift]) => (
                <div key={key} className="grid grid-cols-3 gap-4 items-center">
                  <div className="text-sm font-medium text-gray-700">
                    รอบ {key.replace('shift', '')}
                  </div>
                  <input
                    type="time"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={shift.start}
                    onChange={(e) => updateSettings('workSchedule', {
                      afternoonShifts: {
                        ...settings.workSchedule.afternoonShifts,
                        [key]: { ...shift, start: e.target.value }
                      }
                    })}
                  />
                  <input
                    type="time"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={shift.end}
                    onChange={(e) => updateSettings('workSchedule', {
                      afternoonShifts: {
                        ...settings.workSchedule.afternoonShifts,
                        [key]: { ...shift, end: e.target.value }
                      }
                    })}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-medium text-green-900 mb-3">เงินช่วยเหลือผลัดบ่าย</h3>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={settings.specialPay.afternoonPay}
              onChange={(e) => updateSettings('specialPay', { afternoonPay: parseInt(e.target.value) })}
            />
            <span className="text-sm text-gray-600">บาท/วัน</span>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-3">เงินช่วยเหลือวันหยุด</h3>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={settings.specialPay.weekendPay}
              onChange={(e) => updateSettings('specialPay', { weekendPay: parseInt(e.target.value) })}
            />
            <span className="text-sm text-gray-600">บาท/วัน</span>
          </div>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg">
          <h3 className="font-medium text-purple-900 mb-3">เงินล่วงเวลา</h3>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={settings.specialPay.overtimePay}
              onChange={(e) => updateSettings('specialPay', { overtimePay: parseInt(e.target.value) })}
            />
            <span className="text-sm text-gray-600">บาท/วัน</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">เงื่อนไขการจ่ายเงินพิเศษ</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• ผลัดบ่าย (จันทร์-ศุกร์): {settings.specialPay.afternoonPay} บาท/วัน</p>
          <p>• วันหยุด (8:30-16:30): {settings.specialPay.weekendPay} บาท + วันหยุดชดเชย</p>
          <p>• วันหยุด (เลิกงาน 20:00+): {settings.specialPay.overtimePay} บาท</p>
        </div>
      </div>
    </div>
  );

  const renderLeaveSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">วันลาพักผ่อนต่อปี</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={settings.leave.annualLeave}
              onChange={(e) => updateSettings('leave', { annualLeave: parseInt(e.target.value) })}
            />
            <span className="text-sm text-gray-600">วัน</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">วันลาป่วยต่อปี</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={settings.leave.sickLeave}
              onChange={(e) => updateSettings('leave', { sickLeave: parseInt(e.target.value) })}
            />
            <span className="text-sm text-gray-600">วัน</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">วันลากิจต่อปี</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={settings.leave.personalLeave}
              onChange={(e) => updateSettings('leave', { personalLeave: parseInt(e.target.value) })}
            />
            <span className="text-sm text-gray-600">วัน</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">วันลาติดต่อกันสูงสุด</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={settings.leave.maxConsecutiveDays}
              onChange={(e) => updateSettings('leave', { maxConsecutiveDays: parseInt(e.target.value) })}
            />
            <span className="text-sm text-gray-600">วัน</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDutySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">ระดับพนักงานที่สามารถอยู่เวรได้</label>
        <div className="flex space-x-4">
          {[4, 5, 6, 7, 8].map(level => (
            <label key={level} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.duty.eligibleLevels.includes(level)}
                onChange={(e) => {
                  const newLevels = e.target.checked
                    ? [...settings.duty.eligibleLevels, level]
                    : settings.duty.eligibleLevels.filter(l => l !== level);
                  updateSettings('duty', { eligibleLevels: newLevels });
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">ระดับ {level}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">จำนวนพนักงานต่อเวร</label>
        <input
          type="number"
          min="1"
          max="5"
          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={settings.duty.employeesPerDuty}
          onChange={(e) => updateSettings('duty', { employeesPerDuty: parseInt(e.target.value) })}
        />
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.duty.autoAssign}
            onChange={(e) => updateSettings('duty', { autoAssign: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">เปิดใช้งานการจัดเวรอัตโนมัติ</span>
        </label>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium text-gray-900">การแจ้งเตือนทางอีเมล</div>
            <div className="text-sm text-gray-600">ส่งการแจ้งเตือนผ่านอีเมล</div>
          </div>
          <input
            type="checkbox"
            checked={settings.notifications.emailNotifications}
            onChange={(e) => updateSettings('notifications', { emailNotifications: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </label>

        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium text-gray-900">การแจ้งเตือนทาง SMS</div>
            <div className="text-sm text-gray-600">ส่งการแจ้งเตือนผ่านข้อความ</div>
          </div>
          <input
            type="checkbox"
            checked={settings.notifications.smsNotifications}
            onChange={(e) => updateSettings('notifications', { smsNotifications: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </label>

        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium text-gray-900">แจ้งเตือนเวรวันหยุด</div>
            <div className="text-sm text-gray-600">แจ้งเตือนก่อนวันอยู่เวร</div>
          </div>
          <input
            type="checkbox"
            checked={settings.notifications.dutyReminders}
            onChange={(e) => updateSettings('notifications', { dutyReminders: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </label>

        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium text-gray-900">แจ้งเตือนการอนุมัติลา</div>
            <div className="text-sm text-gray-600">แจ้งเตือนเมื่อมีคำขอลารอการอนุมัติ</div>
          </div>
          <input
            type="checkbox"
            checked={settings.notifications.leaveApprovals}
            onChange={(e) => updateSettings('notifications', { leaveApprovals: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </label>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">ธีม</label>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'light', name: 'สว่าง', icon: '☀️' },
            { value: 'dark', name: 'มืด', icon: '🌙' },
            { value: 'auto', name: 'อัตโนมัติ', icon: '🔄' }
          ].map(theme => (
            <label key={theme.value} className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer ${
              settings.appearance.theme === theme.value ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}>
              <input
                type="radio"
                name="theme"
                value={theme.value}
                checked={settings.appearance.theme === theme.value}
                onChange={(e) => updateSettings('appearance', { theme: e.target.value })}
                className="sr-only"
              />
              <div className="text-center">
                <div className="text-2xl mb-2">{theme.icon}</div>
                <div className="text-sm font-medium">{theme.name}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">สีหลัก</label>
        <div className="flex items-center space-x-4">
          <input
            type="color"
            value={settings.appearance.primaryColor}
            onChange={(e) => updateSettings('appearance', { primaryColor: e.target.value })}
            className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
          />
          <input
            type="text"
            value={settings.appearance.primaryColor}
            onChange={(e) => updateSettings('appearance', { primaryColor: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">ภาษา</label>
        <select
          value={settings.appearance.language}
          onChange={(e) => updateSettings('appearance', { language: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="th">ไทย</option>
          <option value="en">English</option>
        </select>
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-3">การสำรองข้อมูล</h3>
        <div className="flex space-x-3">
          <button 
            className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
            onClick={handleExportSettings}
          >
            <Download className="w-4 h-4 mr-2" />
            ส่งออกการตั้งค่า
          </button>
          <label className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            นำเข้าการตั้งค่า
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleImportSettings}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="p-4 bg-amber-50 rounded-lg">
        <h3 className="font-medium text-amber-900 mb-3">รีเซ็ตระบบ</h3>
        <p className="text-sm text-amber-700 mb-3">
          การรีเซ็ตจะลบข้อมูลทั้งหมดและกลับไปใช้การตั้งค่าเริ่มต้น
        </p>
        <button 
          className="inline-flex items-center px-4 py-2 border border-amber-300 rounded-lg text-sm font-medium text-amber-700 bg-white hover:bg-amber-50"
          onClick={handleReset}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          รีเซ็ตการตั้งค่า
        </button>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">ข้อมูลระบบ</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>เวอร์ชัน: 1.0.0</p>
          <p>อัปเดตล่าสุด: {new Date().toLocaleDateString('th-TH')}</p>
          <p>ข้อมูลถูกเก็บใน: Local Storage</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">การตั้งค่าระบบ</h1>
          <p className="text-gray-600">จัดการการตั้งค่าและการกำหนดค่าระบบ</p>
        </div>
        <div className="flex space-x-3">
          {hasChanges && (
            <button 
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              onClick={handleSave}
            >
              <Save className="w-4 h-4 mr-2" />
              บันทึกการเปลี่ยนแปลง
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'organization' && renderOrganizationSettings()}
          {activeTab === 'schedule' && renderScheduleSettings()}
          {activeTab === 'pay' && renderPaySettings()}
          {activeTab === 'leave' && renderLeaveSettings()}
          {activeTab === 'duty' && renderDutySettings()}
          {activeTab === 'notifications' && renderNotificationSettings()}
          {activeTab === 'appearance' && renderAppearanceSettings()}
          {activeTab === 'data' && renderDataSettings()}
        </div>
      </div>

      {/* Save Changes Banner */}
      {hasChanges && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5" />
            <span>มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก</span>
            <button 
              onClick={handleSave}
              className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100"
            >
              บันทึก
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;