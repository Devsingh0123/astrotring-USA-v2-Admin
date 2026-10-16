import { useState } from 'react'
import { CheckCircle2, Clock, XCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const INITIAL_ORDERS = [
  {
    id: 'ord_918204',
    gatewayOrderId: 'order_P9aK19xL01',
    userEmail: 'alex.mercer@example.com',
    productType: 'report',
    productCode: 'artha_sutram',
    currency: 'USD',
    amountFormatted: '$29.99',
    status: 'paid',
    createdAt: '2026-10-16 11:20 UTC',
  },
  {
    id: 'ord_918203',
    gatewayOrderId: 'order_P9aJ82mB12',
    userEmail: 'priya.sharma@example.in',
    productType: 'question_pack',
    productCode: 'diamond_20',
    currency: 'INR',
    amountFormatted: '₹1,499',
    status: 'paid',
    createdAt: '2026-10-16 10:55 UTC',
  },
  {
    id: 'ord_918202',
    gatewayOrderId: 'order_P9aF10zQ88',
    userEmail: 'oliver.grant@example.co.uk',
    productType: 'question_pack',
    productCode: 'gold_12',
    currency: 'GBP',
    amountFormatted: '£11.99',
    status: 'paid',
    createdAt: '2026-10-16 09:40 UTC',
  },
  {
    id: 'ord_918201',
    gatewayOrderId: 'order_P9aC04wR44',
    userEmail: 'elena.rossi@example.eu',
    productType: 'report',
    productCode: 'career_destiny',
    currency: 'EUR',
    amountFormatted: '€13.99',
    status: 'pending',
    createdAt: '2026-10-16 08:15 UTC',
  },
]

export function OrdersPage() {
  const [orders, setOrders] = useState(INITIAL_ORDERS)
  const [currencyFilter, setCurrencyFilter] = useState('ALL')

  const filtered = orders.filter(
    (o) => currencyFilter === 'ALL' || o.currency === currencyFilter
  )

  const markRefunded = (orderId) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'refunded' } : o))
    )
    toast.success(`Order ${orderId} marked as refunded in ledger.`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Orders & Razorpay Transactions
          </h2>
          <p className="text-sm text-muted-foreground">
            Multi-currency settlement ledger for Question Packs and Deep Reports.
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {['ALL', 'USD', 'INR', 'GBP', 'EUR'].map((curr) => (
            <Button
              key={curr}
              variant={currencyFilter === curr ? 'default' : 'outline'}
              size="xs"
              onClick={() => setCurrencyFilter(curr)}
            >
              {curr}
            </Button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Order ID / Gateway</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3.5">
                    <div className="font-mono text-xs font-medium text-foreground">
                      {o.id}
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {o.gatewayOrderId}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-xs text-foreground">{o.userEmail}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {o.createdAt}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-foreground">
                      {o.productCode}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-foreground">
                      {o.amountFormatted}
                    </span>
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      ({o.currency})
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize text-foreground">
                      {o.status === 'paid' && (
                        <CheckCircle2 className="size-3 text-primary" />
                      )}
                      {o.status === 'pending' && <Clock className="size-3" />}
                      {o.status === 'refunded' && (
                        <XCircle className="size-3 text-destructive" />
                      )}
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {o.status === 'paid' && (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => markRefunded(o.id)}
                        className="gap-1"
                      >
                        <RotateCcw className="size-3" />
                        Refund
                      </Button>
                    )}
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
