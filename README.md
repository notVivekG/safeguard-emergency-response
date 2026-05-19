# SafeGuard — Emergency Response Platform

A real-time disaster and emergency response platform built as a major college project.

## Features
- Real-time incident reporting with live map updates
- SOS emergency button with location sharing
- AI-powered severity prediction using keyword analysis
- Volunteer coordination system
- Admin dashboard with full incident and user management
- Push notifications via Firebase FCM
- Broadcast alerts to all users
- Dark mode support
- Fully responsive design

## Tech Stack
| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, Vite, TailwindCSS v3, Framer Motion, Leaflet.js |
| Backend | Node.js, Express.js, MongoDB, Mongoose |
| Real-time | Socket.IO |
| Auth | JWT, bcryptjs |
| Storage | Cloudinary |
| Notifications | Firebase Admin FCM |
| Maps | Leaflet.js + OpenStreetMap (free, no API key) |

## Setup Instructions
1. Clone the repository
2. Create `server/.env` with these variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   FIREBASE_SERVICE_ACCOUNT=./firebase-key.json
   PORT=5000
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```
3. Install dependencies:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
4. Start the backend:
   ```bash
   cd server && npm run dev
   ```
5. Start the frontend:
   ```bash
   cd client && npm run dev
   ```
6. Visit `http://localhost:5173`

## Pages
| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Home dashboard with live map | No |
| `/map` | Full screen live incident map | No |
| `/report` | Report a new incident | Yes |
| `/alerts` | Browse all alerts | No |
| `/dashboard` | User dashboard and reports | Yes |
| `/admin` | Admin panel | Admin only |
| `/resources` | Safety guides and resources | No |
| `/about` | About the platform | No |

## Admin Setup
To make a user an admin run:
```bash
cd server
node scripts/makeAdmin.js your@email.com
```

## Real-time Features
- New incidents appear on map and feed instantly
- Delete propagates to all connected clients
- Bell notifications update in real time
- Admin broadcasts reach all users immediately
