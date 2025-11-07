import express from "express"
import cors from "cors"
import path from "path"
import { connectDB } from "./connect"
import router from "./routes/index"
import config from "./config"

const app = express()

const allowedOrigins = [
  "http://localhost:5173",
  "https://postcards-from-nowhere.netlify.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }))

const uploadDir = config.UPLOAD_DIR
app.use("/uploads", express.static(path.resolve(uploadDir)))

app.use("/api/postcards", router)

connectDB(config.MONGO_URI)
  .then(() => {
    app.listen(config.PORT, () => {
      console.log(`✅ Server listening on http://localhost:${config.PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed", err);
    process.exit(1);
  });