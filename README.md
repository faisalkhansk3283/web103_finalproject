# WalletWatch

CodePath WEB103 Final Project

Designed and developed by: Mario Trevino, Faisal Rasheed Khan, Ke Zhang, Eric Chen, Klane Fondo, Kubra Sag

🔗 Link to deployed app: Pending


### Description and Purpose
Most students get their money at the start of the month, and by the middle, they have no idea where it all went. WalletWatch is here to fix that.

WalletWatch is a simple budget tracker. You add a transaction in a few seconds, tag it with a category, and right away you can see where your money is going. The app aims to make everyday budgeting easy, not stressful.


### Inspiration
Many budgeting tools are either too complex or too rigid. We wanted to build something lightweight that lets users log transactions quickly and organize them in a way that makes sense to them, without a steep learning curve. One transaction can have more than one category — a dinner with a client could be tagged as both Food and Business — giving a more accurate picture of spending.


## Tech Stack

Frontend: React

Backend: Node.js, Express



## Features

- [x] ✅ **View Transactions** — Users can view a list of all their income and expense transactions.
  ![View Transactions GIF](./planning/images/gif-p7.gif)
- [x] ✅ **Add Transaction** — Users can add a new transaction with an amount, description, date, and category.
  ![Add Transaction GIF](./planning/images/gif-p7.gif)
- [x] ✅ **Edit Transaction** — Users can update an existing transaction's details.
  ![Edit Transaction GIF](./planning/images/gif-p7.gif)
- [x] ✅ **Delete Transaction** — Users can remove a transaction they no longer want tracked.
  ![Delete Transaction GIF](./planning/images/gif-p7.gif)
- [x] ✅ **Category Tagging** — Transactions can be tagged with one or more categories (e.g. Food, Transportation, Business) via a many-to-many relationship.
  ![Category Tagging GIF](./planning/images/gif-p7.gif)



## Database Design

We have four tables: Users, Transactions, Categories, and Transaction_Categories that connects Transactions and Categories. This is what lets one transaction have several categories, and one category show up on many transactions.

![ERD Diagram](./planning/images/erd_diagram.png)


## Installation Instructions

[instructions go here]
