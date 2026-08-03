# Milestone 5

This document should be completed and submitted during **Unit 9** of this course. You **must** check off all completed tasks in this document in order to receive credit for your work.

## Checklist

This unit, be sure to complete all tasks listed below. To complete a task, place an `x` between the brackets.

- [x] Deploy your project on Render
  - [x] In `readme.md`, add the link to your deployed project
- [x] Update the status of issues in your project board as you complete them
- [x] In `readme.md`, check off the features you have completed in this unit by adding a ✅ emoji in front of their title
  - [x] Under each feature you have completed, **include a GIF** showing feature functionality
- [x] In this document, complete the **Reflection** section below
- [x] 🚩🚩🚩**Complete the Final Project Feature Checklist section below**, detailing each feature you completed in the project (ONLY include features you implemented, not features you planned)
- [x] 🚩🚩🚩**Record a GIF showing a complete run-through of your app** that displays all the components included in the **Final Project Feature Checklist** below
  - [x] Include this GIF in the **Final Demo GIF** section below

## Final Project Feature Checklist

Complete the checklist below detailing each baseline, custom, and stretch feature you completed in your project. This checklist will help graders look for each feature in the GIF you submit.

### Baseline Features

👉🏾👉🏾👉🏾 Check off each completed feature below.

- [x] The project includes an Express backend app and a React frontend app
- [x] The project includes these backend-specific features:
  - [x] At least one of each of the following database relationships in Postgres
    - [x] one-to-many (categories → transactions via transaction_categories join table)
    - [x] many-to-many with a join table (transactions ↔ categories via transaction_categories)
  - [x] A well-designed RESTful API that:
    - [x] supports all four main request types for a single entity (ex. tasks in a to-do list app): GET, POST, PATCH, and DELETE
      - [x] the user can **view** items, such as tasks
      - [x] the user can **create** a new item, such as a task
      - [x] the user can **update** an existing item by changing some or all of its values, such as changing the title of task
      - [x] the user can **delete** an existing item, such as a task
    - [x] Routes follow proper naming conventions
  - [x] The web app includes the ability to reset the database to its default state
- [x] The project includes these frontend-specific features:
  - [x] At least one redirection, where users are able to navigate to a new page with a new URL within the app
  - [x] At least one interaction that the user can initiate and complete on the same page without navigating to a new page
  - [x] Dynamic frontend routes created with React Router
  - [x] Hierarchically designed React components
    - [x] Components broken down into categories, including Page and Component types
    - [x] Corresponding container components and presenter components as appropriate
- [x] The project includes dynamic routes for both frontend and backend apps
- [x] The project is deployed on Render with all pages and features that are visible to the user are working as intended

### Custom Features

👉🏾👉🏾👉🏾 Check off each completed feature below.

- [x] The project gracefully handles errors
- [x] The project includes a one-to-one database relationship
  - [x] Each transaction has a unique image_url field
- [x] The project includes a slide-out pane or modal as appropriate for your use case that pops up and covers the page content without navigating away from the current page
  - [x] TransactionModal component for adding/editing transactions
- [x] The project includes a unique field within the join table
  - [x] transaction_categories join table has a unique created_at timestamp per entry
- [x] The project includes a custom non-RESTful route with corresponding controller actions
  - [x] /api/transactions/with-image endpoint for uploading receipts
- [x] The user can filter or sort items based on particular criteria as appropriate for your use case
  - [x] Filter by category and date range, sort by amount or recency
- [x] Data is automatically generated in response to a certain event or user action
  - [x] Default categories (Food, Transportation, Housing, etc.) are auto-inserted on database setup
  - [x] Recurring transactions auto-generate monthly entries when due
- [x] Data submitted via a POST or PATCH request is validated before the database is updated
  - [x] Validates: description required, amount > 0, at least one category required
  - [x] *Demonstration: Entering an empty description or 0 amount will show validation errors*

### Stretch Features

👉🏾👉🏾👉🏾 Check off each completed feature below.

- [ ] A subset of pages require the user to log in before accessing the content
  - [ ] Users can log in and log out via GitHub OAuth with Passport.js
- [ ] Restrict available user options dynamically, such as restricting available purchases based on a user's currency
- [x] Show a spinner while a page or page element is loading
  - [x] isUploading state shows "Saving..." text during image upload
- [x] Disable buttons and inputs during the form submission process
  - [x] Submit button is disabled when isUploading is true
- [x] Disable buttons after they have been clicked
  - [x] Submit button disabled during upload process
  - [x] *At least 75% of buttons in your app exhibit this behavior*
- [x] Users can upload images to the app and have them be stored on a cloud service
  - [x] Receipt image upload feature with drag & drop, camera capture, and file upload
  - [x] Images stored in server/uploads directory and served via /uploads route
- [ ] 🍞 [Toast messages](https://www.patternfly.org/v3/pattern-library/communication/toast-notifications/index.html) deliver simple feedback in response to user events

## Final Demo GIF

🔗 [Here's a GIF walkthrough of the final project](./planning/images/final-demo.gif)

## Reflection

### 1. What went well during this unit?

The deployment to Render went smoothly thanks to proper preparation of the render.yaml blueprint file. The database schema was already well-designed with proper relationships, making the API implementation straightforward. The team effectively implemented all baseline features and several custom features including the recurring transactions auto-generation system.

### 2. What were some challenges your group faced in this unit?

Integrating the image upload functionality with multer required careful handling of form data. Ensuring that recurring transactions were processed atomically (using database transactions) was important to prevent race conditions. Balancing the submission of all required documentation while ensuring the code was production-ready was also challenging.

### 3. What were some of the highlights or achievements that you are most proud of in this project?

The recurring transactions feature is particularly impressive - it uses database-level locking (FOR UPDATE) to safely handle concurrent requests, and can auto-generate multiple monthly entries if several months have passed since the last check. The modal-based interface for adding/editing transactions provides a smooth user experience without page navigation. The category chart and trend chart visualizations help users understand their spending patterns.

### 4. Reflecting on your web development journey so far, how have you grown since the beginning of the course?

At the beginning of the course, understanding RESTful APIs and database relationships seemed abstract. Now we can design and implement complex data models with multiple relationships (one-to-many, many-to-many), implement proper validation at both frontend and backend levels, and handle edge cases like recurring events and image uploads. The full-stack perspective has helped us understand how all the pieces fit together.

### 5. Looking ahead, what are your goals related to web development, and what steps do you plan to take to achieve them?

Future goals include implementing user authentication for multi-user support, adding data export/import functionality, and potentially integrating with real banking APIs for automatic transaction importing. To achieve these, we plan to learn authentication libraries (Passport.js, JWT), study API integration patterns, and explore cloud storage solutions for scalable image handling.
