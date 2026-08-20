const express = require("express");
const compression = require("compression");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const http = require("http");

const env = require("./env.js");
const port = env.PORT;

const appRouter = require("./src/routers");

const notFoundMiddleware = require("./src/middlewares/not-found");
const errorHandlerMiddleware = require("./src/middlewares/error-handler");
const { checkDatabaseConnection, ensureSchema } = require("./src/models/db");
const { seedMemoryStore } = require("./src/models/memoryStore");
const { seedDatabase } = require("./src/models/seed");

const app = express();
const server = http.createServer(app);

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  helmet({
    // This is a JSON API served over HTTP in DEV. Helmet's defaults add
    // HSTS + upgrade-insecure-requests, which makes browsers refuse to
    // load http://host:5050 responses ("failed to load response data").
    contentSecurityPolicy: false,
    strictTransportSecurity: false,
    crossOriginOpenerPolicy: false,
    originAgentCluster: false,
  })
);

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

const allowedOrigins = env.ALLOWED_ORIGINS
  ? env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [];

app.use(
  cors({
    origin:
      allowedOrigins.includes("*") || allowedOrigins.length === 0
        ? true
        : allowedOrigins,
    exposedHeaders: ["pepper"],
  })
);

app.use(xss());
app.use(rateLimit({ windowMs: 60 * 1000, max: 10000 }));
app.use(compression());

app.use("/assets", express.static("assets"));

// Associate-style gated media:
// GET /uploads/artists/...?authToken=<uploadJwt>
const { verifyJWTUploads } = require("./src/utils/jwt");
app.use(
  "/uploads",
  (req, res, next) => {
    const { authToken } = req.query;
    if (!verifyJWTUploads(authToken)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    return next();
  },
  express.static("uploads")
);

app.use("/logs", express.static("logs"));

app.use(morgan("tiny"));

app.use(
  fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 },
  })
);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Artist Booking API is running",
    environment: env.ENVIRONMENT,
    memoryStore: !!env.USE_MEMORY_STORE,
  });
});

app.use("/api", appRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

server.listen(port, async () => {
  if (env.USE_MEMORY_STORE) {
    seedMemoryStore();
    console.log("✅ Memory store ready");
  } else {
    await checkDatabaseConnection();
    try {
      await ensureSchema();
      await seedDatabase();
    } catch (error) {
      console.error("❌ Database seed failed:", error.message);
    }
  }
  console.log(`✅ Artist Backend started at PORT ${port}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    throw new Error(
      `Port ${port} is already in use. Please choose a different port.`
    );
  }
  throw new Error(
    `An error occurred while starting the server: ${error.message}`
  );
});

module.exports = app;
