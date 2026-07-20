import { useState, useEffect, useRef } from 'react'

function TransactionModal({ isOpen, onClose, onSave, transaction, categories }) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    categoryIds: [],
  })
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [errors, setErrors] = useState({})
  const [categoryError, setCategoryError] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (transaction) {
      setFormData({
        description: transaction.description || '',
        amount: transaction.amount ? Math.abs(transaction.amount).toString() : '',
        date: transaction.date || new Date().toISOString().split('T')[0],
        type: transaction.amount < 0 ? 'expense' : 'income',
        categoryIds: transaction.categoryIds || [],
      })
      setImage(null)
      setImagePreview(transaction.image || '')
    } else {
      setFormData({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        categoryIds: [],
      })
      setImage(null)
      setImagePreview('')
    }
    setErrors({})
    setCategoryError('')
  }, [transaction, isOpen])

  const validateForm = () => {
    const newErrors = {}
    let isValid = true

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
      isValid = false
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required'
      isValid = false
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number'
      isValid = false
    }

    if (formData.categoryIds.length === 0) {
      setCategoryError('At least one category is required')
      isValid = false
    } else {
      setCategoryError('')
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const amount = parseFloat(formData.amount)
    const finalAmount = formData.type === 'expense' ? -amount : amount

    const submitData = {
      ...formData,
      amount: finalAmount,
      categoryIds: formData.categoryIds,
      image: imagePreview,
    }

    if (image) {
      setIsUploading(true)
      try {
        const formDataToSend = new FormData()
        formDataToSend.append('file', image)
        formDataToSend.append('description', formData.description)
        formDataToSend.append('amount', finalAmount)
        formDataToSend.append('date', formData.date)
        formDataToSend.append('type', formData.type)
        formDataToSend.append('categoryIds', JSON.stringify(formData.categoryIds))

        const response = await fetch('/api/transactions/with-image', {
          method: 'POST',
          body: formDataToSend,
        })

        if (response.ok) {
          setIsUploading(false)
          onSave()
        } else {
          setIsUploading(false)
          console.error('Upload failed')
        }
      } catch (error) {
        setIsUploading(false)
        console.error('Error uploading image:', error)
      }
    } else {
      onSave(submitData)
    }
  }

  const handleCategoryChange = (categoryId) => {
    setFormData((prev) => {
      const categoryIds = prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...prev.categoryIds, categoryId]
      return { ...prev, categoryIds }
    })
    setCategoryError('')
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = () => {
    fileInputRef.current?.click()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-with-image" onClick={(e) => e.stopPropagation()}>
        <h2>{transaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Grocery shopping"
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label>Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
            />
            {errors.amount && <span className="error-message">{errors.amount}</span>}
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Categories</label>
            <div className="checkbox-group">
              {categories.map((category) => (
                <div key={category.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`category-${category.id}`}
                    checked={formData.categoryIds.includes(category.id)}
                    onChange={() => handleCategoryChange(category.id)}
                  />
                  <label htmlFor={`category-${category.id}`}>{category.name}</label>
                </div>
              ))}
            </div>
            {categoryError && <span className="error-message">{categoryError}</span>}
          </div>

          <div className="form-group">
            <label>Receipt Image (Optional)</label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            {imagePreview ? (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Receipt preview" className="image-preview" />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={removeImage}
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <div
                className="image-upload-area"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <div className="upload-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <p>Drag & drop an image here</p>
                <p className="upload-or">or</p>
                <div className="upload-buttons">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCameraCapture}
                  >
                    Take Photo
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload Image
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isUploading}>
              {isUploading ? 'Saving...' : (transaction ? 'Save Changes' : 'Add Transaction')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TransactionModal
