import Cors from 'cors';
import { NextApiRequest, NextApiResponse } from 'next';

export const verifyAuth = (req: NextApiRequest): boolean => {
	const authHeader = req.headers.authorization;
	if (!authHeader) return false;
	const token = authHeader.split(' ')[1];
	return token === process.env.API_SECRET_TOKEN;
};

export const cors = Cors({
	origin: '*',
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
});

export const runMiddleware = (
	req: NextApiRequest,
	res: NextApiResponse,
	fn: any
) => {
	return new Promise((resolve, reject) => {
		fn(req, res, (result: any) => {
			if (result instanceof Error) return reject(result);
			return resolve(result);
		});
	});
};
