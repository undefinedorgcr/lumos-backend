import { NextApiRequest, NextApiResponse } from 'next';
import dbUsers from '../../db/users';
import Cors from 'cors';

type User = {
    _id?: string;
    email: string;
    fav_pools?: string[];
    user_type?: string;
    remaining_requests?: number;
    uId: string;
};

type ResponseData = {
    users?: User[];
    message?: string;
};

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
    console.log(token);
    console.log(process.env.API_SECRET_TOKEN);
    return token === process.env.API_SECRET_TOKEN;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>): Promise<void> {
    try {
        await runMiddleware(req, res, cors);
        if (!verifyAuth(req)) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (req.method === 'GET') {
            try {
                const { uId } = req.query;
                if (typeof uId === 'string') {
                    const user = await dbUsers.getUserByUId(uId);
                    if (!user) return res.status(404).json({ message: "User not found" });
                    return res.status(200).json({ users: [user] });
                } else {
                    const users = await dbUsers.getAllUsers();
                    const sanitizedUsers = users.map(({ _id, email, fav_pools, user_type, remaining_requests, uId }: any) => ({
                        _id, email, fav_pools, user_type, remaining_requests, uId
                    }));
                    res.status(200).json({ users: sanitizedUsers });
                }
            } catch (error) {
                console.error("Error fetching users:", error);
                res.status(500).json({ users: [] });
            }
        } else if (req.method === 'POST') {
            const { email, uId, fav_pools = [], user_type, remaining_requests } = req.body;
            if (!email || !uId) return res.status(400).json({ message: "Missing required fields (email, uId)" });
            const newUserId = await dbUsers.createUser({ email, uId, fav_pools, user_type, remaining_requests });
            if (!newUserId) return res.status(500).json({ message: "Error creating user" });
            return res.status(201).json({ message: "User created successfully", users: [{ _id: String(newUserId), email, uId }] });
        } else if (req.method === 'PUT') {
            const { _id, email, uId, fav_pools, user_type, remaining_requests } = req.body;
            if (!_id || !email || !uId) return res.status(400).json({ message: "Missing required fields (_id, email, uId)" });
            const updatedUser = await dbUsers.updateUser({ _id, email, uId, fav_pools, user_type, remaining_requests });
            if (!updatedUser) return res.status(404).json({ message: "User not found or update failed" });
            return res.status(200).json({ message: "User updated successfully", users: [updatedUser] });
        } else if (req.method === 'DELETE') {
            const { _id } = req.body;
            if (!_id) return res.status(400).json({ message: "Missing required field (_id)" });
            const deletedUser = await dbUsers.deleteUser(_id);
            if (!deletedUser) return res.status(404).json({ message: "User not found" });
            return res.status(200).json({ message: "User deleted successfully" });
        } else {
            res.status(405).json({ message: "Method not allowed" });
        }
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
