import waitlistService from '../../services/waitlistService';
import { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData } from '../../types/usersApiResponseData';
import { verifyAuth, runMiddleware, cors } from '../../utils/authUtils';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
): Promise<void> {
    try {
        await runMiddleware(req, res, cors);
        console.log(req);
        if (!verifyAuth(req)) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (req.method === 'POST') {
            console.log('POST request to waitlist');
            return await waitlistService.handleSaveEmail(req, res);
        }
    }
    catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            message: 'Internal server error',
        });
    }
}