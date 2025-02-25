import userService from '../../services/userService';
import { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData } from '../../types/usersApiResponseData';
import { verifyAuth , runMiddleware, cors } from '../../utils/authUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>): Promise<void> {
    try {
        await runMiddleware(req, res, cors); 
        if (!verifyAuth(req)) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (req.method === 'GET') {
            const { uId } = req.query; 
            if (typeof uId === 'string') {
                return await userService.handleGetUserByUid(req, res);
            } else {
                return await userService.handleGetUsers(res);
            }
        }
        else if (req.method === 'POST') {
            return await userService.handleCreateUser(req, res);
        }
        else if (req.method === 'PUT') {
            if (req.body.newUserType) {
                return await userService.handleUpdateUserType(req, res);  
            }else if( req.body.protocol) {
                return await userService.handleUpdateFavPools(req, res);  
            } else {
                return await userService.handleUpdateUser(req, res);  
            }
        }
        else if (req.method === 'DELETE') {
            if (req.body.pool) {
                return await userService.handleDeleteFavPool(req, res);
            } else {
                return await userService.handleDeleteUser(req, res);
            }
        }
        else {
            res.status(405).json({
                message: "Method not allowed"
            });
        }
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}
