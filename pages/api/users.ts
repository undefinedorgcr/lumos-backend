import Cors from 'cors';
import userService from '../../services/userService';
import { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData } from '../../types/usersApiResponseData';

// Initialize CORS middleware
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
        await runMiddleware(req, res, cors); // Apply CORS middleware
        if (!verifyAuth(req)) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Handle GET request to fetch all users
        if (req.method === 'GET') {
            const { uId } = req.query; // Extract uId from query params
            if (typeof uId === 'string') {
                return await userService.handleGetUserByUid(req, res);
            } else {
                return await userService.handleGetUsers(res);
            }
        }

        // Handle POST request to create a new user
        else if (req.method === 'POST') {
            return await userService.handleCreateUser(req, res);
        }

        // Handle PUT request to update an existing user
        else if (req.method === 'PUT') {
            // Check if the request is to update the user's plan
            if (req.body.newUserType) {
                return await userService.handleUpdateUserType(req, res);  // Call the new method for updating the plan
            } else {
                return await userService.handleUpdateUser(req, res);  // Regular update (e.g., user info update)
            }
        }

        // Handle DELETE request to delete a user
        else if (req.method === 'DELETE') {
            return await userService.handleDeleteUser(req, res);
        }

        // Return error if the method is not allowed
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
