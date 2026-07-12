**Hook (0:00–0:20)**
Most students get their money at the start of the month, and by the middle, they have no idea where it all went. WalletWatch is here to fix that.

**Problem and solution (0:20–1:00)**
WalletWatch is a simple budget tracker. You add a transaction in a few seconds, tag it with a category, and right away you can see where your money is going.
Let's walk through a quick example. Alex just signed up. As soon as they create an account, some categories are already set up for them, like Food, Transportation, and Housing. No setup needed. Alex buys a coffee, opens the "add transaction" popup right from the dashboard, types in the amount, picks a category, and saves it. They never even leave the page.

**Main features (1:00–2:00)**
On the dashboard, Alex can see their total balance, income, and expenses right away, plus their most recent transactions. On the Transactions page, they can filter by date or category, and sort by amount or by newest first. So checking last month's food spending only takes a couple of clicks.
Here's what makes WalletWatch different: one transaction can have more than one category. So a dinner with a client could be tagged as both Food and Business. That gives a more accurate picture of spending than just one label per transaction.
We also built in some basic checks to keep the data clean. The app won't let you save a transaction if the amount is negative, the date is in the future, or no category is picked.

**Database design (2:00–2:30)**
Behind the scenes, we have four tables: Users, Transactions, Categories, and a table called Transaction_Categories that connects the last two. This is what lets one transaction have several categories, and one category show up on many transactions.

**Closing and ask (2:30–3:00)**
Our goal is simple: make everyday budgeting easy, not stressful. One thing we'd love feedback on: we're still deciding if adding receipt photos should be in our first version, or something we save for later. If you were using this app, would that feature matter to you, or would you skip it?
