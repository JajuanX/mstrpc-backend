import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
	article_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'article',
		required: true,
	},
	user_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user',
		required: true,
	},
	// Optionally, add a timestamp for when the vote was cast
}, { timestamps: true });

// Ensure each user can only vote once per article
voteSchema.index({ article_id: 1, user_id: 1 }, { unique: true });

const Vote = mongoose.model('vote', voteSchema);

export default Vote;