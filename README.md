# Real-Time Polling System

A real-time polling and chat application where a teacher can create live questions and students can answer instantly.  
Built using **Node.js, Express, Socket.IO, MongoDB** on the backend and **React, Tailwind CSS** on the frontend.

---

## 🔗 Live Links

- **Frontend:** https://real-time-polling-system-frontend.vercel.app/
- **Backend:** https://real-time-polling-system-1.onrender.com/

---

## 🚀 Features

- Real-time polling using Socket.IO
- Live results update for teacher and students
- Automatic timeout handling (unanswered students are treated as answered)
- Teacher cannot create next question until current one finishes
- Real-time chat between teacher and students
- Students only see live questions (no old questions)
- Teacher disconnect automatically ends the current question

---

## 🖥️ Run Locally

### 1️⃣ Clone the repository

```bash
git clone https://github.com/chandankumarm55/Real-Time-Polling-System.git
cd Real-Time-Polling-System
```

### 2️⃣ Backend Setup

Create a `.env` file inside the `server` folder:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://chandan:chandan228@cluster0.tvto3to.mongodb.net/
```

Install dependencies and start server:

```bash
cd server
npm install
npm run dev
```

Backend will run at:

```
http://localhost:5000
```

### 3️⃣ Frontend Setup

Create a `.env` file inside the `client` folder:

```env
VITE_SOCKET_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000/api
```

Install dependencies and start frontend:

```bash
cd client
npm install
npm run dev
```

Frontend will run at:

```
http://localhost:5173
```

---


## 👨‍💻 Author

**Chandan Kumar**  
GitHub: [chandankumarm55](https://github.com/chandankumarm55)

---

## ⭐ Support

If you like this project, feel free to star the repository ⭐
