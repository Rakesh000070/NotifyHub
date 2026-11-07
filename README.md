# 🚀 NotifyHub — Real-Time Notification System

<p align="center">
  <img src="https://img.shields.io/badge/Status-In%20Development-orange?style=for-the-badge" alt="Project Status: In Development" />
  <img src="https://img.shields.io/badge/Stack-MERN-green?style=for-the-badge" alt="MERN Stack" />
  <img src="https://img.shields.io/badge/Communication-Socket.IO-blue?style=for-the-badge" alt="Socket.IO" />
</p>

NotifyHub is a MERN-based notification system designed to manage user notifications through a REST API, with real-time delivery being developed using Socket.IO.

The project focuses on authentication, notification management, modular backend architecture, and real-time communication.

## 📑 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Overview](#-api-overview)
- [Authentication Flow](#-authentication-flow)
- [Notification Flow](#-notification-flow)
- [Development Roadmap](#-development-roadmap)
- [Learning Objectives](#-learning-objectives)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)
- [Developer](#-developer)

## 📌 Overview

NotifyHub is a learning-oriented full-stack project that explores how a notification system can be built using MongoDB, Express.js, React, and Node.js.

The application currently includes JWT-based authentication and notification management APIs. Socket.IO integration is being developed to support live updates without requiring users to refresh the page.

## ✨ Features

### 🔐 Authentication

- User registration and login
- Password hashing with `bcryptjs`
- JWT-based authentication
- Protected profile endpoint
- Authentication middleware

### 🔔 Notification Management

- Create notifications
- Retrieve notifications
- Track unread notification counts
- Mark notifications as read
- Store notification data in MongoDB

### ⚡ Real-Time Communication

- Socket.IO server integration
- Socket.IO client connection setup
- Foundation for live notification delivery
- Planned live notification counter updates

> **Development note:** Real-time delivery is still being developed. Socket.IO connectivity and end-to-end notification delivery must be verified before these capabilities can be considered complete.

### 🛣️ Planned Features

- Admin dashboard and role-based authorization
- Send and broadcast notifications
- Notification deletion, search, and filtering
- Scheduled notifications
- Email and push notifications
- Redis caching and message queues
- Docker-based deployment

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB, MongoDB Atlas, Mongoose |
| Authentication | JSON Web Tokens (JWT), bcryptjs |
| Real-time communication | Socket.IO |
| API testing | Postman |
| Version control | Git, GitHub |

### 🔮 Technologies Under Consideration

These technologies are candidates for future development, not claims about the current implementation.

- **Redis** — caching and related performance improvements
- **RabbitMQ** — asynchronous message processing
- **Docker** — containerization
- **Nodemailer** — email notifications
- **Firebase Cloud Messaging** — push notifications
- **AWS** — cloud infrastructure

## 🏗️ System Architecture

The intended architecture separates the frontend, backend API, database, and real-time communication layer.

```text
                 React Frontend
                       |
             +---------+---------+
             |                   |
         REST API           Socket.IO
             |                   |
             v                   v
        Express.js          Socket Server
        / Node.js                |
             |                   |
             +---------+---------+
                       |
                       v
                  MongoDB
```

The diagram represents the intended architecture. The real-time connection and complete event-delivery flow are still being validated.

## 📁 Project Structure

The project is organized into separate frontend and backend applications.

```text
NotifyHub/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── .gitignore
└── README.md
```

The tree is a representative layout; update it if your current repository differs. The `.env` file should remain untracked and must never be committed with real secrets.

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- npm
- A MongoDB database or MongoDB Atlas connection
- [Git](https://git-scm.com/)

### 1. Clone the repository

Replace the placeholder URL with the actual GitHub repository URL.

```bash
git clone <your-repository-url>
cd NotifyHub
```

### 2. Configure the backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory. See [Environment Variables](#-environment-variables).

### 3. Start the backend

Run the development script defined in `server/package.json`. If the script is named `dev`, use:

```bash
npm run dev
```

The backend is configured to use port `5000` by default when the corresponding environment variable is set to that value.

### 4. Start the frontend

Open a second terminal at the project root:

```bash
cd client
npm install
npm run dev
```

Vite will print the local development URL in the terminal. Open that URL in your browser.

## 🔑 Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
```

Use your own MongoDB connection string and a strong, private JWT secret. Check the backend source code for any additional environment variables required by your implementation.

**Security reminders:**

- Never commit `.env` files or API keys.
- Keep production secrets out of source control.
- Use different secrets for development and production.

## 📡 API Overview

The following endpoints reflect the routes documented for the project so far. Verify the notification paths and HTTP methods against the current route files before relying on this table.

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/auth/profile` | Retrieve the authenticated user's profile |

### Notifications

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/notifications` | Retrieve notifications |
| POST | `/api/notifications` | Create a notification |
| PUT | `/api/notifications/:id` | Update a notification; verify the supported operation |

The notification API may also expose an unread-count endpoint and a mark-as-read operation. Confirm their exact paths and methods in `notificationRoutes.js` before documenting them.

Admin endpoints, including sending and broadcasting notifications, should be added here once their routes have been implemented and tested.

## 🔐 Authentication Flow

```text
User Registration / Login
          |
          v
Credentials Validated
          |
          v
JWT Issued
          |
          v
Client Sends Bearer Token
          |
          v
Authentication Middleware
          |
          v
Protected Resource Access
```

Protected requests use the JWT returned by the login endpoint.

In Postman, set the `Authorization` header to **Bearer Token** and provide the token returned by login.

## 🔔 Notification Flow

The intended notification flow is:

```text
Notification Event
        |
        v
Express API
        |
        v
Notification Stored in MongoDB
        |
        v
Socket.IO Event Emitted
        |
        v
Connected React Client
        |
        v
Notification UI Updated
```

The REST API and database operations form the current notification-management foundation. The complete real-time flow depends on resolving and verifying the Socket.IO connection.

## 🗺️ Development Roadmap

Progress should be updated as each feature is implemented and tested.

### Phase 1 — Project Setup

- [x] Initialize the MERN project structure
- [x] Configure the backend
- [x] Configure environment variables
- [x] Connect the backend to MongoDB

### Phase 2 — Authentication

- [x] User registration and login
- [x] Password hashing
- [x] JWT authentication
- [x] Protected profile endpoint
- [x] Authentication middleware

### Phase 3 — Notification Management

- [x] Create notifications
- [x] Retrieve notifications
- [x] Mark notifications as read
- [x] Retrieve unread notification count
- [ ] Verify remaining notification API operations
- [ ] Implement and test search and filtering
- [ ] Implement and test notification deletion

### Phase 4 — Real-Time Communication

- [x] Install Socket.IO and initialize server integration
- [ ] Resolve Socket.IO client connection errors
- [ ] Verify end-to-end event delivery
- [ ] Implement live notification updates
- [ ] Synchronize the notification counter

### Phase 5 — Administration

- [ ] Admin authorization and access control
- [ ] Admin dashboard
- [ ] Send and broadcast notifications
- [ ] User management
- [ ] Scheduled notifications

### Phase 6 — Advanced Features

- [ ] Email notifications
- [ ] Push notifications
- [ ] Redis caching
- [ ] RabbitMQ integration
- [ ] Docker containerization
- [ ] Deployment
- [ ] Notification analytics

## 🎯 Learning Objectives

NotifyHub is an opportunity to practice:

- Full-stack development with the MERN stack
- REST API design and implementation
- MongoDB data modeling with Mongoose
- JWT authentication and password security
- Middleware and modular backend architecture
- Real-time communication with Socket.IO
- API testing with Postman
- Git and GitHub workflows
- Progressive development and debugging

## 📸 Screenshots

Screenshots will be added as the frontend and notification experience develop.

## 🤝 Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes and test them.
4. Submit a pull request describing the changes.

For substantial changes, consider opening an issue first to discuss the proposal.

## 📄 License

This project is intended to use the MIT License. Add a `LICENSE` file containing the MIT License text before presenting the repository as formally licensed under MIT.

## 👨‍💻 Developer

**Rakesh Nayak**

Full-stack development enthusiast focused on the MERN stack, backend engineering, and building practical web applications.

- GitHub: [Rakesh000070](https://github.com/Rakesh000070)

---

If you find this project useful, consider giving the repository a ⭐ on GitHub.
