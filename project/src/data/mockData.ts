import { Employee, DutySchedule, Leave, WorkSchedule, Holiday, DutyChangeRequest } from '../types';

export const mockEmployees: Employee[] = [
  {
    id: '1',
    code: 'EMP001',
    photo: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    position: 'ผู้จัดการ',
    department: 'ผู้จัดการ',
    phone: '081-234-5678',
    level: 8,
    transferDate: '2020-01-15',
    completionDate: '2024-01-15',
    documents: []
  },
  {
    id: '2',
    code: 'EMP002',
    photo: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    firstName: 'สมหญิง',
    lastName: 'รักงาน',
    position: 'ผู้ช่วยผู้จัดการ',
    department: 'ผู้ช่วยผู้จัดการ',
    phone: '081-234-5679',
    level: 7,
    transferDate: '2020-03-01',
    completionDate: '2024-03-01',
    documents: []
  },
  {
    id: '3',
    code: 'EMP003',
    photo: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
    firstName: 'ประเสริฐ',
    lastName: 'อนุมัติดี',
    position: 'เจ้าหน้าที่อนุมัติ',
    department: 'แผนกอนุมัติ',
    phone: '081-234-5680',
    level: 6,
    vehicle: { brand: 'Toyota', color: 'ขาว', licensePlate: 'กข 1234' },
    transferDate: '2021-05-10',
    completionDate: '2025-05-10',
    documents: []
  },
  {
    id: '4',
    code: 'EMP004',
    photo: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
    firstName: 'วิภา',
    lastName: 'นับคัดเก่ง',
    position: 'เจ้าหน้าที่นับคัด',
    department: 'แผนกนับคัด',
    phone: '081-234-5681',
    level: 5,
    transferDate: '2022-01-20',
    completionDate: '2026-01-20',
    documents: []
  },
  {
    id: '5',
    code: 'EMP005',
    photo: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    firstName: 'รัชต์',
    lastName: 'ตรวจพิสูจน์',
    position: 'เจ้าหน้าที่ตรวจพิสูจน์',
    department: 'แผนกตรวจพิสูจน์',
    phone: '081-234-5682',
    level: 6,
    transferDate: '2021-08-15',
    completionDate: '2025-08-15',
    documents: []
  },
  {
    id: '6',
    code: 'EMP006',
    photo: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=150',
    firstName: 'สำราญ',
    lastName: 'ทำลายปลอม',
    position: 'เจ้าหน้าที่ทำลาย',
    department: 'แผนกทำลาย',
    phone: '081-234-5683',
    level: 5,
    transferDate: '2022-03-01',
    completionDate: '2026-03-01',
    documents: []
  },
  {
    id: '7',
    code: 'EMP007',
    photo: 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=150',
    firstName: 'ช่างใจ',
    lastName: 'ซ่อมเก่ง',
    position: 'ช่างเทคนิค',
    department: 'แผนกช่าง',
    phone: '081-234-5684',
    level: 6,
    vehicle: { brand: 'Honda', color: 'แดง', licensePlate: 'คง 5678' },
    transferDate: '2020-12-01',
    completionDate: '2024-12-01',
    documents: []
  },
  {
    id: '8',
    code: 'EMP008',
    photo: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=150',
    firstName: 'บ่ายดี',
    lastName: 'ผลัดเย็น',
    position: 'เจ้าหน้าที่ผลัดบ่าย',
    department: 'แผนกผลัดบ่าย',
    phone: '081-234-5685',
    level: 5,
    transferDate: '2021-11-15',
    completionDate: '2025-11-15',
    documents: []
  },
  {
    id: '9',
    code: 'EMP009',
    photo: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150',
    firstName: 'ธุรกิจ',
    lastName: 'การงาน',
    position: 'เจ้าหน้าที่ธุรการ',
    department: 'แผนกธุรการ',
    phone: '081-234-5686',
    level: 4,
    transferDate: '2022-06-01',
    completionDate: '2026-06-01',
    documents: []
  },
  {
    id: '10',
    code: 'EMP010',
    photo: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=150',
    firstName: 'ธุรการ',
    lastName: 'ดีมาก',
    position: 'เจ้าหน้าที่ธุรการ',
    department: 'แผนกธุรการ',
    phone: '081-234-5687',
    level: 4,
    transferDate: '2022-07-15',
    completionDate: '2026-07-15',
    documents: []
  },
  {
    id: '11',
    code: 'EMP011',
    photo: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=150',
    firstName: 'ปลอดภัย',
    lastName: 'มั่นคง',
    position: 'เจ้าหน้าที่รักษาความปลอดภัย',
    department: 'แผนกห้องมั่นคง',
    phone: '081-234-5688',
    level: 5,
    transferDate: '2021-09-01',
    completionDate: '2025-09-01',
    documents: []
  },
  {
    id: '12',
    code: 'EMP012',
    photo: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=150',
    firstName: 'รักษา',
    lastName: 'ความปลอดภัย',
    position: 'เจ้าหน้าที่รักษาความปลอดภัย',
    department: 'แผนกห้องมั่นคง',
    phone: '081-234-5689',
    level: 4,
    transferDate: '2022-02-15',
    completionDate: '2026-02-15',
    documents: []
  },
  {
    id: '13',
    code: 'EMP013',
    photo: 'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?auto=compress&cs=tinysrgb&w=150',
    firstName: 'ช่วยเหลือ',
    lastName: 'งานดี',
    position: 'เจ้าหน้าที่ช่วยงาน',
    department: 'แผนกช่วยงาน',
    phone: '081-234-5690',
    level: 4,
    transferDate: '2022-04-01',
    completionDate: '2026-04-01',
    documents: []
  },
  {
    id: '14',
    code: 'EMP014',
    photo: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
    firstName: 'สนับสนุน',
    lastName: 'ช่วยเหลือ',
    position: 'เจ้าหน้าที่ช่วยงาน',
    department: 'แผนกช่วยงาน',
    phone: '081-234-5691',
    level: 4,
    transferDate: '2022-05-15',
    completionDate: '2026-05-15',
    documents: []
  },
  {
    id: '15',
    code: 'EMP015',
    photo: 'https://images.pexels.com/photos/1181717/pexels-photo-1181717.jpeg?auto=compress&cs=tinysrgb&w=150',
    firstName: 'ทำงาน',
    lastName: 'เก่งมาก',
    position: 'เจ้าหน้าที่ช่วยงาน',
    department: 'แผนกช่วยงาน',
    phone: '081-234-5692',
    level: 5,
    transferDate: '2021-12-01',
    completionDate: '2025-12-01',
    documents: []
  }
];

export const mockDutySchedules: DutySchedule[] = [
  {
    id: '1',
    date: '2025-01-18',
    employees: ['3', '7'],
    type: 'weekend',
    status: 'approved'
  },
  {
    id: '2',
    date: '2025-01-19',
    employees: ['5', '11'],
    type: 'weekend',
    status: 'approved'
  },
  {
    id: '3',
    date: '2025-01-25',
    employees: ['9', '13'],
    type: 'weekend',
    status: 'approved'
  },
  {
    id: '4',
    date: '2025-01-26',
    employees: ['10', '14'],
    type: 'weekend',
    status: 'approved'
  }
];

export const mockLeaves: Leave[] = [
  {
    id: '1',
    employeeId: '4',
    type: 'vacation',
    startDate: '2025-01-16',
    endDate: '2025-01-16',
    days: 1,
    reason: 'ลาพักผ่อน',
    status: 'approved'
  },
  {
    id: '2',
    employeeId: '8',
    type: 'sick',
    startDate: '2025-01-16',
    endDate: '2025-01-16',
    days: 1,
    reason: 'ป่วยไข้หวัด',
    status: 'approved'
  }
];

export const mockWorkSchedules: WorkSchedule[] = [
  {
    id: '1',
    employeeId: '1',
    date: '2025-01-16',
    shift: 'morning',
    location: 'สำนักงานใหญ่',
    status: 'scheduled'
  },
  {
    id: '2',
    employeeId: '2',
    date: '2025-01-16',
    shift: 'morning',
    location: 'แผนกห้องมั่นคง',
    status: 'scheduled'
  },
  {
    id: '3',
    employeeId: '3',
    date: '2025-01-16',
    shift: 'morning',
    location: 'แผนกอนุมัติ',
    status: 'scheduled'
  }
];

export const mockHolidays: Holiday[] = [
  {
    id: '1',
    date: '2025-01-01',
    name: 'วันขึ้นปีใหม่',
    type: 'public'
  },
  {
    id: '2',
    date: '2025-02-12',
    name: 'วันมาฆบูชา',
    type: 'public'
  },
  {
    id: '3',
    date: '2025-04-06',
    name: 'วันจักรี',
    type: 'public'
  }
];

export const mockDutyChangeRequests: DutyChangeRequest[] = [
  {
    id: '1',
    fromEmployee: '3',
    toEmployee: '15',
    date: '2025-01-25',
    reason: 'มีธุระส่วนตัว',
    status: 'pending',
    requestDate: '2025-01-15'
  }
];