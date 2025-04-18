const express = require("express");
const mongoose = require("mongoose");
const https = require("https");
const fs = require("fs");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const bcrypt = require("bcrypt");
const logger = require("./logger");
const authRoutes = require("./routes/auth");
const coursesRoutes = require("./routes/courses");
const contactRoutes = require("./routes/contact");
const teachersRoutes = require("./routes/teachers");
const reviewsRoutes = require("./routes/reviews");
const uploadRoutes = require("./routes/upload");
const advantagesRoutes = require("./routes/advantages");
const studentReviewsRoutes = require("./routes/studentReviews");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const User = require("./models/User");
const { log } = require("console");
require("dotenv").config();

const app = express();

// Sertifikatlarni yuklash
const privateKey = fs.readFileSync("localhost-key.pem", "utf8");
const certificate = fs.readFileSync("localhost-cert.pem", "utf8");
const credentials = { key: privateKey, cert: certificate };

// Middleware
app.use(helmet());
app.use(cors());
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger sozlamalari
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Edukatsiya Platformasi API",
      version: "1.0.0",
      description:
        "Node.js bilan yozilgan edukatsiya platformasi uchun API hujjatlari",
    },
    servers: [
      {
        url: "https://localhost:5000/api",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Review: {
          type: "object",
          properties: {
            course: {
              type: "string",
              description: "Kurs ID (ObjectId)",
            },
            user: {
              type: "string",
              description: "Foydalanuvchi emaili",
            },
            comment: {
              type: "string",
              description: "Sharh matni",
            },
            rating: {
              type: "number",
              description: "Reyting (1-5)",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Yaratilgan vaqt",
            },
          },
          required: ["course", "user", "comment", "rating"],
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Root yo‘nalishi
app.get("/", (req, res) => {
  res.send("Salom! Edukatsiya platformasiga xush kelibsiz!");
});

// MongoDB ulanish
const mongoURI =
  process.env.MONGO_URI ||
  "//mongodb+srv://miko:miko2007@cluster0.tqdfc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose
  .connect(mongoURI)
  .then(async () => {
    logger.info("MongoDBga ulandi");
    const adminEmail = "admin@example.com";
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("Admin1234", 10);
      await User.create({
        email: adminEmail,
        password: hashedPassword,
        name: "Admin User",
        role: "admin",
      });
      logger.info("Admin foydalanuvchi yaratildi");
    }
  })
  .catch((err) => logger.error("MongoDB ulanish xatosi:", err));

// API routelari
app.use("/api/auth", authRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/teachers", teachersRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/advantages", advantagesRoutes);
app.use("/api/studentReviews", studentReviewsRoutes);

// 404 xatolik middleware
app.use((req, res, next) => {
  res
    .status(404)
    .json({ error: `Marshrut topilmadi: ${req.method} ${req.url}` });
});

// Global xatolik middleware
app.use((err, req, res, next) => {
  logger.error(`Xatolik yuz berdi: ${err.stack}`);
  res.status(500).json({ error: "Server xatosi", message: err.message });
});

// HTTPS serverni ishga tushirish
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`HTTPS Server https://localhost:${PORT} da ishlamoqda`);
});

//mongodb+srv://miko:miko2007@cluster0.tqdfc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
