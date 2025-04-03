import positionsService from '../../services/positionsService';
import { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData } from '../../types/positionsApiResponseData';
import { verifyAuth, runMiddleware, cors } from '../../utils/authUtils';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<ResponseData>
): Promise<void> {
	try {
		await runMiddleware(req, res, cors);
		if (!verifyAuth(req)) {
			return res.status(401).json({ message: 'Unauthorized' });
		}
		if (req.method === 'GET') {
			const { _id } = req.query;
			if (typeof _id === 'string') {
				return await positionsService.handleGetPositionById(req, res);
			} else {
				return await positionsService.handleGetPositions(res);
			}
		} else if (req.method === 'POST') {
			return await positionsService.handleCreatePosition(req, res);
		} else if (req.method === 'PUT') {
			return await positionsService.handleUpdatePosition(req, res);
		} else if (req.method === 'DELETE') {
			return await positionsService.handleDeletePosition(req, res);
		} else {
			res.status(405).json({
				message: 'Method not allowed',
			});
		}
	} catch (error) {
		console.error('API Error:', error);
		res.status(500).json({
			message: 'Internal server error',
		});
	}
}
