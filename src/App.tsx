import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import Dashboard from './pages/Dashboard'
import Placeholder from './pages/Placeholder'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="households" element={<Placeholder title="Households" />} />
        <Route path="find" element={<Placeholder title="Find Family" />} />
        <Route path="add" element={<Placeholder title="Add Household" />} />
        <Route path="reports" element={<Placeholder title="Reports & Analytics" />} />
        <Route path="exports" element={<Placeholder title="Exports & Print" />} />
        <Route path="documents" element={<Placeholder title="Documents" />} />
        <Route path="schemes" element={<Placeholder title="Government Schemes" />} />
        <Route path="idcards" element={<Placeholder title="ID Card Designer" />} />
        <Route path="masjid" element={<Placeholder title="Masjid Profile" />} />
        <Route path="users" element={<Placeholder title="Users" />} />
        <Route path="admin" element={<Placeholder title="Administration" />} />
        <Route path="audit" element={<Placeholder title="Audit Log" />} />
        <Route path="recycle" element={<Placeholder title="Recycle Bin" />} />
        <Route path="notifications" element={<Placeholder title="Notifications" />} />
        <Route path="profile" element={<Placeholder title="My Profile" />} />
        <Route path="settings" element={<Placeholder title="Settings" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
