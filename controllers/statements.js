import statementSchema from '../models/statement.js';
import profileSchema from '../models/profile.js';

export const getStatements = async (_req, res) => {
	try {
		const response = await statementSchema.find({}).exec();
		res.status(200).json(response);
	} catch (error) {
		res.status(500).send('Failed to retrieve all statements');
	}
};

export const getStatementsByUser = async (req, res) => {
	const userId = req.params.userId;
	try {
		const response = await statementSchema.find({ user_id: userId }).exec();
		res.status(200).json(response);
	} catch (error) {
		res.status(500).send('Failed to retrieve statements by user');
	}
};

export const createStatement = async (req, res) => {
	console.log(req.body);
	try {
		const response = await statementSchema.create(req.body);
		console.log(req.userInfo.profile);
		await profileSchema.findByIdAndUpdate(
			req.userInfo.profile,
			{ $push: { statements: response._id } },
			{ new: true }
		);
		res.status(200).json(response);
	} catch (err) {
		console.error(err);
		res.status(500).send('Failed to create statement');
	}
};

export const getStatement = async (req, res) => {
	try {
		const response = await statementSchema
			.findOne({ _id: req.params.id })
			.populate({
				path: 'user_id',
				select: '-password',
			})
			.exec();
		res.status(200).json(response);
	} catch (error) {
		res.status(500).send('Failed to retrieve the statement');
	}
};

export const updateStatement = async (req, res) => {
	const statementId = req.params.id;
	try {
		const response = await statementSchema.findOneAndUpdate(
			{ _id: statementId },
			req.body,
			{ new: true }
		);
		res.status(200).json(response);
	} catch (err) {
		res.status(500).send('Failed to update statement');
	}
};

export const deleteStatement = async (req, res) => {
	const statementId = req.params.id;
	try {
		const response = await statementSchema.deleteOne({ _id: statementId });
		res.status(200).json(response);
	} catch (err) {
		res.status(500).send('Failed to delete statement');
	}
};
