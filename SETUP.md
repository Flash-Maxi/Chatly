# Chatily - Setup & Installation Guide

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB database (local or cloud instance)
- Cloudinary account (for image uploads)

---

## Backend Setup

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create `.env` file
Copy `.env.example` to `.env` and fill in the required values:
```bash
cp .env.example .env
```

**Required environment variables:**
- `PORT` - Server port (default: 5000)
- `MONGODB_URL` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `CLOUD_NAME`, `API_KEY`, `API_SECRET` - Cloudinary credentials

### 4. Start the backend server
```bash
npm run dev
```

The server will start on `http://localhost:5000`

**Alternative for production:**
```bash
node index.js
```

---

## Frontend Setup

### 1. Navigate to frontend directory
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create `.env` file (Optional)
```bash
cp .env.example .env
```

If you don't create `.env`, the default server URL is `http://localhost:5000` (defined in `main.jsx`).

### 4. Start the frontend dev server
```bash
npm run dev
```

The frontend will typically run on `http://localhost:5173`

### 5. Build for production
```bash
npm run build
```

Output will be in `dist/` folder.

---

## Quick Start (Full Stack)

### Terminal 1 - Backend:
```bash
cd backend
npm install
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

---

## Testing Socket.io Connection

Once the backend is running, test the socket connection:

```bash
cd backend
node test-socket.js
```

Expected output:
```
[INFO] Starting Socket.io connection test...
[User 1] Connected! Socket ID: ...
[User 2] Connected! Socket ID: ...
[TEST RESULT] ✓ Both users successfully connected via Socket.io
```

---

## MongoDB Setup

### Option 1: Local MongoDB
```bash
mongod
```

Connection string: `mongodb://localhost:27017/chatily`

### Option 2: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster and user
3. Copy connection string and add to `.env`

Example: `mongodb+srv://username:password@cluster.mongodb.net/chatily`

---

## Cloudinary Setup

1. Sign up at https://cloudinary.com
2. Go to Dashboard and copy:
   - Cloud Name
   - API Key
   - API Secret
3. Add these to your `.env` file

---

## Troubleshooting

### Port 5000 already in use
Change PORT in `.env`:
```env
PORT=5001
```

### Database connection failed
- Check MongoDB is running: `mongod`
- Verify connection string in `.env`
- For MongoDB Atlas, ensure IP whitelist includes your machine

### Socket.io connection error
- Ensure backend is running on correct port
- Check CORS configuration in `backend/index.js`
- Verify `serverUrl` in `frontend/src/main.jsx` matches backend URL

### Dependencies installation fails
```bash
rm -rf node_modules package-lock.json
npm install
```

### Vite dev server port conflict
```bash
npm run dev -- --port 5174
```

---

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login to account
- `GET /api/auth/logout` - Logout

### Users
- `GET /api/user/current` - Get logged-in user
- `GET /api/user/others` - Get all other users
- `GET /api/user/search?query=term` - Search users
- `PUT /api/user/profile` - Update profile with image

### Messages
- `POST /api/message/send/:receiver` - Send message to user
- `GET /api/message/get/:receiver` - Get message history

---

## Project Structure

```
Chatily/
├── backend/
│   ├── config/          # Database, JWT, Cloudinary config
│   ├── controllers/     # Business logic
│   ├── middlewares/     # Auth, file upload
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── socket/          # Socket.io setup
│   ├── uploads/         # Image uploads
│   ├── index.js         # Express app entry
│   ├── test-socket.js   # Socket test file
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/  # React components
    │   ├── pages/       # Page components
    │   ├── customHooks/ # Custom React hooks
    │   ├── redux/       # Redux store & slices
    │   ├── assets/      # Images & static files
    │   ├── App.jsx      # Main app component
    │   ├── main.jsx     # Entry point
    │   └── index.css    # Global styles
    ├── vite.config.js   # Vite configuration
    ├── tailwind.config.js
    └── package.json
```

---

## Features

✅ User authentication (Sign up/Login)  
✅ Real-time messaging with Socket.io  
✅ Image sharing and download  
✅ Online presence tracking  
✅ User search and discovery  
✅ Profile management  
✅ Message history  
✅ Emoji support  
✅ Responsive design  

---

## Technology Stack

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- Socket.io
- JWT Authentication
- Bcryptjs (password hashing)
- Cloudinary (image storage)

**Frontend:**
- React 19
- Vite
- Redux Toolkit
- Tailwind CSS
- Socket.io-client
- Axios
- React Router

---

## Deployment

### Backend (Render.com)
1. Push code to GitHub
2. Connect repository on Render
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Push code to GitHub
2. Connect repository on Vercel/Netlify
3. Build command: `npm run build`
4. Deploy

---

## Support

For issues or questions, check the troubleshooting section or review the console logs for error messages.
