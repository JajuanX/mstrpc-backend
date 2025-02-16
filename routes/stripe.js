import express from 'express';
import stripeModule from 'stripe';
import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';
import userSchema from '../models/user.js';
import orderSchema from '../models/order.js';

dotenv.config();

const router = express.Router();
const stripe = stripeModule(process.env.STRIPE_SECRET_KEY);
const CLIENT_DOMAIN = process.env.CLIENT_DOMAIN;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Webhook endpoint
router.post(
	'/webhook',
	express.raw({ type: 'application/json' }),
	async (req, res) => {
		let event = req.body;
		const endpointSecret = process.env.STRIPE_WEBHOOK;

		if (endpointSecret) {
			const signature = req.headers['stripe-signature'];
			try {
				event = stripe.webhooks.constructEvent(
					req.body,
					signature,
					endpointSecret
				);
			} catch (err) {
				console.error('Webhook signature verification failed:', err.message);
				return res.sendStatus(400);
			}
		}

		// Handle events
		try {
			switch (event.type) {
				case 'customer.subscription.deleted':
					const subscriptionDeleted = event.data.object;
					await userSchema.findOneAndUpdate(
						{ email: subscriptionDeleted.customer_email },
						{ subscriptionStatus: 'deleted' },
						{ new: true }
					);
					break;

				case 'invoice.payment_succeeded':
					const invoiceSucceeded = event.data.object;
					const user = await userSchema.findOneAndUpdate(
						{ email: invoiceSucceeded.customer_email },
						{
							subscriptionStatus: 'active',
							customer: invoiceSucceeded.customer,
						},
						{ new: true }
					);

					if (user) {
						const msg = {
							to: user.email,
							from: 'test@example.com',
							subject: "Welcome to Masterpiece – You're In!",
							html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                  <h1>Welcome to Masterpiece, ${user.name.firstName}!</h1>
                  <p>Your journey to stunning digital art starts here.</p>
                  <p>Thank you for joining us!</p>
                  <footer style="text-align: center; margin-top: 20px;">
                    <p><a href="https://example.com/privacy">Privacy Policy</a></p>
                  </footer>
                </div>
              `,
						};
						await sgMail.send(msg);
					}
					break;

				case 'invoice.payment_failed':
					const invoiceFailed = event.data.object;
					await userSchema.findOneAndUpdate(
						{ email: invoiceFailed.customer_email },
						{ subscriptionStatus: 'past_due' },
						{ new: true }
					);
					break;

				case 'checkout.session.completed':
					const session = event.data.object;
					if (session.subscription) {
						await userSchema.findOneAndUpdate(
							{ email: session.customer_email },
							{ subscriptionStatus: 'active' },
							{ new: true }
						);
					} else {
						await orderSchema.findOneAndUpdate(
							{ sessionId: session.id },
							{ status: 'completed' },
							{ new: true }
						);
					}
					break;

				default:
					console.error(`Unhandled event type ${event.type}.`);
			}

			res.status(200).send('success');
		} catch (error) {
			console.error('Error handling webhook event:', error);
			res.status(500).send('Internal Server Error');
		}
	}
);

// Create Checkout Session
router.post('/create-checkout-session', async (req, res) => {
	try {
		const prices = await stripe.prices.list({ limit: 3 });
		const session = await stripe.checkout.sessions.create({
			billing_address_collection: 'auto',
			customer_email: req.body.email,
			metadata: { _id: req.body._id },
			line_items: [
				{
					price: prices.data[0].id,
					quantity: 20,
				},
			],
			mode: 'subscription',
			success_url: `${CLIENT_DOMAIN}/${req.body.username}?success=true&session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${CLIENT_DOMAIN}/${req.body.username}?canceled=true`,
			automatic_tax: { enabled: true },
		});

		await userSchema.findOneAndUpdate(
			{ _id: req.body._id },
			{ session_id: session.id },
			{ new: true }
		);

		res.json({ url: session.url });
	} catch (error) {
		console.error('Error creating checkout session:', error);
		res.status(500).send('Failed to create checkout session');
	}
});

// Create Billing Portal Session
router.post('/create-portal-session', async (req, res) => {
	try {
		const { session_id, customer } = req.body;
		const portalSession = await stripe.billingPortal.sessions.create({
			customer,
			return_url: CLIENT_DOMAIN,
		});

		res.json({ url: portalSession.url });
	} catch (error) {
		console.error('Error creating portal session:', error);
		res.status(500).send('Failed to create portal session');
	}
});

export default router;
