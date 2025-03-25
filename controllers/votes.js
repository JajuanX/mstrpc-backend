import Vote from '../models/vote.js';

export const getUserVotes = async (req, res) => {
	try {
		// Assumes your authorization middleware attaches the user object to req
		const userId = req.user.id;
		const votes = await Vote.find({ user_id: userId })
			.select('article_id -_id')
			.exec();

		// Return an array of article IDs that the user has voted on
		const articleIds = votes.map((vote) => vote.article_id);
		res.status(200).json(articleIds);
	} catch (error) {
		console.error('Error fetching user votes:', error);
		res.status(500).send('Failed to fetch user votes');
	}
};
