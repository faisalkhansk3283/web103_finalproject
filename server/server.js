import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import transactionRoutes from './routes/transactions.js'
import categoryRoutes from './routes/categories.js'
import { upload } from './middleware/upload.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/transactions', transactionRoutes)
app.use('/api/categories', categoryRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.post('/api/transactions/with-image', upload.single('file'), async (req, res) => {
  try {
    const { description, amount, date, type, categoryIds } = req.body

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null

    const parsedCategoryIds = JSON.parse(categoryIds || '[]')

    const pool = (await import('./db/index.js')).default

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const transactionResult = await client.query(
        'INSERT INTO transactions (description, amount, date, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
        [description, amount, date, imageUrl]
      )

      const transactionId = transactionResult.rows[0].id

      for (const categoryId of parsedCategoryIds) {
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
          t.image_url,
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
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error creating transaction with image:', error)
    res.status(500).json({ error: 'Failed to create transaction' })
  }
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
