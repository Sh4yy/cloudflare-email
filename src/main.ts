import { IRequest, Router } from 'itty-router';
import Email from './controllers/email';
import AuthMiddleware from './middlewares/auth';
import EmailSchemaMiddleware, { EmailRequest } from './middlewares/email';
import { IEmail } from './schema/email';

const router = Router();

// POST /api/email
router.post<EmailRequest>('/api/email', AuthMiddleware, EmailSchemaMiddleware, async (request, env) => {
	const email = request.email as IEmail;
	return await Email.send(email, env);
});

router.all('*', (request) => new Response('Not Found', { status: 404 }));

export default {
	fetch: router.handle,
};
