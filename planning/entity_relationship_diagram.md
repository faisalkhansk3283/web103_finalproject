# Entity Relationship Diagram

Reference the Creating an Entity Relationship Diagram final project guide in the course portal for more information about how to complete this deliverable.

## Create the List of Tables

- Users
- Transactions
- Categories
- Transaction_Categories
  
## Add the Entity Relationship Diagram

[👉🏾👉🏾👉🏾 Include an image or images of the diagram below. You may also wish to use the following markdown syntax to outline each table, as per your preference.]

![Entity Relationship Diagram](./images/erd_diagram.png)

**Users**

| Column Name | Type | Description |
|-------------|------|-------------|
| id | integer | primary key |
| username | text | user's display name |
| email | text |user's email address |
| created_at | timestamp | when the account was created |

**Transactions**

| Column Name | Type | Description |
|-------------|------|-------------|
| id | integer | primary key |
| user_id | integer | foreign key referencing Users |
| type | text |income or expense |
| description | text | short label for the transaction |
| amount | decimal | transaction amount |
| date | date | date the transaction occurred |

**Categories**

| Column Name | Type | Description |
|-------------|------|-------------|
| id | integer | primary key |
| user_id | integer | foreign key referencing Users |
| name | text |category name |
| is_default | boolean | whether this is an auto-generated default category |

**Transaction_Categories**

| Column Name | Type | Description |
|-------------|------|-------------|
| transaction_id | integer | foreign key referencing Transactions |
| category_id | integer | foreign key referencing Categories |

