-- Database Schema for Personal Budget Tracker
-- Run this script to set up your PostgreSQL database

-- Drop existing tables if they exist (for development purposes)
DROP TABLE IF EXISTS transaction_categories CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Create categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create transactions table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create transaction_categories join table (Many-to-Many relationship)
CREATE TABLE transaction_categories (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(transaction_id, category_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_amount ON transactions(amount);
CREATE INDEX idx_transaction_categories_transaction_id ON transaction_categories(transaction_id);
CREATE INDEX idx_transaction_categories_category_id ON transaction_categories(category_id);

-- Insert default categories
INSERT INTO categories (name, is_default) VALUES
    ('Food', TRUE),
    ('Transportation', TRUE),
    ('Housing', TRUE),
    ('Entertainment', TRUE),
    ('Healthcare', TRUE),
    ('Income', TRUE),
    ('Shopping', TRUE),
    ('Utilities', TRUE);

-- Sample transactions for testing (optional)
INSERT INTO transactions (description, amount, date) VALUES
    ('Grocery shopping', -85.50, CURRENT_DATE - INTERVAL '5 days'),
    ('Monthly salary', 3000.00, CURRENT_DATE - INTERVAL '3 days'),
    ('Gas station', -45.00, CURRENT_DATE - INTERVAL '2 days'),
    ('Netflix subscription', -15.99, CURRENT_DATE - INTERVAL '1 day'),
    ('Restaurant dinner', -65.00, CURRENT_DATE);

-- Link sample transactions to categories
INSERT INTO transaction_categories (transaction_id, category_id)
SELECT t.id, c.id
FROM transactions t
CROSS JOIN categories c
WHERE 
    (t.description LIKE '%Grocery%' AND c.name = 'Food')
    OR (t.description LIKE '%salary%' AND c.name = 'Income')
    OR (t.description LIKE '%Gas%' AND c.name = 'Transportation')
    OR (t.description LIKE '%Netflix%' AND c.name = 'Entertainment')
    OR (t.description LIKE '%Restaurant%' AND c.name = 'Food');
