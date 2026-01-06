/**
 * Middleware to check if the user is authenticated
 * @param request
 * @constructors
 */
const AuthMiddleware = (request: Request, env: Env) => {
	const token = request.headers.get('Authorization');

	// Strict check for token existence
	
	if (!env.TOKEN || env.TOKEN.length === 0) {
		return new Response('You must set the TOKEN environment variable.', {
			status: 401,
		});
	}

	// Possible password length leak (Timing attack)

	if (env.TOKEN.length !== token?.length) {
		return new Response('Unauthorized', { status: 401 });
	}

	const encoder = new TextEncoder();

	const tokenEnc = encoder.encode(token)
	const envTokenEnc = encoder.encode(env.TOKEN)

	if (tokenEnc.length !== envTokenEnc.length) {
		return new Response('Unauthorized', { status: 401 });
	}

	let isValidToken = crypto.subtle.timingSafeEqual(tokenEnc, envTokenEnc);

	if (!isValidToken) {
		return new Response('Unauthorized', { status: 401 });
	}
};

export default AuthMiddleware;
