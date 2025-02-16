import express from 'express';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.get('/', async (req, res) => {
	const msg = {
		to: 'jajuan.burton@live.com', // Change to your recipient
		from: 'jajuan.burton@live.com', // Change to your verified sender
		subject: "Welcome to Masterpiece – You're In!",
		text: "Welcome to Masterpiece! We're thrilled to have you on board.",
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h1 style="text-align: center;">Welcome to Masterpiece, {{firstName}}!</h1>
        <p>Hello,</p>
        <p>
          We're thrilled to have you on board. Your journey to discover and create stunning digital art begins now.
          At Masterpiece, we're committed to providing you with the tools and inspiration you need to unleash your creativity.
        </p>
        <p>
          To get started, why not explore our collection or upload your first creation? 
          There's a whole community waiting to see what you'll bring to the table.
        </p>
        <p>
          If you have any questions or need assistance, feel free to reach out to our support team. 
          We're here to help make your experience unforgettable.
        </p>
        <p>Thank you for joining us, and welcome to the family!</p>
        <p>Best Regards,<br>The Masterpiece Team</p>
        <footer style="text-align: center; margin-top: 20px; font-size: 12px; color: gray;">
          <p>Follow us on <a href="https://example.com/social" target="_blank">Social Media</a></p>
          <p><a href="https://example.com/unsubscribe" target="_blank">Unsubscribe</a> | <a href="https://example.com/privacy" target="_blank">Privacy Policy</a></p>
        </footer>
      </div>
    `,
	};

	try {
		await sgMail.send(msg);
		console.info('Email sent successfully');
		res.status(200).send('Success');
	} catch (error) {
		console.error('Error sending email:', error);
		res.status(500).send('Failed to send email');
	}
});

export default router;
