import pool from '../db/index.js'

export const getAllCategories = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categories ORDER BY is_default DESC, name ASC'
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
}

export const createCategory = async (req, res) => {
  const { name } = req.body

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required' })
  }

  try {
    const result = await pool.query(
      'INSERT INTO categories (name, is_default) VALUES ($1, false) RETURNING *',
      [name.trim()]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error creating category:', error)
    res.status(500).json({ error: 'Failed to create category' })
  }
}

export const deleteCategory = async (req, res) => {
  const { id } = req.params

  try {
    const categoryCheck = await pool.query(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    )

    if (categoryCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' })
    }

    if (categoryCheck.rows[0].is_default) {
      return res.status(400).json({ error: 'Cannot delete default categories' })
    }

    await pool.query('DELETE FROM transaction_categories WHERE category_id = $1', [id])
    await pool.query('DELETE FROM categories WHERE id = $1', [id])

    res.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    res.status(500).json({ error: 'Failed to delete category' })
  }
}
