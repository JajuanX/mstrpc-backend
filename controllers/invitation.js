import crypto from 'crypto';
import Invitation from '../models/invitation.js';
import sendMail from '../middleware/nodemailer.js';

export async function generateInviteToken(req, res) {
	const email = req.body.email
	const userId = req.body.userId

	const inviteToken = crypto.randomBytes(16).toString('hex');
	const invitation = new Invitation({
		inviteToken,
		invitedBy: userId,
		email,
	});
	await invitation.save();
	await sendMail(
		`
		<!DOCTYPE html>
			<html>
			<head>
				<title>You're Invited to Join Our Platform!</title>
				<style>
				body {
					font-family: Arial, sans-serif;
					margin: 0;
					padding: 0;
					background-color: #f9f9f9;
				}
				.email-container {
					max-width: 600px;
					margin: 20px auto;
					background-color: #ffffff;
					border-radius: 8px;
					box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
					overflow: hidden;
				}
				.header {
					background-color: #0078d4;
					color: #ffffff;
					text-align: center;
					padding: 20px;
				}
				.header h1 {
					margin: 0;
					font-size: 24px;
				}
				.content {
					padding: 20px;
				}
				.content p {
					font-size: 16px;
					color: #555555;
					line-height: 1.6;
				}
				.content .invite-token {
					background-color: #f3f3f3;
					padding: 10px;
					border: 1px dashed #0078d4;
					border-radius: 4px;
					display: inline-block;
					font-weight: bold;
					color: #0078d4;
					margin: 10px 0;
				}
				.button-container {
					text-align: center;
					margin-top: 20px;
				}
				.button-container a {
					display: inline-block;
					background-color: #0078d4;
					color: #ffffff;
					text-decoration: none;
					padding: 10px 20px;
					border-radius: 4px;
					font-size: 16px;
					font-weight: bold;
				}
				.footer {
					text-align: center;
					background-color: #f3f3f3;
					padding: 10px;
					font-size: 14px;
					color: #777777;
				}
				</style>
			</head>
			<body>
				<div class="email-container">
				<div class="header">
					<h1>Welcome to MSTRPC.io!</h1>
				</div>
				<div class="content">
					<p>Hello ${email},</p>
					<p>
					We're excited to invite you to join our exclusive platform! Use the
					invite token below to complete your registration and start sharing your thought journey.
					</p>
					<p class="invite-token">${inviteToken}</p>
					<div class="button-container">
					<a href="https://mstrpc.io/register" target="_blank">Join Now</a>
					</div>
					<p>If you have any questions or need assistance, feel free to reply to this email.</p>
					<p>Welcome aboard!</p>
					<p>Best regards,<br />The MSTRPC.io Team</p>
				</div>
				<div class="footer">
					<p>
					&copy; 2025 MSTRPC.io All rights reserved.
					</p>
				</div>
				</div>
			</body>
			</html>

		`, email, 'MSTRPC Invitation'
	);

	res.status(200).json({inviteToken});
}
