import { useState, useEffect, useMemo } from 'react'
import TransactionModal from '../components/TransactionModal'

const API_BASE = '/api'

function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [viewingImage, setViewingImage] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [transactionsRes, categoriesRes] = await Promise.all([
        fetch(`${API_BASE}/transactions`),
        fetch(`${API_BASE}/categories`),
      ])
      const transactionsData = await transactionsRes.json()
      const categoriesData = await categoriesRes.json()
      setTransactions(transactionsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error fetching data:', error)
      setTransactions([])
      setCategories([])
    }
  }

  const availableMonths = useMemo(() => {
    const months = [...new Set(
      transactions.map((t) => {
        const date = new Date(t.date)
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      })
    )].sort().reverse()
    return months
  }, [transactions])

  const handleAddTransaction = () => {
    setEditingTransaction(null)
    setIsModalOpen(true)
  }

  const handleEditTransaction = (transaction) => {
    const transactionWithCategories = {
      ...transaction,
      categoryIds: transaction.categories?.map((c) => c.id) || [],
    }
    setEditingTransaction(transactionWithCategories)
    setIsModalOpen(true)
  }

  const handleSaveTransaction = async (transactionData) => {
    try {
      const url = editingTransaction
        ? `${API_BASE}/transactions/${editingTransaction.id}`
        : `${API_BASE}/transactions`
      const method = editingTransaction ? 'PUT' : 'POST'

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
      })

      setIsModalOpen(false)
      fetchData()
    } catch (error) {
      console.error('Error saving transaction:', error)
    }
  }

  const handleDeleteTransaction = async (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return

    try {
      await fetch(`${API_BASE}/transactions/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Error deleting transaction:', error)
    }
  }

  const handleClearFilters = () => {
    setSelectedMonth('')
    setDateRange({ start: '', end: '' })
    setFilterCategory('all')
    setSortBy('newest')
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getMonthLabel = (monthValue) => {
    if (!monthValue) return 'All Time'
    const [year, month] = monthValue.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const transactionDate = new Date(t.date)

        if (selectedMonth) {
          const [year, month] = selectedMonth.split('-')
          if (transactionDate.getFullYear() !== parseInt(year) ||
              transactionDate.getMonth() + 1 !== parseInt(month)) {
            return false
          }
        }

        if (dateRange.start && new Date(dateRange.start) > transactionDate) {
          return false
        }
        if (dateRange.end && new Date(dateRange.end) < transactionDate) {
          return false
        }

        if (filterCategory !== 'all') {
          return t.categories?.some((c) => c.id === parseInt(filterCategory))
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.date) - new Date(a.date)
        } else if (sortBy === 'oldest') {
          return new Date(a.date) - new Date(b.date)
        } else if (sortBy === 'highest') {
          return Math.abs(b.amount) - Math.abs(a.amount)
        } else if (sortBy === 'lowest') {
          return Math.abs(a.amount) - Math.abs(b.amount)
        }
        return 0
      })
  }, [transactions, selectedMonth, dateRange, filterCategory, sortBy])

  const hasActiveFilters = selectedMonth || dateRange.start || dateRange.end || filterCategory !== 'all'

  return (
    <div className="transactions-page">
      <header className="page-header">
        <div className="page-header-row">
          <h2>Transactions</h2>
          <button className="btn btn-primary" onClick={handleAddTransaction}>
            + Add Transaction
          </button>
        </div>
      </header>

      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group">
            <label>Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">All Time</option>
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {getMonthLabel(month)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>From</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
          </div>

          <div className="filter-group">
            <label>To</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort by</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button className="btn btn-secondary" onClick={handleClearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <section className="transactions-section">
        <div className="section-header">
          <h3>
            All Transactions ({filteredTransactions.length})
            {hasActiveFilters && (
              <span className="filter-indicator"> (Filtered)</span>
            )}
          </h3>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <p>No transactions found</p>
            {hasActiveFilters ? (
              <button className="btn btn-secondary" onClick={handleClearFilters}>
                Clear Filters
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleAddTransaction}>
                Add your first transaction
              </button>
            )}
          </div>
        ) : (
          <div className="transaction-list">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-main">
                  <div className="transaction-info">
                    <div className="description">{transaction.description}</div>
                    <div className="category">
                      {transaction.categories?.map((c) => c.name).join(', ') || 'No category'}
                    </div>
                  </div>
                  {transaction.image_url && (
                    <button
                      className="transaction-image-indicator"
                      onClick={() => setViewingImage(transaction.image_url)}
                      title="Click to view receipt"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="category">{formatDate(transaction.date)}</div>
                <div
                  className={`amount ${transaction.amount >= 0 ? 'income' : 'expense'}`}
                >
                  {formatCurrency(transaction.amount)}
                </div>
                <div className="actions">
                  <button onClick={() => handleEditTransaction(transaction)}>Edit</button>
                  <button onClick={() => handleDeleteTransaction(transaction.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        transaction={editingTransaction}
        categories={categories}
      />

      {viewingImage && (
        <div className="modal-overlay" onClick={() => setViewingImage(null)}>
          <div className="image-viewer-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-image-btn" onClick={() => setViewingImage(null)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <img src={viewingImage} alt="Receipt" className="full-image" />
          </div>
        </div>
      )}
    </div>
  )
}

export default Transactions
