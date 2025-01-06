require("dotenv").config();
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const CLIENT_DOMAIN = process.env.CLIENT_DOMAIN;
const userSchema = require("../models/user");
const orderSchema = require("../models/order");
const { json } = require("body-parser");
const sgMail = require('@sendgrid/mail')


router.post("/webhook", express.raw({ type: "application/json" }), async (request, response) => {
    let event = request.body;
    const endpointSecret = process.env.STRIPE_WEBHOOK;
    if (endpointSecret) {
		const signature = request.headers["stripe-signature"];
		try {
			event = stripe.webhooks.constructEvent(
			request.body,
			signature,
			endpointSecret
			);
		} catch (err) {
			console.log(`⚠️  Webhook signature verification failed.`, err.message);
			return response.sendStatus(400);
		}	
    }

    // Handle the event
    switch (event.type) {
		case "customer.subscription.deleted":
			const subscriptionDeleted = event.data.object;
			// Update user subscription status in your DB
			await userSchema.findOneAndUpdate(
			{ email: subscriptionDeleted.customer_email },
			{ subscriptionStatus: "deleted" },
			{ new: true }
			);
			break;

		case "invoice.payment_succeeded":
			const invoiceSucceeded = event.data.object;
			console.log('event', event.data);
			console.log('Meta', invoiceSucceeded.customer_email);
			console.log('invoice', invoiceSucceeded);
			// Handle successful payment, e.g., update subscription status or record payment
			const user = await userSchema.findOneAndUpdate(
			{ email: invoiceSucceeded.customer_email },
			{ 	
				subscriptionStatus: "active",
				customer: invoiceSucceeded.customer,
			}, // Or any other relevant action
			{ new: true }
			);
			console.log('user', user);

			sgMail.setApiKey(process.env.SENDGRID_API_KEY)
			const msg = {
				to: `${user.email}`, // Change to your recipient
				from: 'test@example.com', // Change to your verified sender
				subject: 'Welcome to Masterpiece – You\'re In!',
				text: 'Welcome to Masterpiece! We\'re thrilled to have you on board.',
				html: `
				<!DOCTYPE html>
				<html lang="en">
				<head>
					<meta charset="UTF-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<title>Welcome to Masterpiece</title>
					<style>
						body {
							font-family: Arial, sans-serif;
							margin: 0;
							padding: 20px;
							background-color: #f4f4f4;
							color: #333;
						}
						.container {
							background-color: #fff;
							padding: 20px;
							max-width: 600px;
							margin: auto;
							border-radius: 8px;
							box-shadow: 0 0 10px rgba(0,0,0,0.1);
						}
						h1 {
							color: #007bff;
						}
						a {
							color: #007bff;
							text-decoration: none;
						}
						.footer {
							margin-top: 20px;
							font-size: 12px;
							text-align: center;
							color: #666;
						}
					</style>
				</head>
				<body>
					<div class="container">
						<h1>Welcome to Masterpiece, {{firstName}}!</h1>
						<p>Hello ${user.name.firstName},</p>
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
				</body>
				</html>
				`
			}
			sgMail
				.send(msg)
				.then(() => {
					console.log('Email sent')
				})
				.catch((error) => {
					console.error(error)
				})
			break;

		case "invoice.payment_failed":
			const invoiceFailed = event.data.object;
			// Handle failed payment, e.g., notify user, retry payment, etc.
			await userSchema.findOneAndUpdate(
			{ email: invoiceFailed.customer_email },
			{ subscriptionStatus: "past_due" }, // Or any other relevant action
			{ new: true }
			);
			break;

		case "checkout.session.completed":
			const session = event.data.object;
			// Handle session completion, e.g., update order status, confirm subscription, etc.
			if (session.subscription) {
			// If it's a subscription
			await userSchema.findOneAndUpdate(
				{ email: session.customer_email },
				{ subscriptionStatus: "active" },
				{ new: true }
			);
			} else {
			// If it's a one-time purchase
			await orderSchema.findOneAndUpdate(
				{ sessionId: session.id },
				{ status: "completed" },
				{ new: true }
			);
			}
			break;

		default:
			console.log(`Unhandled event type ${event.type}.`);
		}

		// Return a 200 response to acknowledge receipt of the event
		response.send('success');
	}
);

router.use(json());

router.post("/create-checkout-session", async (req, res) => {
	console.log(req.body);
	const prices = await stripe.prices.list({
		limit: 3,
	});
	const session = await stripe.checkout.sessions.create({
		billing_address_collection: "auto",
		customer_email: req.body.email,
		metadata: {
			_id: req.body._id,
			},
		line_items: [
		{
			price: prices.data[0].id,
			// For metered billing, do not pass quantity
			quantity: 20,
		},
		],
		mode: "subscription",
		success_url: `${CLIENT_DOMAIN}/${req.body.username}?success=true&session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${CLIENT_DOMAIN}/${req.body.username}?canceled=true`,
		automatic_tax: { enabled: true },
	});
	console.log(session);
	const sessionId = session.id;
	await userSchema.findOneAndUpdate(
		{ _id: req.body._id },
		{ session_id: sessionId },
		{ new: true }
	);
	// todo: Save session ID to user in database so we know if thepayment was successful
	console.log(session.url);
	res.json({ url: session.url });
});

router.post("/create-portal-session", async (req, res) => {
	// For demonstration purposes, we're using the Checkout session to retrieve the customer ID.
	// Typically this is stored alongside the authenticated user in your database.
	const { session_id, customer } = req.body;
	console.log(req.body);
	const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

	// This is the url to which the customer will be redirected when they are done
	// managing their billing with the portal.
	const returnUrl = CLIENT_DOMAIN;

	const portalSession = await stripe.billingPortal.sessions.create({
		customer: customer,
		return_url: returnUrl,
	});

	res.json({url: portalSession.url});
});


module.exports = router;
