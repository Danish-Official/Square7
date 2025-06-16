# Square7 - Layout Management System

A full-stack web application for managing real estate plots, bookings, and related operations.

## 🌟 Features

- Layout Management
- Booking System
- Invoice Generation
- Broker Management
- Enquiry Tracking
- Expense Management
- Layout Resource Management
- User Authentication & Authorization
- Document Management

## 🏗 Tech Stack

### Frontend
- React 18.3
- Vite
- Shadcn & Tailwind CSS
- React Router DOM
- Recharts for data visualization
- PDF generation with react-pdf
- Date handling with date-fns & dayjs

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads
- Nodemailer for email functionality

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the development servers:
```bash
npm start
```

This will concurrently run:
- Frontend at http://localhost:5173
- Backend at http://localhost:8000

## 📁 Project Structure

```
Square7/
├── frontend/           # React frontend application
│   ├── src/           # Source files
│   └── dist/          # Built files
├── backend/           # Node.js backend
│   ├── routes/        # API routes
│   ├── uploads/       # File storage
│   └── server.js      # Main server file
└── package.json       # Root package.json for scripts
```

## 🔑 Environment Variables

Backend `.env` requirements:
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT
- Other configuration variables as needed

## 📝 API Endpoints

- `/api/auth`: Authentication routes
- `/api/plots`: Plot management
- `/api/bookings`: Booking operations
- `/api/invoices`: Invoice handling
- `/api/enquiries`: Enquiry management
- `/api/brokers`: Broker management
- `/api/layout-resources`: Layout resource management
- `/api/expenses`: Expense tracking
- `/api/deleted-contacts`: Deleted contact management

## 👥 User Roles

- Super Admin
- Regular Users
- Brokers

## 📄 License

[Add your license information here]
