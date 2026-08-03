-- WalletWatch Database Schema
-- Run this in Render PostgreSQL Shell to initialize the database

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  is_default BOOLEAN DEFAULT false
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  type VARCHAR(20) DEFAULT 'expense',
  is_recurring BOOLEAN DEFAULT false,
  next_due_date DATE,
  recurring_source_id INTEGER REFERENCES transactions(id),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create transaction_categories junction table
CREATE TABLE IF NOT EXISTS transaction_categories (
  transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (transaction_id, category_id)
);

-- Insert default categories (only if table is empty)
INSERT INTO categories (name, is_default)
SELECT 'Food', true WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Food');

INSERT INTO categories (name, is_default)
SELECT 'Transport', true WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Transport');

INSERT INTO categories (name, is_default)
SELECT 'Entertainment', true WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Entertainment');

INSERT INTO categories (name, is_default)
SELECT 'Shopping', true WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Shopping');

INSERT INTO categories (name, is_default)
SELECT 'Bills', true WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Bills');

INSERT INTO categories (name, is_default)
SELECT 'Income', true WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Income');

INSERT INTO categories (name, is_default)
SELECT 'Others', true WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Others');
