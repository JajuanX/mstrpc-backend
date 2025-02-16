import crypto from 'crypto';
import Invitation from '../models/invitation.js';
import sgMail from '@sendgrid/mail';

export const getInvites = async (req, res) => {
	try {
		const response = await Invitation
			.find({ _id: req.params.userId })
			.exec();
		res.status(200).json(response);
	} catch (error) {
		res.status(500).send('Failed to retrieve the Invites');
	}
};

export async function generateInviteToken(req, res) {
	try {
		const { email, userId } = req.body;

		// Validate inputs
		if (!email || !userId) {
			return res.status(400).json({ message: 'Email and userId are required' });
		}

		// Generate a unique invite token
		const inviteToken = crypto.randomBytes(16).toString('hex');
		const invitation = new Invitation({
			inviteToken,
			invitedBy: userId,
			email,
		});

		// Save the invitation to the database
		await invitation.save();

		// Set the SendGrid API key
		sgMail.setApiKey(process.env.SENDGRID_API_KEY);

		// Compose the email message
		const msg = {
			to: email,
			from: 'admin@mstrpc.io', // Make sure this email is verified
			subject: 'Welcome to MSTRPC Beta',
			text: `Hello ${email},\n\nWe're excited to invite you to join our exclusive platform! Use the invite token below to complete your registration:\n\n${inviteToken}\n\nVisit: https://mstrpc.io/signup\n\nBest,\nThe MSTRPC.io Team`,
			html: `
				<!DOCTYPE html>
				<html lang="en">
				<head>
					<meta charset="UTF-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<title>You're Invited to Join MSTRPC.io!</title>
					<style>
						body { font-family: 'Arial', sans-serif; color: #333; margin: 0; padding: 0; }
						.container { max-width: 600px; margin: 20px auto; background: #fff; border: 1px solid #ddd; border-radius: 10px; }
						.header { background: #F95C19; color: #fff; padding: 20px; text-align: center; }
						.content { padding: 20px; }
						.token { background: #f3f3f3; border: 1px dashed #F95C19; padding: 10px; margin: 15px 0; display: inline-block; font-weight: bold; color: #F95C19; }
						.button { display: inline-block; margin-top: 20px; text-decoration: none; background: #F95C19; color: #fff; padding: 10px 20px; border-radius: 5px; }
						.footer { padding: 10px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #ddd; }
					</style>
				</head>
				<body>
					<div class="container">
						<div class="header">
							<h1>Welcome to MSTRPC.io!</h1>
						</div>
						<div class="content">
							<p>Hello ${email},</p>
							<p>We're excited to invite you to join our exclusive platform! Use the invite token below to complete your registration:</p>
							<div class="token">${inviteToken}</div>
							<p>
								<a class="button" href="https://mstrpc.io/signup" target="_blank">Join Now</a>
							</p>
							<p>If you have any questions, feel free to reply to this email.</p>
							<p>Best regards,<br>The MSTRPC.io Team</p>
						</div>
						<div class="footer">
							&copy; 2025 MSTRPC.io. All rights reserved.
						</div>
					</div>
				</body>
				</html>
			`,
		};

		// Send the email
		await sgMail.send(msg);
		console.log('Email sent successfully');

		res.status(200).json({ message: 'Invitation sent successfully', inviteToken });
	} catch (error) {
		console.error('Error generating invite token:', error.response?.body || error.message);
		res.status(500).json({ message: 'Failed to generate invite token', error: error.message });
	}
}
