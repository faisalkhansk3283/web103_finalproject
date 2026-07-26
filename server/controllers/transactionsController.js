import pool from '../db/index.js'

// Adds one month to a date string (YYYY-MM-DD) and returns a new date string
const addOneMonth = (dateStr) => {
  const date = new Date(dateStr)
  date.setMonth(date.getMonth() + 1)
  return date.toISOString().split('T')[0]
}

// Checks all recurring transactions and auto-creates a one-time historical
// entry for every month that has passed since next_due_date. The newly
// created entries are NOT recurring themselves (is_recurring: false) —
// only the original template transaction keeps repeating. This avoids
// each generated copy re-triggering its own chain of copies.
const generateDueRecurringTransactions = async () => {
  const today = new Date().toISOString().split('T')[0]

  const dueIdsResult = await pool.query(
    'SELECT id FROM transactions WHERE is_recurring = true AND next_due_date <= $1',
    [today]
  )

  for (const { id: templateId } of dueIdsResult.rows) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Lock this template row so concurrent requests can't process it at the same time
      const lockedResult = await client.query(
        'SELECT * FROM transactions WHERE id = $1 FOR UPDATE',
        [templateId]
      )
      const row = lockedResult.rows[0]

      // Another concurrent request may have already advanced this past today
      if (!row.is_recurring || row.next_due_date > today) {
        await client.query('COMMIT')
        continue
      }

      const categoryResult = await client.query(
        'SELECT category_id FROM transaction_categories WHERE transaction_id = $1',
        [templateId]
      )
      const categoryIds = categoryResult.rows.map((r) => r.category_id)

      let currentDueDate = row.next_due_date.toISOString
        ? row.next_due_date.toISOString().split('T')[0]
        : row.next_due_date

      while (currentDueDate <= today) {
        // Safety check: skip if a copy for this exact date already exists
        const existing = await client.query(
          'SELECT id FROM transactions WHERE recurring_source_id = $1 AND date = $2',
          [templateId, currentDueDate]
        )

        if (existing.rows.length === 0) {
          const newTransaction = await client.query(
            'INSERT INTO transactions (description, amount, date, type, is_recurring, next_due_date, recurring_source_id) VALUES ($1, $2, $3, $4, false, NULL, $5) RETURNING id',
            [row.description, row.amount, currentDueDate, row.type, templateId]
          )
          const newId = newTransaction.rows[0].id

          for (const categoryId of categoryIds) {
            await client.query(
              'INSERT INTO transaction_categories (transaction_id, category_id) VALUES ($1, $2)',
              [newId, categoryId]
            )
          }
        }

        currentDueDate = addOneMonth(currentDueDate)
      }

      await client.query(
        'UPDATE transactions SET next_due_date = $1 WHERE id = $2',
        [currentDueDate, templateId]
      )

      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      console.error('Error generating recurring transaction:', error)
    } finally {
      client.release()
    }
  }
}

export const getAllTransactions = async (req, res) => {
  try {
    await generateDueRecurringTransactions()

    const result = await pool.query(`
      SELECT 
        t.id,
        t.description,
        t.amount,
        t.date,
        t.type,
        t.is_recurring,
        t.next_due_date,
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
  const { description, amount, date, type, categoryIds, isRecurring } = req.body

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

  const transactionDate = date || new Date().toISOString().split('T')[0]
  const nextDueDate = isRecurring ? addOneMonth(transactionDate) : null

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const transactionResult = await client.query(
      'INSERT INTO transactions (description, amount, date, type, is_recurring, next_due_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [description.trim(), amount, transactionDate, type || 'expense', isRecurring || false, nextDueDate]
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
        t.type,
        t.is_recurring,
        t.next_due_date,
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
  const { description, amount, date, type, categoryIds, isRecurring } = req.body

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

  const nextDueDate = isRecurring ? addOneMonth(date) : null

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    await client.query(
      'UPDATE transactions SET description = $1, amount = $2, date = $3, type = $4, is_recurring = $5, next_due_date = $6 WHERE id = $7',
      [description.trim(), amount, date, type || 'expense', isRecurring || false, nextDueDate, id]
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
        t.type,
        t.is_recurring,
        t.next_due_date,
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