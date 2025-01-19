import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createStripeCustomer = async (req, res, next) => {
	const {
		name: { firstName, lastName },
		email,
	} = req.body;

	if (!firstName || !lastName || !email) {
		return res.status(400).send('Missing required fields: firstName, lastName, or email');
	}

	try {
		const customer = await stripe.customers.create({
			email,
			name: `${firstName} ${lastName}`,
		});

		req.stripe = customer;
		next();
	} catch (err) {
		console.error('Error creating Stripe customer:', err);
		res.status(500).send('Failed to create Stripe profile');
	}
};

export default createStripeCustomer;
