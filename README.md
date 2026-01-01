# MedBook - Medical Appointment Booking Platform

A modern, full-stack web application for booking medical appointments online. MedBook connects patients with healthcare practitioners, enabling seamless appointment scheduling, availability management, and real-time notifications.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue?style=flat-square&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?style=flat-square&logo=tailwind-css)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Key Features](#key-features)
- [Responsive Design](#responsive-design)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### For Patients
- 🔍 **Search & Filter Doctors** - Find healthcare professionals by specialty, location, or availability
- 📅 **Easy Appointment Booking** - Book appointments with real-time availability
- 📱 **Patient Dashboard** - View upcoming and past appointments
- 🔔 **Real-time Notifications** - Get notified about appointment status changes
- 📝 **Appointment Management** - Cancel appointments and add notes

### For Practitioners
- ⏰ **Availability Management** - Set weekly schedules or specific day availability
- 📊 **Dashboard Analytics** - View statistics on appointments and patients
- ✅ **Appointment Confirmation** - Confirm or decline appointment requests
- 📋 **Patient Management** - View patient information and appointment history
- 🔔 **Notification System** - Stay updated on new appointment requests

### General Features
- 🔐 **Secure Authentication** - Role-based access control (Patient/Practitioner)
- 📱 **Fully Responsive** - Optimized for mobile, tablet, and desktop
- ⚡ **Real-time Updates** - Server-side rendering with Next.js 16
- 🎨 **Modern UI** - Built with Radix UI and Tailwind CSS

## 🛠 Tech Stack

### Frontend
- **Next.js 16.0** - React framework with App Router
- **React 19.2** - UI library
- **TypeScript 5.0** - Type safety
- **Tailwind CSS 4.1** - Styling
- **Radix UI** - Accessible component primitives
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **date-fns** - Date manipulation
- **Lucide React** - Icons
- **Sonner** - Toast notifications

### Backend
- **Next.js Server Actions** - Server-side logic
- **PostgreSQL** - Database (via Neon)
- **@neondatabase/serverless** - Serverless PostgreSQL client
- **bcrypt** - Password hashing

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **TypeScript** - Type checking

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- PostgreSQL database (Neon recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd medical-appointment-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   SESSION_SECRET=your_random_secret_key
   ```

4. **Set up the database**
   
   Run the SQL schema script:
   ```bash
   # Connect to your PostgreSQL database and run:
   psql -U your_user -d your_database -f scripts/001-create-schema.sql
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
medical-appointment-app-final/
├── app/                      # Next.js App Router pages
│   ├── (auth)/              # Authentication routes
│   │   ├── login/           # Login page
│   │   └── signup/          # Signup page
│   ├── api/                 # API routes
│   │   └── notifications/   # Notification streaming
│   ├── dashboard/           # Dashboard pages
│   │   ├── patient/        # Patient dashboard
│   │   └── practitioner/   # Practitioner dashboard
│   ├── doctors/            # Doctor listing and profiles
│   │   └── [id]/           # Individual doctor profile
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/              # React components
│   ├── auth/               # Authentication forms
│   ├── dashboard/           # Dashboard components
│   ├── doctors/            # Doctor-related components
│   ├── notifications/      # Notification components
│   ├── ui/                 # Reusable UI components
│   ├── header.tsx          # Navigation header
│   ├── footer.tsx          # Footer component
│   └── user-menu.tsx       # User menu dropdown
├── lib/                    # Utility functions and configurations
│   ├── actions/            # Server actions
│   │   ├── auth.ts        # Authentication actions
│   │   ├── appointments.ts # Appointment actions
│   │   └── availability.ts # Availability actions
│   ├── queries/            # Database queries
│   ├── auth.ts            # Authentication utilities
│   └── db.ts              # Database types and connection
├── scripts/               # Database scripts
│   └── 001-create-schema.sql # Database schema
├── public/                 # Static assets
├── styles/                 # Global styles
├── hooks/                   # Custom React hooks
├── package.json            # Dependencies
├── tsconfig.json          # TypeScript configuration
├── next.config.mjs        # Next.js configuration
└── tailwind.config.js     # Tailwind CSS configuration
```

## 🗄 Database Schema

The application uses PostgreSQL with the following main tables:

- **users** - User accounts (patients and practitioners)
- **practitioners** - Extended profile for healthcare providers
- **availability_slots** - Time slots when practitioners are available
- **appointments** - Booked appointments with status tracking
- **sessions** - User session management

### Key Relationships

- One user can be either a patient or practitioner
- Practitioners have multiple availability slots
- Patients can book multiple appointments
- Appointments link patients to practitioners

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Session Secret (generate a random string)
SESSION_SECRET=your-secret-key-here

# Optional: Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎯 Key Features

### Authentication System
- Secure password hashing with bcrypt
- Session-based authentication
- Role-based access control (Patient/Practitioner)
- Protected routes

### Appointment Booking
- Real-time availability checking
- Overlap prevention
- Appointment status management (pending, confirmed, cancelled)
- Notes and patient information

### Availability Management
- Weekly schedule configuration
- Specific day availability
- Quick apply for weekdays/weekends
- Visual calendar interface

### Responsive Design
- Mobile-first approach
- Hamburger menu for mobile navigation
- Adaptive layouts for all screen sizes
- Touch-friendly interfaces

## 📱 Responsive Design

The application is fully responsive and optimized for:
- 📱 **Mobile** (< 640px) - Single column layouts, stacked components
- 📱 **Tablet** (640px - 1024px) - Two-column grids, optimized spacing
- 💻 **Desktop** (> 1024px) - Multi-column layouts, sidebars

### Responsive Features
- Mobile hamburger menu
- Adaptive form layouts
- Responsive grid systems
- Touch-optimized buttons and inputs
- Flexible card layouts

## 🔒 Security Features

- Password hashing with bcrypt
- SQL injection prevention with parameterized queries
- Session management
- Role-based access control
- Input validation with Zod
- CSRF protection via Next.js

## 🚧 Future Enhancements

Potential features for future development:
- Email notifications
- SMS reminders
- Payment integration
- Video consultation support
- Medical records management
- Prescription management
- Multi-language support
- Advanced search filters
- Rating and review system

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 👨‍💻 Author

Developed as a portfolio project demonstrating full-stack development skills with modern web technologies.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Radix UI for accessible components
- Tailwind CSS for the utility-first CSS framework
- The open-source community

---

**Note**: This is a portfolio project. For production use, additional security measures, testing, and optimizations should be implemented.

