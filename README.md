# 🚀 NotifyHub – Real-Time Event-Driven Notification System

<p align="center">
  <img src="https://img.shields.io/badge/Status-In%20Development-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/MERN-Full%20Stack-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Socket.io-Real--Time-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-red?style=for-the-badge" />
</p>

---

## 📌 Overview

**NotifyHub** is a scalable **Real-Time Event-Driven Notification Platform** built using the **MERN Stack**. The application enables users to receive instant notifications triggered by various system events without refreshing the page.

The project follows a modular backend architecture and demonstrates modern software engineering concepts including **REST APIs**, **real-time communication**, **authentication**, **event-driven architecture**, and **cloud deployment**.

This project is being developed as a production-ready application to showcase full-stack development and backend engineering skills.

---

## ✨ Key Features

### 👤 User Features

- User Registration & Login
- Secure JWT Authentication
- User Dashboard
- Real-Time Notifications
- Notification History
- Mark Notifications as Read
- Delete Notifications
- Search Notifications
- Filter Notifications
- Responsive User Interface

---

### 👨‍💼 Admin Features

- Admin Authentication
- Send Notifications
- Broadcast Notifications
- User Management
- Scheduled Notifications
- Notification Analytics (Upcoming)

---

### ⚡ Real-Time Features

- Instant Notification Delivery
- Live Notification Counter
- Real-Time Notification Bell
- Socket.io Integration
- Auto Update without Page Refresh

---

## 🏗️ System Architecture

```
                User Browser (React)

                       │
                       │
              Socket.io Client
                       │
                       ▼
      Express.js + Node.js Backend
              │              │
              │              │
        MongoDB Atlas    Socket.io Server
              │
              ▼
      Notification Database
```

---

## 🛠️ Tech Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- React Router DOM
- Axios

### Backend

- Node.js
- Express.js

### Database

- MongoDB Atlas
- Mongoose

### Authentication

- JWT
- bcryptjs

### Real-Time Communication

- Socket.io

### Future Technologies

- RabbitMQ
- Redis
- Docker
- Cloudinary
- Nodemailer
- Firebase Cloud Messaging
- AWS

---

## 📁 Project Structure

```
NotifyHub
│
├── client
│   ├── public
│   ├── src
│   │   ├── assets
│   │   ├── components
│   │   ├── context
│   │   ├── hooks
│   │   ├── layouts
│   │   ├── pages
│   │   ├── services
│   │   ├── utils
│   │   ├── App.jsx
│   │   └── main.jsx
│
├── server
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   ├── socket
│   ├── utils
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## 🚀 Current Development Roadmap

### ✅ Phase 1 — Project Setup

- [x] MERN Project Initialization
- [x] Backend Structure
- [x] Frontend Structure
- [x] Environment Configuration

---

### 🚧 Phase 2 — Authentication

- [ ] User Registration
- [ ] User Login
- [ ] JWT Authentication
- [ ] Password Encryption
- [ ] Protected Routes

---

### 🚧 Phase 3 — Notification Module

- [ ] Create Notification
- [ ] View Notifications
- [ ] Delete Notification
- [ ] Mark as Read
- [ ] Search & Filter

---

### 🚧 Phase 4 — Real-Time Communication

- [ ] Socket.io Server
- [ ] Socket.io Client
- [ ] Live Notification Updates
- [ ] Notification Counter

---

### 🚧 Phase 5 — Admin Dashboard

- [ ] Admin Login
- [ ] Broadcast Notifications
- [ ] User Management
- [ ] Scheduled Notifications

---

### 🚧 Phase 6 — Advanced Features

- [ ] RabbitMQ
- [ ] Redis Cache
- [ ] Docker
- [ ] Email Notifications
- [ ] Push Notifications
- [ ] Deployment

---

## 📡 REST API Endpoints

### Authentication

```
POST   /api/auth/register

POST   /api/auth/login
```

---

### Notifications

```
GET    /api/notifications

POST   /api/notifications

PUT    /api/notifications/:id

DELETE /api/notifications/:id
```

---

### Admin

```
POST   /api/admin/send

POST   /api/admin/broadcast
```

---

## 🔐 Authentication Flow

```
User

↓

Register / Login

↓

JWT Token Generated

↓

Protected APIs

↓

Authorized Access
```

---

## ⚡ Notification Flow

```
Admin

↓

Send Notification

↓

Express API

↓

MongoDB

↓

Socket.io

↓

React Client

↓

Notification Appears Instantly
```

---

## 📦 Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/NotifyHub.git
```

---

### Frontend

```bash
cd client
npm install
npm run dev
```

---

### Backend

```bash
cd server
npm install
npm run dev
```

---

## 🌍 Environment Variables

Create a `.env` file inside the **server** folder.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
```

---

## 🎯 Learning Objectives

This project demonstrates practical experience with:

- Full Stack Development
- REST API Development
- MongoDB Database Design
- JWT Authentication
- Socket.io
- Event-Driven Architecture
- Secure Backend Development
- Scalable Application Design
- Production Folder Structure
- Git & GitHub Workflow

---

## 📸 Screenshots

> Screenshots will be added as development progresses.

---

## 🚀 Future Improvements

- RabbitMQ Event Queue
- Redis Caching
- Email Notifications
- Push Notifications
- SMS Notifications
- Docker Deployment
- Kubernetes
- AWS Deployment
- Notification Analytics
- Microservices Architecture

---

## 🤝 Contributing

Contributions are welcome!

If you have suggestions or improvements, feel free to fork the repository and submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Developer

**Rakesh Nayak**

- 💼 Full Stack Developer
- 🌐 Passionate about MERN Stack & Backend Development
- 🚀 Building scalable web applications

---

⭐ If you like this project, don't forget to **Star** the repository!
