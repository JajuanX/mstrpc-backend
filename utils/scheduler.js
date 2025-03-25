import cron from 'node-cron';
import Article from '../models/article.js';

// Schedule a job to run every 6 hours (at minute 0)
cron.schedule('0 */6 * * *', async () => {
	try {
		const currentTime = Date.now();
		const articles = await Article.find({});
		for (const article of articles) {
			const hoursSince = (currentTime - new Date(article.createdAt).getTime()) / (1000 * 60 * 60);
			// Calculate the ranking score with a gravity factor of 1.8 and an offset of 2 hours
			article.rankingScore = (article.upvotes - 1) / Math.pow(hoursSince + 2, 1.8);
			await article.save();
		}
		console.info('Ranking scores updated successfully for articles');
	} catch (error) {
		console.error('Error updating ranking scores:', error);
	}
});
