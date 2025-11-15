import { useMemo, useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { paymentService, Payment } from '../../services/paymentService'
import { allocationService, type Allocation } from '../../services/allocationService'
import { sellerService, type Seller } from '../../services/sellerService'
import { spaceService, type Space } from '../../services/spaceService'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import { Plus, Download, DollarSign, Search } from 'lucide-react'
import { format, subMonths } from 'date-fns'

const Payments = () => {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState(format(subMonths(new Date(), 1), 'yyyy-MM-dd'))
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [formData, setFormData] = useState<Partial<Payment>>({
    allocation_id: 0,
    seller_id: 0,
    amount: 0,
    payment_method: 'mobile_money',
    payment_date: format(new Date(), 'yyyy-MM-dd'),
    status: 'completed',
  })

  // Get zones managed by logged-in user
  const managedZoneIds =
    user?.user_type === 'manager' && user?.profile?.assigned_zones
      ? user.profile.assigned_zones
      : []

  /** ───────────────────────────────
   *  FETCH DATA
   *  ─────────────────────────────── */
  const { data: allocationsData } = useQuery(
    ['allocations', managedZoneIds],
    () => allocationService.getAll(),
    { enabled: true, retry: false }
  )

  const { data: spacesData } = useQuery(
    ['spaces', managedZoneIds],
    () => spaceService.getAll(),
    { enabled: true, retry: false }
  )

  const { data: sellersData } = useQuery(
    ['sellers'],
    () => sellerService.getAll(),
    { retry: false }
  )

  const { data: paymentsData, isLoading } = useQuery(
    ['payments', statusFilter, methodFilter, dateFrom, dateTo],
    () =>
      paymentService.getAll({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        payment_method: methodFilter !== 'all' ? methodFilter : undefined,
        date_from: dateFrom,
        date_to: dateTo,
      }),
    { retry: false }
  )

  const { data: revenueData } = useQuery(
    ['revenue-total', dateFrom, dateTo],
    () => paymentService.getTotalRevenue({ date_from: dateFrom, date_to: dateTo }),
    { retry: false }
  )

  const { data: revenueByMethod } = useQuery(
    ['revenue-by-method', dateFrom, dateTo],
    () => paymentService.getRevenueByMethod({ date_from: dateFrom, date_to: dateTo }),
    { retry: false }
  )

  /** ───────────────────────────────
   *  DATA PREPARATION
   *  ─────────────────────────────── */
  const allPayments: Payment[] = paymentsData?.data || []
  const allAllocations: Allocation[] = allocationsData?.data || []
  const allSpaces: Space[] = spacesData?.data || []
  const sellers: Seller[] = sellersData?.data?.sellers || sellersData?.data || []

  // Filter data for managers only
  const managedSpaces = managedZoneIds.length
    ? allSpaces.filter((s: Space) => managedZoneIds.includes(s.zone_id))
    : allSpaces
  const managedSpaceIds = managedSpaces.map((s: Space) => s.space_id!)

  const managedAllocations = managedZoneIds.length
    ? allAllocations.filter((a: Allocation) => managedSpaceIds.includes(a.space_id))
    : allAllocations
  const managedAllocationIds = managedAllocations.map((a: Allocation) => a.allocation_id!)

  const payments = managedZoneIds.length
    ? allPayments.filter((p) => managedAllocationIds.includes(p.allocation_id))
    : allPayments

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 350)
    return () => clearTimeout(t)
  }, [searchTerm])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, methodFilter, dateFrom, dateTo, debouncedSearch])

  const getSellerName = (p: Payment) => {
    const s = sellers.find((x: Seller) => x.seller_id === p.seller_id || x.user_id === p.seller_id)
    return s?.full_name || s?.business_name || `${p.seller_id}`
  }

  const filteredPayments = useMemo(() => {
    if (!debouncedSearch) return payments
    const q = debouncedSearch.toLowerCase()
    return payments.filter((p) => {
      const sellerName = getSellerName(p).toLowerCase()
      const ref = (p.payment_reference || '').toLowerCase()
      const tx = (p.transaction_id || '').toLowerCase()
      const method = (p.payment_method || '').toString().toLowerCase()
      const idStr = String(p.payment_id || '').toLowerCase()
      return (
        sellerName.includes(q) ||
        ref.includes(q) ||
        tx.includes(q) ||
        method.includes(q) ||
        idStr.includes(q)
      )
    })
  }, [payments, debouncedSearch])

  const totalItems = filteredPayments.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pagedPayments = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredPayments.slice(start, start + pageSize)
  }, [filteredPayments, currentPage, pageSize])

  const totalRevenue = revenueData?.data?.total_revenue || 0

  /** ───────────────────────────────
   *  MUTATIONS
   *  ─────────────────────────────── */
  const createMutation = useMutation(
    (payment: Payment) => {
      // Restrict manager creation
      if (user?.user_type === 'manager' && managedZoneIds.length) {
        if (!managedAllocationIds.includes(payment.allocation_id)) {
          toast.error('You can only record payments for your managed zones.')
          throw new Error('Unauthorized')
        }
      }
      return paymentService.create(payment)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('payments')
        toast.success('Payment recorded successfully')
        setIsModalOpen(false)
        resetForm()
      },
      onError: (err: any) => {
        if (err.message !== 'Unauthorized') {
          toast.error(err.response?.data?.message || 'Failed to record payment')
        }
      },
    }
  )

  const updateStatusMutation = useMutation(
    ({ id, status }: { id: number; status: string }) => paymentService.updateStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('payments')
        toast.success('Payment status updated successfully')
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Failed to update payment status')
      },
    }
  )

  /** ───────────────────────────────
   *  HELPERS
   *  ─────────────────────────────── */
  const resetForm = () => {
    setFormData({
      allocation_id: 0,
      seller_id: 0,
      amount: 0,
      payment_method: 'mobile_money',
      payment_date: format(new Date(), 'yyyy-MM-dd'),
      status: 'completed',
      mobile_money_number: '',
      mobile_money_provider: '',
      payment_reference: '',
      transaction_id: '',
      notes: '',
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData as Payment)
  }

  const isFormValid = useMemo(() => {
    const hasSeller = !!formData.seller_id && Number(formData.seller_id) > 0
    const hasAllocation = !!formData.allocation_id && Number(formData.allocation_id) > 0
    const hasAmount = !!formData.amount && Number(formData.amount) > 0
    const hasMethod = !!formData.payment_method
    const hasDate = !!formData.payment_date
    const mobileOk = formData.payment_method !== 'mobile_money' || (formData.mobile_money_number && String(formData.mobile_money_number).length >= 8)
    return hasSeller && hasAllocation && hasAmount && hasMethod && hasDate && mobileOk
  }, [formData])

  /** ───────────────────────────────
   *  RENDER
   *  ─────────────────────────────── */
  if (isLoading) return <div className="text-center py-12">Loading payments...</div>

  return (
    <div>
      {/* ─────────── HEADER ─────────── */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
        <button
          onClick={() => {
            setIsModalOpen(true)
            resetForm()
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Plus size={20} />
          <span>Record Payment</span>
        </button>
      </div>

      {/* ─────────── STATS ─────────── */}
      {totalRevenue > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-lg font-semibold">
  {Number(totalRevenue || 0).toFixed(2)}
</p>

                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(dateFrom), 'MMM dd')} - {format(new Date(dateTo), 'MMM dd, yyyy')}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {revenueByMethod?.data?.length > 0 && (
            <div className="bg-white rounded-xl shadow p-4 col-span-2">
              <p className="text-sm font-medium text-gray-600 mb-3">Revenue by Payment Method</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {revenueByMethod.data.map((method: any) => (
                  <div key={method.payment_method} className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 capitalize">{method.payment_method?.replace('_', ' ')}</p>
                    <p className="text-lg font-bold">${(method.total || 0).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-auto">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-auto">
          <option value="all">All Methods</option>
          <option value="mobile_money">Mobile Money</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
        </select>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search seller, reference, transaction, method"
            className="pl-9 w-full px-3 py-2 rounded-lg border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="ml-auto">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(parseInt(e.target.value))
              setPage(1)
            }}
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-auto"
            title="Items per page"
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>

      {/* ─────────── TABLE ─────────── */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4">ID</th>
              <th className="text-left py-3 px-4">Seller</th>
              <th className="text-left py-3 px-4">Amount</th>
              <th className="text-left py-3 px-4">Method</th>
              <th className="text-left py-3 px-4">Date</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagedPayments.map((p: Payment) => {
              const seller = sellers.find(
                (s: Seller) => s.seller_id === p.seller_id || s.user_id === p.seller_id
              )
              return (
                <tr key={p.payment_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">#{p.payment_id}</td>
                  <td className="py-3 px-4">{seller?.full_name || seller?.business_name || p.seller_id}</td>
                  <td className="py-3 px-4 font-medium">${p.amount}</td>
                  <td className="py-3 px-4 capitalize">{p.payment_method?.replace('_', ' ')}</td>
                  <td className="py-3 px-4">{format(new Date(p.payment_date), 'MMM dd, yyyy')}</td>
                  <td className="py-3 px-4">
                    <select
                      value={p.status}
                      onChange={(e) => {
                        if (confirm(`Change payment status to ${e.target.value}?`)) {
                          updateStatusMutation.mutate({ id: p.payment_id!, status: e.target.value })
                        }
                      }}
                      className={`px-2 py-1 rounded text-xs font-medium border-0 ${
                        p.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : p.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : p.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    {p.status === 'completed' && (
                      <button
                        onClick={() => {
                          paymentService
                            .generateReceipt(p.payment_id!)
                            .then((blob) => {
                              const url = window.URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = `receipt-${p.payment_id}.pdf`
                              a.click()
                            })
                            .catch(() => toast.error('Receipt generation not available'))
                        }}
                        className="text-primary-600 hover:text-primary-700"
                        title="Download Receipt"
                      >
                        <Download size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {totalItems === 0 && (
          <div className="px-4 py-6 text-center text-sm text-gray-600">No payments found for the selected filters.</div>
        )}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 px-4 py-3">
          <p className="text-sm text-gray-600">
            Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)}-
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
          </p>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const n = i + 1
                const active = n === currentPage
                return (
                  <button
                    key={n}
                    className={`${active ? 'px-3 py-1 rounded-lg bg-blue-600 text-white' : 'px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                )
              })}
            </div>
            <button
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ─────────── MODAL ─────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Record Payment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Seller *</label>
                  <select
                    value={formData.seller_id || 0}
                    onChange={(e) => setFormData({ ...formData, seller_id: parseInt(e.target.value) })}
                    className="input"
                    required
                  >
                    <option value={0}>Select Seller</option>
                    {sellers.map((s: Seller) => (
                      <option key={s.seller_id} value={s.seller_id}>
                        {s.full_name || s.business_name || `Seller ${s.seller_id}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Allocation *</label>
                  <select
                    value={formData.allocation_id || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, allocation_id: parseInt(e.target.value) })
                    }
                    className="input"
                    required
                  >
                    <option value={0}>Select Allocation</option>
                    {managedAllocations
                      .filter((a: Allocation) => a.seller_id === formData.seller_id || !formData.seller_id)
                      .map((a: Allocation) => (
                        <option key={a.allocation_id} value={a.allocation_id}>
                          Allocation #{a.allocation_id} - Space {a.space_id}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="label">Amount ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                    }
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Payment Method *</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_method: e.target.value as Payment['payment_method'] })
                    }
                    className="input"
                    required
                  >
                    <option value="mobile_money">Mobile Money</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                  </select>
                </div>
                {formData.payment_method === 'mobile_money' && (
                  <>
                    <div>
                      <label className="label">Mobile Money Number *</label>
                      <input
                        type="tel"
                        value={formData.mobile_money_number || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, mobile_money_number: e.target.value })
                        }
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Provider</label>
                      <select
                        value={formData.mobile_money_provider || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, mobile_money_provider: e.target.value })
                        }
                        className="input"
                      >
                        <option value="">Select Provider</option>
                        <option value="mtn">MTN</option>
                        <option value="airtel">Airtel</option>
                        <option value="orange">Orange</option>
                      </select>
                    </div>
                  </>
                )}
                <div>
                  <label className="label">Payment Date *</label>
                  <input
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_date: e.target.value })
                    }
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Reference</label>
                  <input
                    type="text"
                    value={formData.payment_reference || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_reference: e.target.value })
                    }
                    className="input"
                    placeholder="Transaction reference"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Notes</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input"
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isLoading || !isFormValid}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {createMutation.isLoading ? 'Saving...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Payments
