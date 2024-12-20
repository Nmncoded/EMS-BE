require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const connectDatabase = require("./config/database");
const AgendaService = require("./services/agendaService");
const emailRoutes = require("./routes/emailRoutes");

const app = express();

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',  // local development frontend
    'https://email-marketing-sequence-psi.vercel.app',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors()); // Respond to preflight requests


app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`); 
  next();
});



// Routes
app.use("/", emailRoutes);

// Database and Agenda initialization
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Initialize Agenda Service
    await AgendaService.initialize();

    // Server setup
    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async () => {
      console.log('Shutting down gracefully...');
      await AgendaService.stop();
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();