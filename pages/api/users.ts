import Cors from 'cors';
import userService from '../../services/userService';
import { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData } from '../../types/usersApiResponseData';

const cors = Cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
});

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) return reject(result);
            return resolve(result);
        });
    });
}

function verifyAuth(req: NextApiRequest): boolean {
    const authHeader = req.headers.authorization;
    if (!authHeader) return false;
    const token = authHeader.split(' ')[1];
    return token === process.env.API_SECRET_TOKEN;
}

/**
 * Handles user-related requests (GET, POST, PUT, DELETE) for the user API.
 * @param {NextApiRequest} req - The HTTP request object.
 * @param {NextApiResponse<ResponseData>} res - The HTTP response object.
 * @returns {Promise<void>} - The response to the request.
 */
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
            return await userService.handleDeleteUser(req, res);
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
