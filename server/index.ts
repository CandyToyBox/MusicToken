import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initDb } from "./db";
import { StorageFactory } from "./storage-factory";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize the database
  try {
    const dbConnected = await initDb();
    StorageFactory.setDatabaseConnected(dbConnected);
    if (dbConnected) {
      log("Successfully connected to the database", "database");
      
      // Push the database schema
      if (process.env.NODE_ENV === "development") {
        try {
          const { exec } = await import("child_process");
          exec("npm run db:push", (error, stdout, stderr) => {
            if (error) {
              log(`Error running database migration: ${error.message}`, "database");
              return;
            }
            if (stderr) {
              log(`Database migration warning: ${stderr}`, "database");
              return;
            }
            log(`Database migration completed: ${stdout}`, "database");
          });
        } catch (error) {
          log("Error running database migration script", "database");
          console.error(error);
        }
      }
    } else {
      log("Warning: Database connection failed, using fallback storage", "database");
    }
  } catch (error) {
    StorageFactory.setDatabaseConnected(false);
    log("Warning: Database initialization failed, using fallback storage", "database");
    console.error(error);
  }
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
