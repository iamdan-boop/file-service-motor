import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client'


const PAGINATION_DEFAULT_PER_PAGE = 10;

const s3Storage = new S3Client({ region: process.env.AWS_REGION })
const prisma = new PrismaClient()


export async function paginate(req, res) {
    const currentPage = Math.max(Number(req.query['page'] || 1), 1)

    const options = {
        take: Number(req.query['limit']) ?? PAGINATION_DEFAULT_PER_PAGE,
        skip: req.query['page'] ? (currentPage - 1) * PAGINATION_DEFAULT_PER_PAGE : 0
    }

    return res.status(200).json(await prisma.publicfile.findMany(options))
}


export async function findOne(req, res) {
    const publicFile = await prisma.publicfile.findFirst({
        where: { id: req.params.uploadId }
    })

    if (!publicFile) return res.status(404).json({ mesage: 'File not found.' })
    await s3Storage.send(
        new GetObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: publicFile.bucketPath })
    ).then(s3Object => s3Object.Body?.pipe(res))
}


export async function create(req, res) {
    try {
        const params = req.files?.map(file => {
            const bucketPath = `uploads/${file.originalname}`
            return {
                fileInfo: {
                    bucketPath,
                    filename: file.originalname,
                    mimeType: file.mimetype,
                },
                storageInfo: {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: bucketPath,
                    ContentType: file.mimetype,
                    Body: file.buffer
                }
            }
        })


        await Promise.all([
            params.map(async (configs) => s3Storage.send(new PutObjectCommand(configs.storageInfo))),
            prisma.publicfile.createMany({
                data: params.map((file) => file.fileInfo)
            })
        ])

        return res.status(200).json({
            message: 'Uploaded Successfully',
        })

    } catch (e) {
        return res.status(500).json({
            message: 'Server error',
            error: e.message
        })
    }
}


export async function deleteOne(req, res) {
    const publicFile = await prisma.publicfile.findFirst({
        where: { id: req.params['uploadId'] }
    })

    if (!publicFile) return res.status(404).json({ message: 'Not found' })

    try {
        await s3Storage.send(
            new DeleteObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: publicFile.bucketPath })
        ).then(async _ => await prisma.publicfile.delete({ where: { id: publicFile.id } }))

        return res.status(201).json({ message: 'Successfully Deleted.' });
    } catch (e) {
        return res.status(503).json({
            message: 'Server error ' + e.message,
        })
    }
}