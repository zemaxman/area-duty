export interface Employee {
  id: string;
  code: string;
  photo?: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  phone: string;
  level: number;
  vehicle?: {
    brand: string;
    color: string;
    licensePlate: string;
  };
  transferDate: string;
  completionDate: string;
  documents: Document[];
}

export interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  url: string;
}

export interface DutySchedule {
  id: string;
  date: string;
  employees: string[];
  type: 'weekend' | 'holiday' | 'special';
  status: 'draft' | 'approved' | 'completed';
  isChanged?: boolean;
  originalEmployees?: string[];
}

export interface DutyChangeRequest {
  id: string;
  fromEmployee: string;
  toEmployee: string;
  date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  approvedBy?: string;
}

export interface Leave {
  id: string;
  employeeId: string;
  type: 'personal' | 'vacation' | 'sick' | 'hourly';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
}

export interface WorkSchedule {
  id: string;
  employeeId: string;
  date: string;
  shift: 'morning' | 'afternoon-12' | 'afternoon-13' | 'afternoon-14' | 'afternoon-15' | 'afternoon-1550';
  location: string;
  status: 'scheduled' | 'completed' | 'absent';
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
  type: 'public' | 'special' | 'bank';
}

export interface SpecialPay {
  id: string;
  employeeId: string;
  date: string;
  type: 'afternoon' | 'weekend' | 'overtime';
  amount: number;
  hours?: number;
}

export const departments = [
  'ผู้จัดการ',
  'ผู้ช่วยผู้จัดการ',
  'แผนกอนุมัติ',
  'แผนกนับคัด',
  'แผนกตรวจพิสูจน์',
  'แผนกทำลาย',
  'แผนกช่าง',
  'แผนกผลัดบ่าย',
  'แผนกธุรการ',
  'แผนกห้องมั่นคง',
  'แผนกช่วยงาน'
];

export const shifts = {
  'morning': { name: 'เช้า', time: '08:30-16:30' },
  'afternoon-12': { name: 'บ่าย', time: '12:00-20:00' },
  'afternoon-13': { name: 'บ่าย', time: '13:00-21:00' },
  'afternoon-14': { name: 'บ่าย', time: '14:00-22:00' },
  'afternoon-15': { name: 'บ่าย', time: '15:00-23:00' },
  'afternoon-1550': { name: 'บ่าย', time: '15:50-23:50' }
};