import dotenv from "dotenv";
dotenv.config();

interface Config {
    PORT: number,
    UPLOAD_DIR: string;
    BASE_URL: string;
    FRONTEND_URL: string;
    MONGO_URI: string
}

const { PORT = "4000", UPLOAD_DIR = "./uploads", BASE_URL = "http://localhost:4000", FRONTEND_URL = "http://localhost:5173", MONGO_URI = "", DB_USER, DB_PASSWORD, DB_HOST, DB_NAME } = process.env as Record<string, string | undefined>

let mongoUri = (MONGO_URI || "").trim()

if (!mongoUri) {
    if (DB_USER && DB_PASSWORD && DB_HOST && DB_NAME) {
        mongoUri = `mongodb+srv://${encodeURIComponent(DB_USER)}:${encodeURIComponent(
        DB_PASSWORD
        )}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`;
    } else {
        mongoUri = "mongodb://localhost:27017/postcards_dev";
        console.warn("⚠️  No MONGO_URI provided – falling back to local MongoDB:", mongoUri);
    }
}

const config: Config = {
    PORT: Number(PORT),
    UPLOAD_DIR,
    BASE_URL,
    FRONTEND_URL,
    MONGO_URI: mongoUri
}

export default config