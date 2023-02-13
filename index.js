import dotenv from 'dotenv';
dotenv.config()

import express from 'express';
import { findOne, paginate, create, deleteOne } from './service/s3Service.js';
import { multerConfig } from './config/multer.config.js';

const app = express()

app.use((req, res, next) => {
    const authorizationKey = req.get('X-Authorization-Key');
    if (!authorizationKey || authorizationKey !== process.env.APPLICATION_KEY_REQUEST) {
        return res.status(403).json({ message: 'Unauthorized' })
    }
    next()
})

app.post('/upload', multerConfig.array('files', 10), create)
app.get('/upload', paginate)
app.get('/upload/:uploadId', findOne)
app.delete('/upload/:uploadId', deleteOne)

app.listen(4000, () => console.log('Server is running'))