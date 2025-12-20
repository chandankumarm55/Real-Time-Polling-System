require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const socketHandler = require('./utils/socketHandler');

// Import routes
const questionRoutes = require('./routes/questionRoutes');
const studentRoutes = require('./routes/studentRoutes');
const chatRoutes = require('./routes/chatRoutes');

// Initialize app
const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// CORS allowed origins - ADD YOUR VERCEL URL HERE
const allowedOrigins = [
    'https://real-time-polling-system-frontend.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'https://real-time-polling-system-frontend-*.vercel.app', // Preview deployments
];

// Socket.io configuration with CORS
const io = socketIo(server, {
    cors: {
        origin: function(origin, callback) {
            // Allow requests with no origin (mobile apps, Postman, etc.)
            if (!origin) return callback(null, true);

            // Check if origin matches any allowed pattern
            const isAllowed = allowedOrigins.some(allowed => {
                if (allowed.includes('*')) {
                    // Handle wildcard patterns
                    const regex = new RegExp(allowed.replace('*', '.*'));
                    return regex.test(origin);
                }
                return allowed === origin;
            });

            if (isAllowed) {
                callback(null, true);
            } else {
                console.log('❌ Blocked by CORS:', origin);
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
    },
});

// Initialize socket handler
socketHandler(io);

// Express CORS middleware - MUST BE BEFORE ROUTES
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        // Check if origin matches any allowed pattern
        const isAllowed = allowedOrigins.some(allowed => {
            if (allowed.includes('*')) {
                const regex = new RegExp(allowed.replace('*', '.*'));
                return regex.test(origin);
            }
            return allowed === origin;
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            console.log('❌ Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight requests
app.options('*', cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - Origin: ${req.get('origin') || 'none'}`);
    next();
});

// Routes
app.use('/api/questions', questionRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/chat', chatRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        cors: 'enabled',
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Intervue Poll API',
        version: '1.0.0',
        cors: 'enabled',
    });
});

// Error handler
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`
  ╔═══════════════════════════════════════╗
  ║   Intervue Poll Server Running        ║
  ║   Port: ${PORT}                       ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}            ║
  ║   CORS: Enabled                       ║
  ╚═══════════════════════════════════════╝
  `);
    console.log(`API: http://localhost:${PORT}/api`);
    console.log(`Socket.io: Connected and listening`);
    console.log(`Allowed origins:`, allowedOrigins);
});