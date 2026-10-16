import { useState } from 'react'
import { Search, PlusCircle, MinusCircle, Compass, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const INITIAL_USERS = [
  {
    id: 'e301d019-1d42-4f05-8bb2-53ec6e2d1eb9',
    fullName: 'Alex Mercer',
    email: 'alex.mercer@example.com',
    tier: 'diamond',
    creditBalance: 18,
    ascendant: 'Aries',
    moonSign: 'Virgo',
    nakshatra: 'Hasta (Pada 3)',
    onboardingCompleted: true,
    isActive: true,
  },
  {
    id: '9a82f411-7c33-4a91-b102-11209a8c3d01',
    fullName: 'Priya Sharma',
    email: 'priya.sharma@example.in',
    tier: 'gold',
    creditBalance: 9,
    ascendant: 'Taurus',
    moonSign: 'Cancer',
    nakshatra: 'Pushya (Pada 2)',
    onboardingCompleted: true,
    isActive: true,
  },
  {
    id: '4c19b772-3e10-4d00-9f12-88a7c12e0019',
    fullName: 'Oliver Grant',
    email: 'oliver.grant@example.co.uk',
    tier: 'silver',
    creditBalance: 4,
    ascendant: 'Leo',
    moonSign: 'Scorpio',
    nakshatra: 'Anuradha (Pada 1)',
    onboardingCompleted: true,
    isActive: true,
  },
  {
    id: '1d08e334-5b91-4c22-8e11-44b9a81f0092',
    fullName: 'Unbound Visitor',
    email: 'new.visitor@example.com',
    tier: 'free',
    creditBalance: 1,
    ascendant: '—',
    moonSign: '—',
    nakshatra: 'Not Bound',
    onboardingCompleted: false,
    isActive: true,
  },
]

export function UsersPage() {
  const [users, setUsers] = useState(INITIAL_USERS)
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('all')

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchesTier = tierFilter === 'all' || u.tier === tierFilter
    return matchesSearch && matchesTier
  })

  const adjustCredits = (userId, delta) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u
        const nextCredits = Math.max(0, u.creditBalance + delta)
        toast.success(
          `Updated ${u.fullName}'s Vaani credits to ${nextCredits} (${delta > 0 ? `+${delta}` : delta})`
        )
        return { ...u, creditBalance: nextCredits }
      })
    )
  }

  const toggleUserStatus = (userId) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u
        const nextStatus = !u.isActive
        toast.info(
          `${u.fullName} account ${nextStatus ? 'reactivated' : 'suspended'}`
        )
        return { ...u, isActive: nextStatus }
      })
    )
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Users, Bound Charts & Question Credits
          </h2>
          <p className="text-sm text-muted-foreground">
            Inspect Vedic birth charts, manage question pack balances, and moderate user accounts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email..."
              className="h-8 w-56 rounded-lg border border-input bg-card pr-3 pl-9 text-xs text-foreground outline-none focus:border-ring"
            />
          </div>

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="h-8 rounded-lg border border-input bg-card px-2.5 text-xs text-foreground outline-none focus:border-ring"
          >
            <option value="all">All Tiers</option>
            <option value="free">Free Tier</option>
            <option value="silver">Silver (7 Pack)</option>
            <option value="gold">Gold (12 Pack)</option>
            <option value="diamond">Diamond (20 Pack)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Tier</th>
                <th className="px-4 py-3 font-medium">Bound Vedic Chart</th>
                <th className="px-4 py-3 font-medium">Vaani Credits</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-foreground">{u.fullName}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium capitalize text-foreground">
                      {u.tier}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {u.onboardingCompleted ? (
                      <div className="flex items-center gap-1.5 text-xs text-foreground">
                        <Compass className="size-3.5 text-primary" />
                        <span>
                          Lagna: <strong>{u.ascendant}</strong> • Moon:{' '}
                          <strong>{u.moonSign}</strong> ({u.nakshatra})
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Onboarding Incomplete
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-foreground">
                        {u.creditBalance}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon-xs"
                          onClick={() => adjustCredits(u.id, -1)}
                          title="Deduct 1 credit"
                        >
                          <MinusCircle className="size-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon-xs"
                          onClick={() => adjustCredits(u.id, 5)}
                          title="Grant 5 credits"
                        >
                          <PlusCircle className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.isActive
                          ? 'bg-primary/10 text-primary'
                          : 'bg-destructive/15 text-destructive'
                      }`}
                    >
                      {u.isActive ? (
                        <>
                          <CheckCircle2 className="size-3" /> Active
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="size-3" /> Suspended
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Button
                      variant={u.isActive ? 'outline' : 'default'}
                      size="xs"
                      onClick={() => toggleUserStatus(u.id)}
                    >
                      {u.isActive ? 'Suspend' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
