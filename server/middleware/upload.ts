import multer from "multer"
import path from "path"
import fs from "fs"

const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9)
        const ext = path.extname(file.originalname || ".jpg")
        cb(null, `${unique}${ext}`) 
    }
})

export const upload = multer({
    storage,
    limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
    fileFilter: (_req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif/;
        const ok = allowed.test(file.mimetype);
        //cb(ok ? null : new Error("Unsupported file type"), ok);
    },
});