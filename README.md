# 🔐 DataGuardVault - Enterprise-Grade Secure File Storage

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.0-green.svg)](https://nodejs.org/)
[![Clean Architecture](https://img.shields.io/badge/Architecture-Clean-orange.svg)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

> **A modern, secure, and scalable file storage solution built with Clean Architecture principles, featuring client-side encryption, secure sharing, and enterprise-grade security features.**

## 🌟 Features

### 🔒 **Security First**
- **AES-256 Encryption** - Military-grade encryption for all files
- **Client-Side Encryption** - Files encrypted before leaving your device
- **Two-Factor Authentication** - Enhanced account security
- **Secure File Sharing** - Time-limited, token-based sharing
- **Audit Logging** - Complete activity tracking and compliance

### 📁 **File Management**
- **Drag & Drop Upload** - Intuitive file management
- **File Type Detection** - Automatic categorization and icons
- **Version Control** - Track file changes over time
- **Secure Trash** - Recoverable file deletion
- **Storage Analytics** - Real-time usage monitoring

### 🚀 **Advanced Features**
- **File Steganography** - Hide messages within images
- **AI Security Insights** - Machine learning security analysis
- **Secure Messenger** - Encrypted communication
- **Backup & Export** - Secure data backup solutions
- **Password Generator** - Strong password creation

### 🎨 **Modern UI/UX**
- **Dark Theme** - Professional, eye-friendly interface
- **Responsive Design** - Works on all devices
- **Real-Time Updates** - Live data synchronization
- **Interactive Dashboard** - Comprehensive security overview
- **Accessibility** - WCAG compliant design

## 🏗️ Architecture

### **Clean Architecture Implementation**
```
src/
├── domain/           # Business entities and rules
│   ├── entities/     # Core business objects
│   └── repositories/ # Data access contracts
├── application/      # Use cases and business logic
│   └── useCases/    # Application-specific rules
├── infrastructure/   # External concerns
│   ├── controllers/  # HTTP request handlers
│   ├── repositories/ # Data access implementations
│   └── routes/      # API endpoint definitions
└── client/          # React frontend application
```

### **Technology Stack**
- **Backend**: Node.js + Express.js + TypeScript
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Database**: Drizzle ORM with PostgreSQL support
- **State Management**: React Query + Custom Hooks
- **Authentication**: JWT + 2FA support
- **Encryption**: Web Crypto API + AES-256

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- PostgreSQL (optional, includes mock database)

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/DataGuardVault.git
cd DataGuardVault
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
# Copy environment template
cp .env.example .env

# Configure your environment variables
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
```

4. **Start Development Server**
```bash
# Start backend server
npm run dev

# Start frontend (in new terminal)
cd client && npm run dev
```

5. **Access the Application**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Demo User**: `demo-user-id`

## 📚 API Documentation

### **Authentication Endpoints**
```http
POST /api/auth/register    # User registration
POST /api/auth/login       # User authentication
POST /api/auth/logout      # User logout
```

### **File Management**
```http
GET    /api/files/:userId           # Get user files
POST   /api/files                  # Upload new file
PUT    /api/files/:id              # Update file metadata
DELETE /api/files/:id              # Move file to trash
POST   /api/files/:id/restore      # Restore from trash
```

### **File Sharing**
```http
POST   /api/files/:id/share        # Share file
DELETE /api/files/:id/share        # Revoke sharing
GET    /api/shared/:token          # Access shared file
```

### **Security & Analytics**
```http
GET /api/stats/:userId             # Storage statistics
GET /api/audit/:userId             # Activity logs
GET /api/backups/:userId           # Backup information
```

## 🛠️ Development

### **Project Structure**
```
DataGuardVault/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   └── lib/           # Utility functions
├── server/                 # Express backend
├── src/                    # Clean Architecture layers
│   ├── domain/            # Business logic
│   ├── application/       # Use cases
│   └── infrastructure/    # External concerns
└── shared/                # Shared types and schemas
```

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run test suite
npm run lint         # Lint code
npm run type-check   # TypeScript type checking
```

### **Code Quality**
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking
- **Husky** - Git hooks for quality assurance

## 🔧 Configuration

### **Environment Variables**
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/dataguardvault

# Security
JWT_SECRET=your-super-secret-jwt-key
ENCRYPTION_KEY=your-encryption-key
SESSION_SECRET=your-session-secret

# Server
PORT=3000
NODE_ENV=development

# File Storage
MAX_FILE_SIZE=100MB
ALLOWED_FILE_TYPES=pdf,doc,docx,image/*
```

### **Database Schema**
The application uses Drizzle ORM with the following main entities:
- **Users** - User accounts and authentication
- **EncryptedFiles** - File metadata and encryption info
- **Folders** - File organization structure
- **AuditLogs** - Security and activity tracking
- **Backups** - Data backup management

## 🧪 Testing

### **Test Coverage**
- **Unit Tests** - Individual component testing
- **Integration Tests** - API endpoint testing
- **E2E Tests** - Full user workflow testing

### **Running Tests**
```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
npm run test:e2e          # End-to-end tests
```

## 📦 Deployment

### **Docker Deployment**
```bash
# Build and run with Docker
docker build -t dataguardvault .
docker run -p 3000:3000 dataguardvault
```

### **Production Build**
```bash
# Build frontend
cd client && npm run build

# Build backend
npm run build

# Start production server
npm run start
```

### **Environment Setup**
- **Production Database** - PostgreSQL with SSL
- **File Storage** - S3-compatible storage
- **CDN** - Static asset delivery
- **Monitoring** - Application performance monitoring

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### **Development Workflow**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Code Standards**
- Follow TypeScript best practices
- Maintain Clean Architecture principles
- Write comprehensive tests
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Clean Architecture** by Robert C. Martin
- **React Query** for state management
- **Tailwind CSS** for styling
- **Drizzle ORM** for database operations
- **Web Crypto API** for encryption

## 📞 Support

- **Documentation**: [Wiki](https://github.com/yourusername/DataGuardVault/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/DataGuardVault/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/DataGuardVault/discussions)
- **Email**: support@dataguardvault.com

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/DataGuardVault&type=Date)](https://star-history.com/#yourusername/DataGuardVault&Date)

---

**Built with ❤️ for secure file storage**

*DataGuardVault - Where Security Meets Simplicity*
