import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const upload = multer({
    storage: multer.diskStorage({
        destination: path.join(__dirname, "..", "uploads"),
        filename(req, file, callback) {
            callback(null, `${Date.now()}-${file.originalname}`);
        },
    }),
    limits: {
        fileSize: 8 * 1024 * 1024
    },
    fileFilter: (req, file, callback) => {
        const mimeType = ["image/jpg", "image/jpeg", "image/png"];

        if(!mimeType.includes(file.mimetype)){
            return callback(null, false);
        }
        callback(null, true) ;
    },
});

export default upload;