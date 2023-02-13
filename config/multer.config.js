import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
})

export const multerConfig = multer({ storage })