import nodemailer from 'nodemailer'
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
	host: 'smtp.office365.com',
	port: 587,
	secure: false, 
	auth: {
		user: "admin@mstrpc.io",
		pass: process.env.LIVE_EMAIL,
	},
});

async function sendMail(message, to, subject) {
	// send mail with defined transport object
	const info = await transporter.sendMail({
		from: '"Jajuan @MSTRPC" <admin@mstrpc.io>', // sender address
		to: to, // list of receivers
		subject: subject, // Subject line
		html: message, // html body
	});

	console.log("Message sent: %s", info.messageId);
}

export default sendMail;

// {
// 	from: '"Maddison Foo Koch 👻" <admin@mstrpc.io>', // sender address
// 	to: "bar@example.com, baz@example.com", // list of receivers
// 	subject: "Hello ✔", // Subject line
// 	text: "Hello world?", // plain text body
// 	html: "<b>Hello world?</b>", // html body
// }