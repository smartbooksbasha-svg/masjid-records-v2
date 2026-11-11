import type { Family, Member, HouseType } from './types'

export const STREETS = [
  'Street 1', 'Street 2', 'Street 3', 'Street 4', 'Street 5', 'Street 6', 'Street 7',
]

export const HOUSE_TYPES: HouseType[] = ['Cement Sheet', 'Moulding', 'Palm Leaf', 'Tent', 'Tiled', 'Other']

export const EDUCATION = [
  'No Formal Education', 'Primary', 'Middle School', 'Secondary', 'Higher Secondary',
  'Diploma', 'Undergraduate', 'Postgraduate', 'College', 'Madarsa', 'Other',
]

export const OCCUPATIONS = [
  'Plumber', 'Electrician', 'Painter', 'Mason', 'Helper', 'Carpenter', 'Driver',
  'Tailor', 'Farmer', 'Shopkeeper', 'Teacher', 'Engineer', 'Labourer', 'Business', 'Other',
]

export const DEENI = ['Aalim', 'Hafiz', 'Nazira', 'Aalima', 'Mufti', 'Other']

export const DOCS = [
  'Aadhaar Card', 'Ration Card', 'Voter ID', 'BPL/Ayushman Card',
  'Bank Passbook', 'Passport', 'TN Kapidu Thittam Card',
]

export const SCHEMES = [
  'Magalir Urimai Thogai', 'Disability Pension', 'Old Age Pension', 'Widow Pension',
  'School Scholarship', 'PM Awas Yojana', 'Ayushman Bharat', 'Ujjwala', 'Bus Pass',
]

let seq = 0
const m = (p: Partial<Member> & Pick<Member, 'name' | 'relation' | 'gender' | 'dob'>): Member => ({
  id: `M${String(++seq).padStart(3, '0')}`,
  marital: 'Unmarried',
  education: 'Secondary',
  occupation: '',
  deeni: '',
  student: false,
  disabled: false,
  widow: false,
  docs: {},
  schemes: [],
  ...p,
})

export const FAMILIES: Family[] = [
  {
    id: 'MK-2026-0001', head: 'Abdul Rahman', street: 'Street 3', houseNo: '12',
    houseType: 'Moulding', phone: '+91 98400 11223', address: '12, Street 3, Mohalla East',
    createdAt: '2026-02-04', updatedAt: '2026-10-28', status: 'Active',
    members: [
      m({ name: 'Abdul Rahman', relation: 'Head', gender: 'Male', dob: '1979-04-12', marital: 'Married', education: 'Secondary', occupation: 'Electrician' }),
      m({ name: 'Fathima Beevi', relation: 'Wife', gender: 'Female', dob: '1983-07-30', marital: 'Married', education: 'Primary', occupation: '' }),
      m({ name: 'Mohammed Ayaan', relation: 'Son', gender: 'Male', dob: '2009-01-18', marital: 'Unmarried', education: 'Secondary', student: true, deeni: 'Hafiz' }),
      m({ name: 'Ayesha Siddiqa', relation: 'Daughter', gender: 'Female', dob: '2013-09-05', marital: 'Child', education: 'Primary', student: true, deeni: 'Nazira' }),
      m({ name: 'Abdul Hameed', relation: 'Father', gender: 'Male', dob: '1951-03-22', marital: 'Married', education: 'No Formal Education', disabled: true, schemes: ['Old Age Pension'] }),
      m({ name: 'Rahmath Bi', relation: 'Mother', gender: 'Female', dob: '1956-11-02', marital: 'Married', education: 'No Formal Education' }),
    ],
  },
  {
    id: 'MK-2026-0002', head: 'Mohammed Ismail', street: 'Street 1', houseNo: '5',
    houseType: 'Cement Sheet', phone: '+91 97900 44518', address: '5, Street 1, Mohalla North',
    createdAt: '2026-02-06', updatedAt: '2026-09-14', status: 'Active',
    members: [
      m({ name: 'Mohammed Ismail', relation: 'Head', gender: 'Male', dob: '1986-06-09', marital: 'Married', education: 'Higher Secondary', occupation: 'Driver' }),
      m({ name: 'Noorjahan', relation: 'Wife', gender: 'Female', dob: '1990-02-14', marital: 'Married', education: 'Secondary', occupation: 'Tailor', schemes: ['Magalir Urimai Thogai'] }),
      m({ name: 'Mohammed Zaid', relation: 'Son', gender: 'Male', dob: '2014-08-21', marital: 'Child', education: 'Primary', student: true }),
      m({ name: 'Sana Fathima', relation: 'Daughter', gender: 'Female', dob: '2018-12-01', marital: 'Child', education: 'No Formal Education' }),
    ],
  },
  {
    id: 'MK-2026-0003', head: 'Syed Ahmed', street: 'Street 7', houseNo: '21',
    houseType: 'Tiled', phone: '+91 90030 77812', address: '21, Street 7, Mohalla South',
    createdAt: '2026-02-11', updatedAt: '2026-10-30', status: 'Active',
    members: [
      m({ name: 'Syed Ahmed', relation: 'Head', gender: 'Male', dob: '1974-10-19', marital: 'Married', education: 'Undergraduate', occupation: 'Teacher' }),
      m({ name: 'Rukhsana Begum', relation: 'Wife', gender: 'Female', dob: '1978-05-25', marital: 'Married', education: 'Secondary' }),
      m({ name: 'Syed Ibrahim', relation: 'Son', gender: 'Male', dob: '2002-03-11', marital: 'Unmarried', education: 'Undergraduate', occupation: 'Engineer' }),
      m({ name: 'Syed Yusuf', relation: 'Son', gender: 'Male', dob: '2006-07-07', marital: 'Unmarried', education: 'Higher Secondary', student: true }),
      m({ name: 'Ayesha Nasreen', relation: 'Daughter', gender: 'Female', dob: '2010-11-23', marital: 'Unmarried', education: 'Secondary', student: true, deeni: 'Aalima' }),
      m({ name: 'Syed Kareem', relation: 'Brother', gender: 'Male', dob: '1980-01-30', marital: 'Unmarried', education: 'Primary', occupation: 'Helper', disabled: true }),
      m({ name: 'Zainab Bi', relation: 'Mother', gender: 'Female', dob: '1949-09-16', marital: 'Widow', education: 'No Formal Education', widow: true, schemes: ['Widow Pension', 'Old Age Pension'] }),
      m({ name: 'Syed Bilal', relation: 'Son', gender: 'Male', dob: '2016-06-02', marital: 'Child', education: 'Primary', student: true }),
    ],
  },
  {
    id: 'MK-2026-0004', head: 'Abdul Kareem', street: 'Street 4', houseNo: '8',
    houseType: 'Moulding', phone: '+91 98410 90233', address: '8, Street 4, Mohalla West',
    createdAt: '2026-03-01', updatedAt: '2026-08-19', status: 'Active',
    members: [
      m({ name: 'Abdul Kareem', relation: 'Head', gender: 'Male', dob: '1982-12-27', marital: 'Married', education: 'Secondary', occupation: 'Plumber' }),
      m({ name: 'Jameela', relation: 'Wife', gender: 'Female', dob: '1987-03-08', marital: 'Married', education: 'Middle School', schemes: ['Magalir Urimai Thogai', 'Ujjwala'] }),
      m({ name: 'Mohammed Faiz', relation: 'Son', gender: 'Male', dob: '2011-10-14', marital: 'Child', education: 'Middle School', student: true, deeni: 'Nazira' }),
      m({ name: 'Mohammed Arif', relation: 'Son', gender: 'Male', dob: '2015-04-29', marital: 'Child', education: 'Primary', student: true }),
    ],
  },
  {
    id: 'MK-2026-0005', head: 'Noor Mohammed', street: 'Street 2', houseNo: '17',
    houseType: 'Cement Sheet', phone: '+91 94450 66120', address: '17, Street 2, Mohalla North',
    createdAt: '2026-03-12', updatedAt: '2026-10-02', status: 'Active',
    members: [
      m({ name: 'Noor Mohammed', relation: 'Head', gender: 'Male', dob: '1969-08-03', marital: 'Married', education: 'No Formal Education', occupation: 'Labourer' }),
      m({ name: 'Sara Beevi', relation: 'Wife', gender: 'Female', dob: '1973-01-21', marital: 'Married', education: 'No Formal Education' }),
      m({ name: 'Mohammed Salim', relation: 'Son', gender: 'Male', dob: '1996-05-17', marital: 'Married', education: 'Secondary', occupation: 'Business' }),
      m({ name: 'Hasina', relation: 'Daughter-in-law', gender: 'Female', dob: '1999-11-11', marital: 'Married', education: 'Secondary' }),
      m({ name: 'Mohammed Rayyan', relation: 'Grandson', gender: 'Male', dob: '2021-07-25', marital: 'Child', education: 'No Formal Education' }),
    ],
  },
  {
    id: 'MK-2026-0006', head: 'Ismail Marakkar', street: 'Street 5', houseNo: '3',
    houseType: 'Palm Leaf', phone: '+91 90920 33187', address: '3, Street 5, Mohalla East',
    createdAt: '2026-04-02', updatedAt: '2026-09-28', status: 'Active',
    members: [
      m({ name: 'Ismail Marakkar', relation: 'Head', gender: 'Male', dob: '1977-02-09', marital: 'Married', education: 'Primary', occupation: 'Farmer' }),
      m({ name: 'Aamina', relation: 'Wife', gender: 'Female', dob: '1981-06-30', marital: 'Married', education: 'No Formal Education' }),
      m({ name: 'Mohammed Nihal', relation: 'Son', gender: 'Male', dob: '2008-09-13', marital: 'Unmarried', education: 'Secondary', student: true }),
      m({ name: 'Fathima Zahra', relation: 'Daughter', gender: 'Female', dob: '2012-12-19', marital: 'Child', education: 'Middle School', student: true, deeni: 'Nazira' }),
    ],
  },
  {
    id: 'MK-2026-0007', head: 'Syed Mansoor', street: 'Street 6', houseNo: '14',
    houseType: 'Tiled', phone: '+91 99400 88554', address: '14, Street 6, Mohalla South',
    createdAt: '2026-04-21', updatedAt: '2026-10-25', status: 'Active',
    members: [
      m({ name: 'Syed Mansoor', relation: 'Head', gender: 'Male', dob: '1984-09-15', marital: 'Married', education: 'Postgraduate', occupation: 'Engineer' }),
      m({ name: 'Shabana', relation: 'Wife', gender: 'Female', dob: '1988-04-04', marital: 'Married', education: 'Undergraduate', occupation: 'Teacher' }),
      m({ name: 'Syed Amaan', relation: 'Son', gender: 'Male', dob: '2013-01-27', marital: 'Child', education: 'Primary', student: true }),
      m({ name: 'Syeda Hiba', relation: 'Daughter', gender: 'Female', dob: '2017-10-08', marital: 'Child', education: 'No Formal Education' }),
    ],
  },
  {
    id: 'MK-2026-0008', head: 'Abdul Wahab', street: 'Street 3', houseNo: '29',
    houseType: 'Other', phone: '+91 98840 22011', address: '29, Street 3, Mohalla East',
    createdAt: '2026-05-06', updatedAt: '2026-09-09', status: 'Active',
    members: [
      m({ name: 'Abdul Wahab', relation: 'Head', gender: 'Male', dob: '1971-07-18', marital: 'Married', education: 'Middle School', occupation: 'Shopkeeper' }),
      m({ name: 'Naseema', relation: 'Wife', gender: 'Female', dob: '1975-03-02', marital: 'Married', education: 'Primary', schemes: ['Magalir Urimai Thogai', 'Bus Pass'] }),
      m({ name: 'Mohammed Umar', relation: 'Son', gender: 'Male', dob: '2000-11-30', marital: 'Unmarried', education: 'Diploma', occupation: 'Electrician' }),
      m({ name: 'Mohammed Anas', relation: 'Son', gender: 'Male', dob: '2005-06-06', marital: 'Unmarried', education: 'College', student: true }),
      m({ name: 'Hafsa', relation: 'Daughter', gender: 'Female', dob: '2009-08-16', marital: 'Unmarried', education: 'Secondary', student: true, deeni: 'Hafiz' }),
    ],
  },
  {
    id: 'MK-2026-0009', head: 'Kunhi Mohammed', street: 'Street 1', houseNo: '33',
    houseType: 'Tent', phone: '+91 95660 77442', address: '33, Street 1, Mohalla North',
    createdAt: '2026-05-19', updatedAt: '2026-08-30', status: 'Active',
    members: [
      m({ name: 'Kunhi Mohammed', relation: 'Head', gender: 'Male', dob: '1980-01-05', marital: 'Married', education: 'Primary', occupation: 'Painter' }),
      m({ name: 'Rasheeda', relation: 'Wife', gender: 'Female', dob: '1984-08-22', marital: 'Married', education: 'No Formal Education' }),
      m({ name: 'Mohammed Shamil', relation: 'Son', gender: 'Male', dob: '2010-03-15', marital: 'Child', education: 'Middle School', student: true }),
    ],
  },
  {
    id: 'MK-2026-0010', head: 'Syed Raheem', street: 'Street 4', houseNo: '2',
    houseType: 'Moulding', phone: '+91 97910 55209', address: '2, Street 4, Mohalla West',
    createdAt: '2026-06-01', updatedAt: '2026-10-31', status: 'Active',
    members: [
      m({ name: 'Syed Raheem', relation: 'Head', gender: 'Male', dob: '1976-05-11', marital: 'Married', education: 'Secondary', occupation: 'Carpenter' }),
      m({ name: 'Sajida', relation: 'Wife', gender: 'Female', dob: '1980-12-09', marital: 'Married', education: 'Secondary', occupation: 'Tailor' }),
      m({ name: 'Syed Adnan', relation: 'Son', gender: 'Male', dob: '2003-04-02', marital: 'Unmarried', education: 'Undergraduate', occupation: 'Helper' }),
      m({ name: 'Syeda Ayesha', relation: 'Daughter', gender: 'Female', dob: '2007-09-27', marital: 'Unmarried', education: 'Higher Secondary', student: true, deeni: 'Aalima' }),
      m({ name: 'Syed Sahl', relation: 'Son', gender: 'Male', dob: '2019-02-14', marital: 'Child', education: 'No Formal Education' }),
    ],
  },
]
