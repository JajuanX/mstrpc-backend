import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import Article from '../models/article.js';
import User from '../models/user.js';

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendNewsletter = async (req, res) => {
	try {
		// Get today's date boundaries
		const now = new Date();
		const startOfToday = new Date(now.setHours(0, 0, 0, 0));
		const endOfToday = new Date(now.setHours(23, 59, 59, 999));

		// Find the top 10 articles today sorted by rankingScore (highest first)
		const articles = await Article.find({
			createdAt: { $gte: startOfToday, $lte: endOfToday },
		})
			.sort({ rankingScore: -1 })
			.limit(10);

		if (articles.length === 0) {
			console.log('No articles today. Skipping email.');
			return res.status(200).json({ message: 'No articles today. Skipping email.' });
		}

		// Get all users (only select email and firstName)
		const users = await User.find({}, 'email name.firstName');

		if (users.length === 0) {
			console.log('No users found to send the newsletter.');
			return res.status(200).json({ message: 'No users found to send the newsletter.' });
		}

		// Format the article content into a list
		const articleList = articles
			.map(
				(article, index) =>
					`
					<tr>
						<td style="padding: 15px; border-bottom: 1px solid #ddd;">
							<img src="${article.image_url}" alt="${article.title}" style="width: 100%; max-width: 400px; border-radius: 8px; display: block; margin-bottom: 10px;">
							<h3 style="margin: 5px 0; font-size: 18px; color: #333;">${index + 1}. ${article.title}</h3>
							<p style="color: #666; font-size: 14px;">${article.description || 'No description available'}</p>
							<a href="${article.link_url}" style="color: #F95C19; font-weight: bold; text-decoration: none; display: inline-block; margin-top: 10px;">Read More →</a>
						</td>
					</tr>
					`
			)
			.join('');

		// Loop through each user and send the newsletter
		for (const user of users) {
			const emailContent = `
				<!DOCTYPE html>
				<html>
				<head>
					<style>
						body {
							font-family: Arial, sans-serif;
							background-color: #f8f9fa;
							margin: 0;
							padding: 0;
						}
						.container {
							max-width: 600px;
							margin: 20px auto;
							background: #ffffff;
							padding: 20px;
							border-radius: 8px;
							box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
						}
						h2 {
							text-align: center;
							color: #333;
						}
						.footer {
							margin-top: 20px;
							text-align: center;
							color: #777;
							font-size: 12px;
						}
						.footer a {
							color: #F95C19;
							text-decoration: none;
						}
					</style>
				</head>
				<body>
					<div class="container">
						<h2>📢 Hi ${user.name.firstName}, here’s Today’s Latest Links</h2>
						<p style="text-align: center; color: #555;">Check out the most recent links posted today:</p>
						<table width="100%">
							${articleList}
						</table>
						<div class="footer">
							<p>You're receiving this email because you subscribed to MSTRPC updates.</p>
							<p><a href="https://mstrpc.io">Visit MSTRPC</a></p>
						</div>
					</div>
				</body>
				</html>
			`;

			const msg = {
				to: user.email,
				from: 'admin@mstrpc.io',
				subject: `📢 ${user.name.firstName}, Here’s Today’s Latest Links!`,
				html: emailContent,
			};

			await sgMail.send(msg);
			console.log(`Newsletter sent to ${user.email}`);
		}

		console.log('All newsletters sent successfully!');
		return res.status(200).json({ message: 'All newsletters sent successfully!' });
	} catch (error) {
		console.error('Error sending newsletter:', error.response?.body || error);
		return res.status(500).json({ message: 'Error sending newsletter', error: error.response?.body || error });
	}
};

export default sendNewsletter;
