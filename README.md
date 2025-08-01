# MilkDost - Smart Milk Business Assistant 🥛

A comprehensive mobile-first web application designed for small-scale milk distribution businesses. Built with Next.js, TypeScript, Firebase, and Tailwind CSS.

## 🚀 Features

### Core Modules
1. **Client Management System**
   - Add, edit, and manage clients
   - Set delivery schedules and quantities
   - Track delivery history
   - Client contact management

2. **Smart Billing Module**
   - Auto-calculate monthly bills
   - Generate PDF invoices
   - Track payment status
   - Payment reminders

3. **Buffalo Care Tracker**
   - Buffalo health monitoring
   - Feeding schedule management
   - Vaccination reminders
   - Veterinary appointment tracking

4. **Milk Inventory Dashboard**
   - Daily milk production tracking
   - Distribution vs waste monitoring
   - Stock level alerts
   - Production analytics

5. **Analytics & Reports**
   - Revenue tracking
   - Client profitability analysis
   - Production trends
   - Business insights

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **PDF Generation**: jsPDF
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Notifications**: React Hot Toast

## 📱 Design Philosophy

- **Mobile-First**: Optimized for smartphone usage
- **Tab-Based Navigation**: Easy one-handed operation
- **Offline-Ready**: Progressive Web App capabilities
- **Indian Context**: Rupee formatting, local time zones

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd milkdost
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore Database
   - Enable Authentication (Email/Password)
   - Copy your Firebase config

4. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Firebase configuration in `.env.local`

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Other Platforms
```bash
npm run build
npm run start
```

## 📊 Project Structure

```
src/
├── app/                 # Next.js App Router
├── components/          # React components
│   ├── dashboard/       # Dashboard components
│   ├── layout/          # Layout components
│   └── navigation/      # Navigation components
├── lib/                 # Utilities and configurations
│   ├── firebase.ts      # Firebase configuration
│   └── utils.ts         # Utility functions
└── types/               # TypeScript type definitions
```

## 🔑 Key Features Implemented

### Dashboard
- ✅ Daily delivery overview
- ✅ Monthly revenue tracking
- ✅ Quick action buttons
- ✅ Today's summary
- ✅ Pending payments alert

### Mobile Navigation
- ✅ Bottom tab navigation
- ✅ Active state indicators
- ✅ Responsive design
- ✅ Touch-friendly interface

### Layout System
- ✅ Consistent header design
- ✅ Mobile-optimized spacing
- ✅ Toast notifications
- ✅ Loading states

## 🎯 Upcoming Features

- [ ] Client CRUD operations
- [ ] Delivery tracking
- [ ] Bill generation
- [ ] Payment management
- [ ] Buffalo health records
- [ ] Milk production logs
- [ ] PDF invoice generation
- [ ] WhatsApp integration
- [ ] Push notifications
- [ ] Offline data sync

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

Built with ❤️ for the milk business community.

## 📞 Support

For support, email [your-email] or create an issue in this repository.

---

**MilkDost** - Making milk business management smart and simple! 🐄✨
