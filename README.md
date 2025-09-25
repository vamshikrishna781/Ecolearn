# 🌱 Ecolearn - Environmental Education Platform

**Transforming environmental education through interactive gaming and gamified learning experiences.**

## 🌟 Overview

Ecolearn is a comprehensive environmental education platform designed to engage students through an interactive storyline where humanity rebuilds after an asteroid strike. The platform combines gaming elements with real-world environmental challenges to create meaningful learning experiences.

## 🎯 Key Features

### 🔐 Authentication & User Management
- **Multi-role system**: Student, Teacher, Admin
- **Email OTP verification** with custom reCAPTCHA
- **Secure password reset** functionality
- **Teacher account creation** by admins
- **Student account creation** by teachers

### 🏫 School & Institution Management
- **School/College database** with assignment system
- **Admin assigns** students and teachers to institutions
- **School-wise leaderboards** and competitions
- **Progress tracking** at institutional level

### 🎮 Gamified Learning Experience
- **Interactive storyline**: Asteroid strike → Species extinction → Human survival → Ecosystem revival
- **Eco-points system** with levels and badges
- **Real-world challenges**: Tree planting, waste segregation, environmental projects
- **Knowledge quizzes** and interactive content
- **School competitions** and rankings

### 📊 Dashboard & Analytics
- **Personalized dashboards** for each user role
- **Progress tracking** and achievement systems
- **Leaderboards** (global and school-specific)
- **Environmental impact** visualization

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** for data storage
- **JWT** for authentication
- **Nodemailer** for email services
- **Custom reCAPTCHA** implementation
- **Express validation** and security middleware

### Frontend
- **React.js** with hooks and context
- **React Router** for navigation
- **Axios** for API calls
- **React Hook Form** for form management
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hot Toast** for notifications

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/vamshikrishna781/ecolearn.git
cd ecolearn
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configurations

# Start the server
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Start the development server
npm start
```

### 4. Environment Configuration

Edit `backend/.env` with your settings:
```env
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/ecolearn

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Custom reCAPTCHA
RECAPTCHA_SECRET_KEY=your-custom-recaptcha-secret-key

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## 📱 Application Structure

### User Roles & Permissions

#### 👨‍🎓 Student
- Complete interactive storyline chapters
- Earn eco-points and badges
- Participate in real-world challenges
- View school and global leaderboards
- Track personal progress and achievements

#### 👨‍🏫 Teacher
- Create and manage student accounts
- Monitor class progress
- Assign challenges and activities
- View school-wide analytics
- Access educational resources

#### 👨‍💼 Admin
- Create and manage teacher accounts
- Add and manage schools/colleges
- Assign users to institutions
- Access system-wide analytics
- Manage platform settings

### 🎮 Game Storyline

#### Chapter 1: The Great Disruption
An asteroid strikes Earth, causing environmental destruction and species extinction. Players learn about:
- Environmental catastrophe impacts
- Species adaptation and survival
- Ecosystem recovery principles

#### Chapter 2: The Human Response  
Humans must rebuild while protecting the environment. Focus areas:
- Sustainable living practices
- Human impact on ecosystems  
- Real-world environmental actions

#### Chapter 3: Rebuilding Together
Understanding humans as part of the ecosystem. Key concepts:
- Sustainable community design
- Balancing growth with protection
- Creating positive environmental change

## 🏆 Gamification Elements

### Point System
- **Story completion**: 100-250 points per chapter
- **Quiz completion**: 50-150 points
- **Real-world challenges**: 200-500 points
- **Daily activities**: 25-100 points

### Badge System
- 🌱 **Seedling**: Complete first chapter
- 🌳 **Tree Planter**: Plant and document trees
- ♻️ **Waste Warrior**: Master waste segregation
- 🏆 **Eco Champion**: Reach top 10 in school
- 💚 **Green Leader**: Complete all challenges

### Level Progression
- **Level 1-5**: Beginner (0-5,000 points)
- **Level 6-10**: Intermediate (5,000-15,000 points)  
- **Level 11-15**: Advanced (15,000-30,000 points)
- **Level 16+**: Expert (30,000+ points)

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset
- `POST /api/auth/resend-otp` - Resend OTP

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/leaderboard` - Get leaderboards
- `POST /api/users/create-student` - Create student (teacher/admin)

### Schools
- `GET /api/schools` - List all schools
- `POST /api/schools` - Create school (admin only)
- `GET /api/schools/:id` - Get school details
- `GET /api/schools/:id/leaderboard` - School leaderboard

### Game & Progress
- `GET /api/game/progress` - Get user progress
- `POST /api/game/progress` - Update progress
- `POST /api/game/badge` - Award badge
- `GET /api/game/challenges` - Get challenges
- `GET /api/game/storyline/:chapter` - Get chapter content

### Admin
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/users` - List users with filters
- `POST /api/admin/create-teacher` - Create teacher account
- `POST /api/admin/assign-school` - Assign user to school

## 🐳 Docker Deployment

### Using Docker Compose
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Docker Setup
```bash
# Backend
cd backend
docker build -t ecolearn-backend .
docker run -p 5000:5000 ecolearn-backend

# Frontend  
cd frontend
docker build -t ecolearn-frontend .
docker run -p 3000:3000 ecolearn-frontend
```

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev  # Starts with nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm start    # Starts development server with hot reload
```

### Production Build
```bash
# Frontend production build
cd frontend
npm run build

# Backend production
cd backend
npm start
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌍 Environmental Impact

Ecolearn is designed to create real-world environmental impact by:
- **Educating** thousands of students about sustainability
- **Inspiring** concrete environmental actions
- **Connecting** schools in environmental competitions
- **Tracking** actual environmental improvements
- **Building** awareness about climate change

## 🎯 Alignment with Educational Goals

### NEP 2020 Compliance
- ✅ Experiential learning methodology
- ✅ Multidisciplinary approach
- ✅ Technology integration
- ✅ Assessment for learning
- ✅ Environmental awareness integration

### SDG Alignment  
- 🎯 **SDG 4**: Quality Education
- 🌍 **SDG 13**: Climate Action  
- 🌱 **SDG 15**: Life on Land
- 🤝 **SDG 17**: Partnerships for Goals

## 📞 Support

For support and questions:
- 📧 Email: support@ecolearn.org
- 🐛 Issues: GitHub Issues
- 📖 Documentation: Wiki section

---

**Together, we can build a sustainable future! 🌱**