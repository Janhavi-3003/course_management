require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const initializeSocket = require("./config/socket");
const { seedOnStartup } = require("./scripts/seed");

const PORT = process.env.PORT || 5000;

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
  process.exit(1);
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});

async function startServer() {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing. Add it to backend/.env");
    }
    await connectDB();
    await seedOnStartup();

    const server = http.createServer(app);
    initializeSocket(server);
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // graceful shutdown: stop accepting requests, close MongoDB, then exit
    const shutdown = (signal) => {
      console.log(`${signal} received - shutting down gracefully`);
      server.close(async () => {
        await connectDB.disconnectDB().catch(() => {});
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10000).unref();
    };
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Unable to start server:", error.message);
    process.exit(1);
  }
}

startServer();
