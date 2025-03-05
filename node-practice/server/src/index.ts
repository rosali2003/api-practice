import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import { authRouter } from "./routes/authRoutes.js";
import { taskRouter } from "./routes/taskRoutes.js";
import { initDb } from "./db/index.js";

const app = express();
dotenv.config();

// Initialize database before starting the server
initDb()
  .then(() => {
    // Middleware
    app.use(
      cors({
        origin: "http://localhost:3000",
        credentials: true,
      })
    );
    app.use(express.json());

    // Session configuration
    app.use(
      session({
        secret: process.env.SESSION_SECRET || "your-secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: process.env.NODE_ENV === "production",
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        },
      })
    );

    // Routes
    app.use("/api/auth", authRouter);
    app.use("/api/tasks", taskRouter);

    // Error handling middleware
    app.use((err: any, req: Request, res: Response, next: any) => {
      console.error(err.stack);
      res.status(500).json({ message: "Something broke!" });
    });

    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Handle graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM signal received: closing HTTP server");
      server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
      });
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  });
