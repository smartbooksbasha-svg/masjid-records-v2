import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useCurrentUser } from '../lib/auth'
import { Card, PageHeader, Btn } from './ui'

export function RequireOwner({ children }: { children: ReactNode }) {
  const user = useCurrentUser()
  if (user?.role === 'owner') return <>{children}</>
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader title="Owner only" sub="Yeh screen sirf owner ke liye hai." />
      <Card className="px-6 py-14 text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-azure-50 text-azure-600">
          <ShieldAlert size={22} />
        </div>
        <h3 className="font-display text-lg font-bold">Access restricted</h3>
        <p className="mx-auto mt-1.5 max-w-sm text-[12.5px] text-ink-mute">
          Data entry ke liye aap households add/edit kar sakte hain. Administration, exports aur
          settings sirf owner ke paas hain.
        </p>
        <Link to="/" className="mt-5 inline-block"><Btn variant="ghost">Back to Dashboard</Btn></Link>
      </Card>
    </div>
  )
}
