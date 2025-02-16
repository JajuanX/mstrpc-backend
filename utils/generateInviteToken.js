import crypto from 'crypto';

async function generateInviteToken(userId, email) {
	const inviteToken = crypto.randomBytes(16).toString('hex'); // Generate a secure token
	const invitation = new Invitation({
		inviteToken,
		invitedBy: userId,
		email,
	});
	await invitation.save();
	return inviteToken;
}

export default generateInviteToken;
