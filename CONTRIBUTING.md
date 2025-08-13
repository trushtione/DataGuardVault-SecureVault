# 🤝 Contributing to DataGuardVault

Thank you for your interest in contributing to DataGuardVault! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Community](#community)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### **Our Standards**
- **Be respectful** and inclusive
- **Be collaborative** and constructive
- **Be professional** and helpful
- **Be open** to feedback and learning

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Git
- Basic knowledge of TypeScript and React

### **Fork and Clone**
1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/DataGuardVault.git
   cd DataGuardVault
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/originalowner/DataGuardVault.git
   ```

### **Install Dependencies**
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

## 🛠️ Development Setup

### **Environment Configuration**
1. **Copy environment template**:
   ```bash
   cp .env.example .env
   ```

2. **Configure your environment**:
   ```env
   DATABASE_URL=postgresql://user:pass@localhost:5432/dataguardvault
   JWT_SECRET=your-jwt-secret
   ENCRYPTION_KEY=your-encryption-key
   NODE_ENV=development
   PORT=3000
   ```

### **Database Setup**
```bash
# Start PostgreSQL (if using Docker)
docker run --name postgres -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed
```

### **Start Development Servers**
```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
cd client && npm run dev

# Terminal 3: Database (if needed)
npm run db:watch
```

## 📝 Code Standards

### **TypeScript Guidelines**
- **Use strict mode** - Enable all strict TypeScript options
- **Proper typing** - Avoid `any` types, use interfaces
- **Generic types** - Use generics for reusable components
- **Union types** - Use union types for multiple valid values

### **React Best Practices**
- **Functional components** - Use hooks and functional components
- **Custom hooks** - Extract reusable logic into custom hooks
- **Props interface** - Define clear prop interfaces
- **State management** - Use React Query for server state

### **Clean Architecture Principles**
- **Domain layer** - Business entities and rules
- **Application layer** - Use cases and business logic
- **Infrastructure layer** - External concerns and implementations
- **Dependency inversion** - Depend on abstractions, not concretions

### **Code Style**
```typescript
// ✅ Good
interface UserProps {
  id: string;
  name: string;
  email: string;
}

const UserComponent: React.FC<UserProps> = ({ id, name, email }) => {
  return (
    <div className="user-card">
      <h3>{name}</h3>
      <p>{email}</p>
    </div>
  );
};

// ❌ Avoid
const UserComponent = (props: any) => {
  return <div>{props.name}</div>;
};
```

### **File Naming Conventions**
- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase with `use` prefix (`useUserData.ts`)
- **Utilities**: camelCase (`fileUtils.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)

### **Import Organization**
```typescript
// 1. External libraries
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal components
import { Button } from '@/components/ui/button';
import { useUserData } from '@/hooks/useUserData';

// 3. Types and utilities
import type { User } from '@/types/user';
import { formatDate } from '@/utils/date';

// 4. Relative imports
import './UserProfile.css';
```

## 🧪 Testing

### **Test Structure**
```
tests/
├── unit/              # Unit tests
├── integration/       # Integration tests
├── e2e/              # End-to-end tests
└── fixtures/         # Test data and mocks
```

### **Writing Tests**
```typescript
// Component test example
import { render, screen } from '@testing-library/react';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  it('should display user information', () => {
    const user = { name: 'John Doe', email: 'john@example.com' };
    
    render(<UserProfile user={user} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
});
```

### **Running Tests**
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test UserProfile.test.tsx
```

## 🔄 Pull Request Process

### **Before Submitting**
1. **Ensure tests pass** - All tests should be green
2. **Check linting** - Run `npm run lint` and fix issues
3. **Type checking** - Run `npm run type-check`
4. **Update documentation** - Update README, API docs if needed

### **PR Template**
```markdown
## 📝 Description
Brief description of changes

## 🔧 Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## 🧪 Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## 📚 Documentation
- [ ] README updated
- [ ] API documentation updated
- [ ] Code comments added

## 🔍 Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Code commented for complex logic
- [ ] Changes generate no new warnings
```

### **Review Process**
1. **Submit PR** with clear description
2. **Address feedback** from maintainers
3. **Update PR** based on review comments
4. **Maintainers merge** after approval

## 🐛 Issue Guidelines

### **Bug Reports**
```markdown
## 🐛 Bug Description
Clear description of the bug

## 🔍 Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## 📱 Expected vs Actual**
- **Expected**: What should happen
- **Actual**: What actually happens

## 🌍 Environment
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome, Firefox, Safari]
- Version: [e.g., 1.0.0]

## 📋 Additional Context
Any other context, logs, or screenshots
```

### **Feature Requests**
```markdown
## 🚀 Feature Description
Clear description of the feature

## 💡 Use Case
Why this feature would be useful

## 🔧 Implementation Ideas
Any thoughts on how to implement

## 📱 Mockups/Screenshots
Visual examples if applicable
```

## 🌟 Community

### **Communication Channels**
- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Discord Server** - Real-time chat and collaboration
- **Email** - support@dataguardvault.com

### **Getting Help**
1. **Check documentation** - README, Wiki, API docs
2. **Search issues** - Look for similar problems
3. **Ask in discussions** - Community Q&A
4. **Create issue** - For bugs or feature requests

### **Recognition**
- **Contributors** are listed in README
- **Significant contributions** get special recognition
- **Community badges** for active contributors
- **Mention in release notes** for major contributions

## 📚 Learning Resources

### **Project-Specific**
- [Clean Architecture Guide](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [React Best Practices](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### **General Development**
- [Git Workflow](https://guides.github.com/introduction/flow/)
- [Code Review Best Practices](https://google.github.io/eng-practices/review/)
- [Testing Best Practices](https://testing-library.com/docs/guiding-principles)

## 🎯 Contribution Areas

### **High Priority**
- **Security improvements** - Encryption, authentication
- **Performance optimization** - Database queries, rendering
- **Accessibility** - WCAG compliance, screen readers
- **Testing coverage** - Unit, integration, E2E tests

### **Medium Priority**
- **UI/UX improvements** - Design, animations, responsiveness
- **Documentation** - API docs, tutorials, examples
- **Error handling** - Better error messages, logging
- **Internationalization** - Multi-language support

### **Low Priority**
- **Code refactoring** - Clean up, optimization
- **Tooling** - Development tools, scripts
- **Examples** - Sample applications, demos
- **Blog posts** - Technical articles, tutorials

## 🙏 Thank You

Thank you for contributing to DataGuardVault! Your contributions help make this project better for everyone.

**Remember**: Every contribution, no matter how small, makes a difference! 🌟

---

*Happy coding! 🚀*
