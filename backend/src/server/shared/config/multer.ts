import multer from "multer";

// memory storage to keep file in buffer
export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 8 * 1024 * 1024  // 8MB
    },
    fileFilter: (req, file, callback) => {
        const mimeType = ["image/jpg", "image/jpeg", "image/png"];
        if (!mimeType.includes(file.mimetype)) {
            return callback(null, false);
        }
        callback(null, true);
    },
});