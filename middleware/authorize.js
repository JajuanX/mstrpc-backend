import jwt from 'jsonwebtoken';
import userSchema from '../models/user.js';

const authenticate = async (req, res, next) => {
	const bearerTokenString = req.headers.authorization;

	if (!bearerTokenString) {
		return res.status(401).json({
			error: 'Resource requires Bearer token in Authorization header',
		});
	}

	const splitBearerTokenString = bearerTokenString.split(' ');

	if (splitBearerTokenString.length !== 2) {
		return res.status(400).json({ error: 'Bearer token is malformed' });
	}

	const token = splitBearerTokenString[1];

	try {
		const decoded = jwt.verify(token, process.env.JWT_KEY);
		req.user = decoded;

		let user = await userSchema.findById(decoded.id).lean(); // `lean()` improves performance by returning a plain JS object
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		delete user.password; // Remove sensitive data from the user object
		req.userInfo = user;

		console.log('Authenticated user info:', req.userInfo);
		next();
	} catch (err) {
		console.error('JWT verification error:', err);
		res.status(403).json({ error: 'Invalid JWT' });
	}
};

export default authenticate;
