import { useState, useEffect } from 'react'

const API_BASE = '/api'

function Categories() {
  const [categories, setCategories] = useState([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`)
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    setError('')

    if (!newCategoryName.trim()) {
      setError('Category name is required')
      return
    }

    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      })

      if (res.ok) {
        setNewCategoryName('')
        fetchCategories()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to add category')
      }
    } catch (error) {
      console.error('Error adding category:', error)
      setError('Failed to add category')
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      await fetch(`${API_BASE}/categories/${id}`, { method: 'DELETE' })
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const defaultCategories = categories.filter((c) => c.is_default)
  const customCategories = categories.filter((c) => !c.is_default)

  return (
    <div className="categories-page">
      <header className="page-header">
        <h2>Categories</h2>
      </header>

      <section className="categories-section">
        <h3>Default Categories</h3>
        <div className="category-list">
          {defaultCategories.length === 0 ? (
            <p className="empty-state">No default categories</p>
          ) : (
            defaultCategories.map((category) => (
              <div key={category.id} className="category-item">
                <span className="name">{category.name}</span>
                <span className="badge">Default</span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="categories-section" style={{ marginTop: '2rem' }}>
        <h3>Custom Categories</h3>
        <div className="category-list">
          {customCategories.length === 0 ? (
            <p className="empty-state">No custom categories yet</p>
          ) : (
            customCategories.map((category) => (
              <div key={category.id} className="category-item">
                <span className="name">{category.name}</span>
                <button
                  className="btn btn-danger"
                  style={{ padding: '0.5rem' }}
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>

        <form className="add-category-form" onSubmit={handleAddCategory}>
          <input
            type="text"
            placeholder="New category name"
            value={newCategoryName}
            onChange={(e) => {
              setNewCategoryName(e.target.value)
              setError('')
            }}
          />
          <button type="submit" className="btn btn-success">
            Add Category
          </button>
        </form>
        {error && <span className="error-message" style={{ marginTop: '0.5rem' }}>{error}</span>}
      </section>
    </div>
  )
}

export default Categories
