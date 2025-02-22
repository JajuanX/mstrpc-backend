import crypto from 'crypto';
import Invitation from '../models/invitation.js';
import sgMail from '@sendgrid/mail';

export const getInvites = async (req, res) => {


	try {
		const response = await Invitation
			.find({ invitedBy: req.user.id })
			.exec();
		console.log(response);

		if (req.user?.roles.includes('admin')) {
			return res.status(200).json({ invites: [...response], isAdmin: true })
		}

		return res.status(200).json({ invites: [...response], isAdmin: false });
	} catch (error) {
		res.status(500).send('Failed to retrieve the Invites');
	}
};

export const deleteInviteIfUnused = async (req, res) => {
	try {
		const { inviteToken } = req.params;
		console.log(req.params);

		// Check if the user from the token is present
		const userId = req.user.id;
		if (!userId) {
			return res.status(403).json({ message: 'User ID not found in token' });
		}

		// Find the invitation by token
		const invitation = await Invitation.findOne({ inviteToken });
		console.log(invitation);

		// Check if the invitation exists and is unused
		if (!invitation) {
			return res.status(404).json({ message: 'Invitation not found' });
		}

		if (invitation.isUsed) {
			return res.status(400).json({ message: 'Cannot delete a used invitation' });
		}

		// Verify the user has permission to delete the invitation
		if (invitation.invitedBy.toString() !== userId) {
			return res.status(403).json({ message: 'You are not authorized to delete this invitation' });
		}

		// Delete the unused invitation
		await Invitation.deleteOne({ inviteToken });
		return res.status(200).json({ message: 'Invitation deleted successfully' });
	} catch (error) {
		console.error('Error deleting invitation:', error);
		return res.status(500).json({ message: 'Failed to delete the invitation', error: error.message });
	}
};

export async function generateInviteToken(req, res) {
	try {
		// Extract user ID from the token
		const userId = req.user.id;
		if (!userId) {
			return res.status(403).json({ message: 'User ID not found in token' });
		}

		const { email } = req.body;

		// Validate inputs
		if (!email) {
			return res.status(400).json({ message: 'Email is required' });
		}

		// Check if the email has already been invited
		const existingInvite = await Invitation.findOne({ email });
		if (existingInvite) {
			return res.status(400).json({ message: 'This email has already been invited' });
		}

		// Check how many invites the user has sent
		const inviteCount = await Invitation.countDocuments({ invitedBy: userId });
		if (inviteCount >= 5 && !req.user?.roles.includes('admin')) {
			return res.status(400).json({ message: 'You have reached the maximum number of invites allowed' });
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
			from: 'admin@mstrpc.io',
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
							<h1>Welcome to MSTRPC!</h1>
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
				</html>`
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

