import { IRequest, Router } from 'itty-router';
import Email from './controllers/email';
import AuthMiddleware from './middlewares/auth';
import EmailSchemaMiddleware, { EmailRequest } from './middlewares/email';
import { IEmail } from './schema/email';

const router = Router();

// POST /api/email
router.post<EmailRequest>('/api/email', AuthMiddleware, EmailSchemaMiddleware, async (request) => {
	const email = request.email as IEmail;

	try {
		await Email.send(email);
	} catch (e) {
		console.error(`Error sending email: ${e}`);
		return new Response('Internal Server Error', { status: 500 });
	}

	return new Response('OK', { status: 200 });
});

router.all('*', (request) => new Response('Not Found', { status: 404 }));

export default {
	fetch: router.handle,
};
