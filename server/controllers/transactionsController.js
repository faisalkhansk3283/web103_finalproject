import pool from '../db/index.js'

export const getAllTransactions = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id,
        t.description,
        t.amount,
        t.date,
        t.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', c.id,
              'name', c.name,
              'is_default', c.is_default
            )
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) as categories
      FROM transactions t
      LEFT JOIN transaction_categories tc ON t.id = tc.transaction_id
      LEFT JOIN categories c ON tc.category_id = c.id
      GROUP BY t.id
      ORDER BY t.date DESC
    `)
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    res.status(500).json({ error: 'Failed to fetch transactions' })
  }
}

export const createTransaction = async (req, res) => {
  const { description, amount, date, categoryIds } = req.body

  if (!description || !description.trim()) {
    return res.status(400).json({ error: 'Description is required' })
  }

  if (amount === undefined || amount === null) {
    return res.status(400).json({ error: 'Amount is required' })
  }

  if (parseFloat(amount) <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' })
  }

  if (!categoryIds || categoryIds.length === 0) {
    return res.status(400).json({ error: 'At least one category is required' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const transactionResult = await client.query(
      'INSERT INTO transactions (description, amount, date) VALUES ($1, $2, $3) RETURNING *',
      [description.trim(), amount, date || new Date()]
    )

    const transactionId = transactionResult.rows[0].id

    for (const categoryId of categoryIds) {
      await client.query(
        'INSERT INTO transaction_categories (transaction_id, category_id) VALUES ($1, $2)',
        [transactionId, categoryId]
      )
    }

    await client.query('COMMIT')

    const fullTransaction = await pool.query(
      `SELECT 
        t.id,
        t.description,
        t.amount,
        t.date,
        t.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', c.id,
              'name', c.name,
              'is_default', c.is_default
            )
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) as categories
      FROM transactions t
      LEFT JOIN transaction_categories tc ON t.id = tc.transaction_id
      LEFT JOIN categories c ON tc.category_id = c.id
      WHERE t.id = $1
      GROUP BY t.id`,
      [transactionId]
    )

    res.status(201).json(fullTransaction.rows[0])
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error creating transaction:', error)
    res.status(500).json({ error: 'Failed to create transaction' })
  } finally {
    client.release()
  }
}

export const updateTransaction = async (req, res) => {
  const { id } = req.params
  const { description, amount, date, categoryIds } = req.body

  if (!description || !description.trim()) {
    return res.status(400).json({ error: 'Description is required' })
  }

  if (amount === undefined || amount === null) {
    return res.status(400).json({ error: 'Amount is required' })
  }

  if (parseFloat(amount) <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' })
  }

  if (!categoryIds || categoryIds.length === 0) {
    return res.status(400).json({ error: 'At least one category is required' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    await client.query(
      'UPDATE transactions SET description = $1, amount = $2, date = $3 WHERE id = $4',
      [description.trim(), amount, date, id]
    )

    await client.query('DELETE FROM transaction_categories WHERE transaction_id = $1', [id])

    for (const categoryId of categoryIds) {
      await client.query(
        'INSERT INTO transaction_categories (transaction_id, category_id) VALUES ($1, $2)',
        [id, categoryId]
      )
    }

    await client.query('COMMIT')

    const fullTransaction = await pool.query(
      `SELECT 
        t.id,
        t.description,
        t.amount,
        t.date,
        t.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', c.id,
              'name', c.name,
              'is_default', c.is_default
            )
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) as categories
      FROM transactions t
      LEFT JOIN transaction_categories tc ON t.id = tc.transaction_id
      LEFT JOIN categories c ON tc.category_id = c.id
      WHERE t.id = $1
      GROUP BY t.id`,
      [id]
    )

    res.json(fullTransaction.rows[0])
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error updating transaction:', error)
    res.status(500).json({ error: 'Failed to update transaction' })
  } finally {
    client.release()
  }
}

export const deleteTransaction = async (req, res) => {
  const { id } = req.params

  try {
    await pool.query('DELETE FROM transaction_categories WHERE transaction_id = $1', [id])
    await pool.query('DELETE FROM transactions WHERE id = $1', [id])
    res.json({ message: 'Transaction deleted successfully' })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    res.status(500).json({ error: 'Failed to delete transaction' })
  }
}
