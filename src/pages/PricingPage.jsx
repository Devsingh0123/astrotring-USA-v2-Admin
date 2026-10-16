import { useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const INITIAL_MATRIX = [
  {
    code: 'silver_7',
    name: 'Silver Pack (7 Vaani Questions)',
    type: 'question_pack',
    USD: 7.99,
    INR: 499,
    GBP: 6.49,
    EUR: 7.49,
  },
  {
    code: 'gold_12',
    name: 'Gold Pack (12 Vaani Questions)',
    type: 'question_pack',
    USD: 12.99,
    INR: 899,
    GBP: 10.99,
    EUR: 11.99,
  },
  {
    code: 'diamond_20',
    name: 'Diamond Pack (20 Vaani Questions)',
    type: 'question_pack',
    USD: 19.99,
    INR: 1499,
    GBP: 15.99,
    EUR: 17.99,
  },
  {
    code: 'artha_sutram',
    name: 'Artha Sutram — 23-Section Wealth Blueprint',
    type: 'report',
    USD: 29.99,
    INR: 2499,
    GBP: 24.99,
    EUR: 27.99,
  },
  {
    code: 'career_destiny',
    name: 'Career & Professional Destiny Report',
    type: 'report',
    USD: 14.99,
    INR: 1199,
    GBP: 11.99,
    EUR: 13.99,
  },
]

export function PricingPage() {
  const [matrix, setMatrix] = useState(INITIAL_MATRIX)

  const handlePriceChange = (code, currency, value) => {
    setMatrix((prev) =>
      prev.map((row) =>
        row.code === code ? { ...row, [currency]: value } : row
      )
    )
  }

  const handleSaveMatrix = () => {
    toast.success('Multi-currency pricing matrix saved successfully.')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Multi-Currency Pricing Matrix
          </h2>
          <p className="text-sm text-muted-foreground">
            Configure regional price points across USD ($), INR (₹), GBP (£), and EUR (€).
          </p>
        </div>

        <Button size="sm" onClick={handleSaveMatrix} className="gap-1.5">
          <Save className="size-3.5" />
          Save Pricing Matrix
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Product / SKU</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">USD ($)</th>
                <th className="px-4 py-3 font-medium">INR (₹)</th>
                <th className="px-4 py-3 font-medium">GBP (£)</th>
                <th className="px-4 py-3 font-medium">EUR (€)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {matrix.map((item) => (
                <tr key={item.code} className="hover:bg-muted/30">
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-foreground">{item.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {item.code}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                      {item.type}
                    </span>
                  </td>
                  {['USD', 'INR', 'GBP', 'EUR'].map((curr) => (
                    <td key={curr} className="px-4 py-3.5">
                      <input
                        type="number"
                        step="0.01"
                        value={item[curr]}
                        onChange={(e) =>
                          handlePriceChange(item.code, curr, e.target.value)
                        }
                        className="h-8 w-24 rounded-lg border border-input bg-background px-2.5 font-mono text-xs text-foreground outline-none focus:border-ring"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
