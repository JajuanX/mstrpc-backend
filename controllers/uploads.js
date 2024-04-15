require("dotenv").config();
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const client = new S3Client({
	region: 'us-east-1',
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY,
		secretAccessKey: process.env.AWS_SECRET_KEY,
	}
});

const createUpload = async (req, res) => {
	const command = new PutObjectCommand({
		Body: 'Hello world', 
		Bucket: "driven-prod-bucket", 
		Key: "my-second-file.txt"
	})
	try {
		const response = await client.send(command);
		console.log(response);
		res.json(response)
	} catch (err) {
		res.status(500).json(err);
	}
};

module.exports = {
    createUpload,
};