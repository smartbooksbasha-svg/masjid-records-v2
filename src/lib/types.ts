export type HouseType = 'Cement Sheet' | 'Moulding' | 'Palm Leaf' | 'Tent' | 'Tiled' | 'Other'
export type Gender = 'Male' | 'Female'
export type Marital = 'Married' | 'Unmarried' | 'Widow' | 'Widower' | 'Child'
export type FamilyStatus = 'Active' | 'Archived'

export interface Member {
  id: string
  name: string
  relation: string
  gender: Gender
  dob: string // ISO date (YYYY-MM-DD)
  marital: Marital
  education: string
  occupation: string
  deeni: string
  student: boolean
  disabled: boolean
  widow: boolean
  docs: Record<string, boolean>
  schemes: string[]
}

export interface Family {
  id: string // human Family ID, e.g. MK-2026-0001
  head: string
  street: string
  houseNo: string
  houseType: HouseType
  phone: string
  address: string
  notes?: string
  members: Member[]
  createdAt: string
  updatedAt: string
  status: FamilyStatus
}
