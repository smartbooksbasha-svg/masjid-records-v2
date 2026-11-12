import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import Dashboard from './pages/Dashboard'
import Households from './pages/Households'
import HouseholdDetail from './pages/HouseholdDetail'
import HouseholdForm from './pages/HouseholdForm'
import FindFamily from './pages/FindFamily'
import Reports from './pages/Reports'
import Exports from './pages/Exports'
import Documents from './pages/Documents'
import Schemes from './pages/Schemes'
import IdCards from './pages/IdCards'
import MasjidProfile from './pages/MasjidProfile'
import Users from './pages/Users'
import Administration from './pages/Administration'
import Audit from './pages/Audit'
import Recycle from './pages/Recycle'
import Notifications from './pages/Notifications'
import MyProfile from './pages/MyProfile'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="households" element={<Households />} />
        <Route path="households/:id" element={<HouseholdDetail />} />
        <Route path="add" element={<HouseholdForm />} />
        <Route path="edit/:id" element={<HouseholdForm />} />
        <Route path="find" element={<FindFamily />} />
        <Route path="reports" element={<Reports />} />
        <Route path="exports" element={<Exports />} />
        <Route path="documents" element={<Documents />} />
        <Route path="schemes" element={<Schemes />} />
        <Route path="idcards" element={<IdCards />} />
        <Route path="masjid" element={<MasjidProfile />} />
        <Route path="users" element={<Users />} />
        <Route path="admin" element={<Administration />} />
        <Route path="audit" element={<Audit />} />
        <Route path="recycle" element={<Recycle />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<MyProfile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
