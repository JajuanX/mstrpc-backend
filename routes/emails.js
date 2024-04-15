require("dotenv").config();
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const CLIENT_DOMAIN = process.env.CLIENT_DOMAIN;
const userSchema = require("../models/user");
const orderSchema = require("../models/order");
const { json } = require("body-parser");
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)


router.get("/", async (request, response) => {
	const msg = {
		to: `jajuan.burton@live.com`, // Change to your recipient
		from: 'jajuan.burton@live.com', // Change to your verified sender
		subject: 'Welcome to Masterpiece – You\'re In!',
		text: 'Welcome to Masterpiece! We\'re thrilled to have you on board.',
		html: `
			<div class="container">
				<h1>Welcome to Masterpiece, {{firstName}}!</h1>
				<p>Hello ,</p>
				<p>We're thrilled to have you on board. Your journey to discover and create stunning digital art begins now. At Masterpiece, we're committed to providing you with the tools and inspiration you need to unleash your creativity.</p>
				<p>To get started, why not explore our collection or upload your first creation? There's a whole community waiting to see what you'll bring to the table.</p>
				<p>If you have any questions or need assistance, feel free to reach out to our support team. We're here to help make your experience unforgettable.</p>
				<p>Thank you for joining us, and welcome to the family!</p>
				<p>Best Regards,<br>The Masterpiece Team</p>
				<div class="footer">
					<p>Follow us on <a href="https://example.com/social">Social Media</a></p>
					<p>Unsubscribe | Privacy Policy</p>
				</div>
			</div>
		`
	}
	sgMail
		.send(msg)
		.then(() => {
			console.log('Email sent')
			response.send('success')
		})
		.catch((error) => {
			console.error(error)
		})
});




module.exports = router;
