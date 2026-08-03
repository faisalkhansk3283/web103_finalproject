import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

import transactionRoutes from './routes/transactions.js'
import categoryRoutes from './routes/categories.js'
import { upload } from './middleware/upload.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// API routes
app.use('/api/transactions', transactionRoutes)
app.use('/api/categories', categoryRoutes)

// Health-check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  })
})

// Create a transaction with an uploaded image
app.post(
  '/api/transactions/with-image',
  upload.single('file'),
  async (req, res) => {
    try {
      const {
        description,
        amount,
        date,
        categoryIds
      } = req.body

      const imageUrl = req.file
        ? `/uploads/${req.file.filename}`
        : null

      let parsedCategoryIds = []

      try {
        parsedCategoryIds = JSON.parse(categoryIds || '[]')
      } catch {
        return res.status(400).json({
          error: 'categoryIds must be a valid JSON array'
        })
      }

      const pool = (await import('./db/index.js')).default
      const client = await pool.connect()

      try {
        await client.query('BEGIN')

        const transactionResult = await client.query(
          `INSERT INTO transactions (
            description,
            amount,
            date,
            image_url
          )
          VALUES ($1, $2, $3, $4)
          RETURNING *`,
          [
            description,
            amount,
            date,
            imageUrl
          ]
        )

        const transactionId = transactionResult.rows[0].id

        for (const categoryId of parsedCategoryIds) {
          await client.query(
            `INSERT INTO transaction_categories (
              transaction_id,
              category_id
            )
            VALUES ($1, $2)`,
            [
              transactionId,
              categoryId
            ]
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
              ) FILTER (
                WHERE c.id IS NOT NULL
              ),
              '[]'
            ) AS categories
          FROM transactions t
          LEFT JOIN transaction_categories tc
            ON t.id = tc.transaction_id
          LEFT JOIN categories c
            ON tc.category_id = c.id
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
      console.error(
        'Error creating transaction with image:',
        error
      )

      res.status(500).json({
        error: 'Failed to create transaction'
      })
    }
  }
)

// Serve the built React frontend
const publicPath = path.join(__dirname, 'public')

app.use(express.static(publicPath))

// Allow React Router routes to load directly
app.get('*', (req, res, next) => {
  if (
    req.path.startsWith('/api/') ||
    req.path.startsWith('/uploads/')
  ) {
    return next()
  }

  res.sendFile(
    path.join(publicPath, 'index.html'),
    error => {
      if (error) {
        next(error)
      }
    }
  )
})

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack || err)

  if (res.headersSent) {
    return next(err)
  }

  res.status(500).json({
    error: 'Something went wrong!'
  })
})

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})