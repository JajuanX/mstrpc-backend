import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userSchema from '../models/user.js';
import articleSchema from '../models/article.js';
import statementSchema from '../models/statement.js';
import inviteSchema from '../models/invitation.js';
import sgMail from '@sendgrid/mail';
import crypto from 'crypto';
dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const createUser = async (req, res) => {
	const {
		name: { firstName, lastName },
		email,
		username,
		password,
		inviteToken,
	} = req.body;

	if (!firstName || !lastName || !email || !password || !username || !inviteToken) {
		return res.status(400).send('Please enter the required fields.');
	}

	const invitation = await inviteSchema.findOne({ inviteToken, isUsed: false });
	if (!invitation) {
		throw new Error('Invalid or expired invite token');
	}

	const hashedPassword = bcrypt.hashSync(password);

	const newUser = {
		name: { firstName, lastName },
		email,
		username,
		inviteTokenUsed: inviteToken,
		password: hashedPassword,
		profile: req.profile._id,
	};

	try {
		const response = await userSchema.create(newUser);

		invitation.isUsed = true;
		await invitation.save();

		// Send email notification using SendGrid
		const msg = {
			to: 'jjjjjj2121@gmail.com', // your email address
			from: 'admin@mstrpc.io',
			subject: 'Cha Ching!! New User Created',
			text: `A new user has been created:\n\nName: ${firstName} ${lastName}\nEmail: ${email}\nUsername: ${username}`,
		};

		await sgMail.send(msg);
		console.info('New user notification email sent.');

		res.status(200).json(response);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Failed to Register.' });
	}
};

export const loginUser = async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).send('Please enter the required fields');
	}

	const user = await userSchema.findOne({ email }).exec();

	if (!user) {
		return res.status(400).send('Invalid email');
	}

	const isPasswordCorrect = bcrypt.compareSync(password, user.password);
	if (!isPasswordCorrect) {
		return res.status(400).send('Invalid password');
	}

	const expiresIn = 24 * 60 * 60; // 24 hours in seconds

	const token = jwt.sign(
		{ id: user.id, email: user.email, roles: user.roles },
		process.env.JWT_KEY,
		{ expiresIn }
	);

	res.json({ token, expires_in: expiresIn }); // Include expires_in in the response
};


export const updateUserAdminRights = async (req, res) => {
	const { email, role } = req.body;

	if (!email || !role) {
		return res.status(400).send('Please enter the required fields');
	}

	if (!req.user.roles.includes('admin') && !req.user.roles.includes('super')) {
		return res.status(403).send('You are not authorized');
	}

	const user = await userSchema.findOneAndUpdate(
		{ email },
		{ $push: { roles: role } },
		{ new: true }
	);

	if (!user) {
		return res.status(400).send('Invalid email');
	}

	res.json(user);
};

export const removeAdminRights = async (req, res) => {
	const { email, role } = req.body;

	if (!email || !role) {
		return res.status(400).send('Please enter the required fields');
	}

	if (!req.user.roles.includes('admin') && !req.user.roles.includes('super')) {
		return res.status(403).send('You are not authorized');
	}

	const user = await userSchema.findOneAndUpdate(
		{ email },
		{ $pull: { roles: role } },
		{ new: true }
	);

	if (!user) {
		return res.status(400).send('Invalid email');
	}

	res.json(user);
};

export const currentUser = async (req, res) => {
	const currentUser = req.user;

	try {
		const user = await userSchema.findById(currentUser.id).select('-password').exec();
		res.status(200).json(user);
	} catch (error) {
		res.status(404).json({});
	}
};

export const getUser = async (req, res) => {
	const currentUser = req.user;

	if (currentUser.id !== req.params.id && !currentUser.roles.includes('super')) {
		return res.status(403).send('User Not Authorized');
	}

	const user = await userSchema.findById(currentUser.id).select('-password').exec();
	res.status(200).json(user);
};

export const editUser = async (req, res) => {
	const currentUser = req.user;
	const { fieldName, value } = req.body;

	try {
		const response = await userSchema.findByIdAndUpdate(
			currentUser.id,
			{ [fieldName]: value },
			{ new: true }
		);
		res.status(200).json(response);
	} catch (err) {
		console.error(err);
		res.status(401).send('Failed to update field');
	}
};

export const editUserProfile = async (req, res) => {
	const currentUser = req.user;
	const updateFields = req.body;

	try {
		const response = await userSchema.findByIdAndUpdate(
			currentUser.id,
			{ $set: updateFields },
			{ new: true, upsert: true }
		);
		res.status(200).json(response);
	} catch (err) {
		console.error(err);
		res.status(401).send('Failed to update field');
	}
};

export const getUserProfile = async (req, res) => {
	try {
		const userProfile = await userSchema
			.findOne({ username: req.params.username })
			.populate({
				path: 'profile.articles',
				populate: {
					path: 'blogs',
					model: 'Blog',
				},
			})
			.select('profile');

		res.status(200).json(userProfile);
	} catch (error) {
		console.error(error);
		res.status(404).send('Failed to get profile');
	}
};

export const updateUserRelation = async (req, res) => {
	const { id, field } = req.body;

	try {
		const user = await userSchema.findByIdAndUpdate(
			id,
			{ $push: { [`profile.${field}`]: id } },
			{ new: true }
		);

		res.status(200).json(user);
	} catch (err) {
		res.status(404).send('Failed to update user relation');
	}
};


export const getUserArticlesPagination = async (req, res) => {
	try {
		let user = await userSchema
			.findOne({ username: req.params.username });

		const page = parseInt(req.query.page) || 1; // Default to page 1
		const limit = parseInt(req.query.limit) || 10; // Default to 10 articles per page
		const skip = (page - 1) * limit; // Calculate the number of documents to skip

		// Retrieve paginated articles
		const articles = await articleSchema
			.find({ user_id: user._id })
			.sort({ createdAt: -1 }) // Sort by most recent first
			.skip(skip)
			.limit(limit)
			.exec();

		// Get total article count
		const totalArticles = await articleSchema.countDocuments({ user_id: user._id });

		res.status(200).json({
			page,
			limit,
			totalArticles,
			totalPages: Math.ceil(totalArticles / limit),
			articles,
		});
	} catch (error) {
		console.error(error);
		res.status(500).send('Failed to retrieve articles');
	}
};

export const getUserStatementsPagination = async (req, res) => {
	try {
		let user = await userSchema
			.findOne({ username: req.params.username });

		const page = parseInt(req.query.page) || 1; // Default to page 1
		const limit = parseInt(req.query.limit) || 10; // Default to 10 articles per page
		const skip = (page - 1) * limit; // Calculate the number of documents to skip

		const statements = await statementSchema
			.find({ user_id: user._id })
			.sort({ createdAt: -1 }) // Sort by most recent first
			.skip(skip)
			.limit(limit)
			.exec();

		// Get total article count
		const totalStatements = await statementSchema.countDocuments({ user_id: user._id });

		res.status(200).json({
			page,
			limit,
			totalStatements,
			totalPages: Math.ceil(totalStatements / limit),
			statements,
		});
	} catch (error) {
		console.error(error);
		res.status(500).send('Failed to retrieve statements');
	}
};

export const getUsers = async (_req, res) => {
	try {
		let users = await userSchema.find({})
			.populate({
				path: 'profile',
				select: 'image_url'
			})
			.select('username profile')
			.exec();

		// Randomize the order of users
		users = users.sort(() => Math.random() - 0.5);

		const formattedUsers = users.map(user => ({
			id: crypto.randomUUID(),
			username: user.username,
			image_url: user.profile?.image_url
		}));

		res.status(200).json(formattedUsers);
	} catch (error) {
		console.error(error);
		res.status(500).send('Failed to retrieve users');
	}
};


export const deleteUser = async (req, res) => {
	const { userId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(userId)) {
		return res.status(400).json({ error: 'Invalid user ID format' });
	}

	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		// Check if user exists
		const user = await userSchema.findById(userId).session(session);
		if (!user) {
			await session.abortTransaction();
			session.endSession();
			return res.status(404).json({ error: 'User not found' });
		}

		// Delete user's profile
		await Profile.deleteOne({ user_id: userId }).session(session);

		// Delete user's statements
		await Statement.deleteMany({ user_id: userId }).session(session);

		// Delete user
		await userSchema.findByIdAndDelete(userId).session(session);

		// Commit transaction
		await session.commitTransaction();
		session.endSession();

		return res.status(200).json({ message: 'User and all associated data deleted successfully' });

	} catch (error) {
		await session.abortTransaction();
		session.endSession();
		console.error('Error deleting user:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
};

// export const getUsersWithPagination = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page) || 1; // Default to page 1
//         const limit = parseInt(req.query.limit) || 10; // Default to 10 users per page
//         const skip = (page - 1) * limit;

//         // Fetch users with pagination, only selecting username and image_url from profile
//         const users = await userSchema.find()
//             .populate({
//                 path: 'profile',
//                 select: 'image_url'
//             })
//             .select('username profile')
//             .skip(skip)
//             .limit(limit)
//             .exec();

//         // Get total user count
//         const totalUsers = await userSchema.countDocuments();

//         // Transform the result to only include username and image_url
//         const formattedUsers = users.map(user => ({
// 			id: crypto.randomUUID(),
//             username: user.username,
//             image_url: user.profile?.image_url || null
//         }));

//         res.status(200).json({
//             page,
//             limit,
//             totalUsers,
//             totalPages: Math.ceil(totalUsers / limit),
//             users: formattedUsers,
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Failed to retrieve users');
//     }
// };