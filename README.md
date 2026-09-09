# Training Center Management & Certificate Verification System

A complete, production-ready training center website and management system built with Node.js, Express.js, EJS, and MySQL.

## Features

### Public Website
- Landing page with hero section and course listings
- About page with mission and statistics
- Contact page with form submission
- Certificate verification system
- Course catalog

### Admin Panel
- Dashboard with statistics and recent activity
- Student management (CRUD)
- Certificate management with printable certificates
- Invoice management with printable invoices
- Student issue tracking
- Search and filtering
- Pagination

## Tech Stack

- **Backend:** Node.js + Express.js
- **Template Engine:** EJS
- **Database:** MySQL
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Authentication:** Session-based with bcrypt
- **Icons:** Lucide-style inline SVGs

## Prerequisites

- Node.js (v14+)
- MySQL (v5.7+)
- npm

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd training-center
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your database credentials.

4. Create the database and tables:
```bash
mysql -u root -p < database/schema.sql
```

5. Seed the database:
```bash
npm run seed
```

6. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Default Credentials

- **Username:** admin
- **Password:** admin123

## Project Structure

```
training-center/
├── app.js                    # Main application entry
├── package.json
├── .env                      # Environment variables
├── .env.example
├── config/
│   └── database.js           # Database connection pool
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── dashboardController.js
│   ├── studentController.js
│   ├── certificateController.js
│   ├── invoiceController.js
│   ├── issueController.js
│   └── publicController.js   # Public pages logic
├── models/
│   ├── User.js
│   ├── Student.js
│   ├── Course.js
│   ├── Batch.js
│   ├── Certificate.js
│   ├── Invoice.js
│   ├── StudentIssue.js
│   └── ContactMessage.js
├── routes/
│   ├── public.js
│   ├── auth.js
│   ├── students.js
│   ├── certificates.js
│   ├── invoices.js
│   └── issues.js
├── middleware/
│   ├── auth.js               # Authentication middleware
│   ├── validation.js         # Input validation
│   └── errorHandler.js       # Error handling
├── views/
│   ├── layouts/              # EJS layouts
│   ├── partials/             # Reusable EJS components
│   ├── public/               # Public page views
│   ├── admin/                # Admin panel views
│   └── errors/               # Error pages
├── public/
│   ├── css/                  # Stylesheets
│   ├── js/                   # Client-side JavaScript
│   └── images/               # Static images
├── database/
│   ├── schema.sql            # Database schema
│   └── seed.js               # Seed data script
└── uploads/                  # User uploads
```

## Database Schema

- **users** - Admin accounts
- **courses** - Training programs
- **batches** - Course batches
- **students** - Enrolled students
- **certificates** - Issued certificates
- **invoices** - Financial records
- **student_issues** - Support tickets
- **contact_messages** - Contact form submissions

## Environment Variables

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=training_center
DB_USER=root
DB_PASSWORD=your_password
SESSION_SECRET=change_this_secret
```

## License

MIT
