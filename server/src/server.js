const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const http = require("http");
const { Server } = require("socket.io");

// Import configurations
const config = require("./config/index.config");
const connectDB = require("./config/database.config");
const routes = require("./routes/index.routes");
const {
  globalErrorHandler,
  notFoundHandler,
} = require("./middleware/error.middleware");
const path = require("path");

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// init __dirname
const __dirname = path.resolve();

// Initialize WebSocket
io.on("connection", (socket) => {});

// ============================================
// Database Connection
// ============================================
connectDB();

// ============================================
// Security Middleware
// ============================================

// Helmet: Set security HTTP headers
app.use(helmet());

// CORS: Enable Cross-Origin Resource Sharing
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true, // Allow cookies
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ============================================
// Body Parsers & Cookie Parser
// ============================================
app.use(express.json({ limit: "10mb" })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies

// Data Sanitization against NoSQL Injection
app.use(mongoSanitize());

// ============================================
// Logging
// ============================================
app.use(morgan(config.env === "development" ? "dev" : "combined"));

// ============================================
// API Routes
// ============================================
app.use(`/api`, routes);

// ============================================
// Error Handling
// ============================================

// 404 Handler - Must come after all other routes
app.use(notFoundHandler);

// Global Error Handler - Must be last middleware
app.use(globalErrorHandler);

// ============================================
// Start Server
// ============================================
const PORT = config.port;

app.listen(PORT, () => {
  console.log("=".repeat(50));
  console.log(`🚀 Server running in ${config.env.toUpperCase()} mode`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
  console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
  console.log("=".repeat(50));
});

// ============================================
// Deployment
// ============================================
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "server/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
  });
}
// ============================================
// Graceful Shutdown
// ============================================
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise Rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

module.exports = app;
