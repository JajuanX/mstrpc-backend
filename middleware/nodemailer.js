import nodemailer from 'nodemailer'
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 587,
	secure: false, // false for STARTTLS
	auth: {
		user: 'mstrpcmail@gmail.com',
		pass: process.env.GMAIL_APP_PASSWORD, // Must use App Password, not regular password
	},
	tls: {
		rejectUnauthorized: false, // Bypass self-signed certificate issues if needed
	},
});
async function sendMail(message, to, subject) {
	// send mail with defined transport object
	const info = await transporter.sendMail({
		from: 'mstrpcmail@gmail.com', // sender address
		to: to, // list of receivers
		subject: subject, // Subject line
		html: message, // html body
	});

	console.info("Message sent: %s", info.messageId);
}

export default sendMail;