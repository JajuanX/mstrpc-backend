import dotenv from 'dotenv';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

dotenv.config();

const client = new S3Client({
	region: 'us-east-1',
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY,
		secretAccessKey: process.env.AWS_SECRET_KEY,
	},
});

export const createUpload = async (req, res) => {
	const command = new PutObjectCommand({
		Body: 'Hello world',
		Bucket: 'driven-prod-bucket',
		Key: 'my-second-file.txt',
	});

	try {
		const response = await client.send(command);
		console.log(response);
		res.json(response);
	} catch (err) {
		console.error('Error uploading to S3:', err);
		res.status(500).json({ error: 'Failed to upload file', details: err });
	}
};
