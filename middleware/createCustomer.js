const stripe = require("stripe")(
	"sk_test_51Okqm4KnzwpcmEsu0WwsbFHzY9xwP7muMKWJcnk8vgyOYV6HawI2NrYSYUGf1kgvwJ5xXZdNHQFu4ZXo55lWQPNF00SSy21P2G"
);

module.exports = async (req, res, next) => {
	const {
		name: { firstName, lastName },
		email,
		username,
		password,
		image_url,
	} = req.body;


	try {
		const customer = await stripe.customers.create({
			email: email,
			name: `${firstName} ${lastName}`,
		});
		req.stripe = customer
		next()		
	} catch (err) {
		console.log('Error creating customer:', err);
		res.status(500).send("Failed to create stripe profile");
	}
};