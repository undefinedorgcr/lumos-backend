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



// Initialize CORS middleware
const cors = Cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
});

// Middleware helper function to run CORS
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
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
        // Handle GET request to fetch all users
        if (req.method === 'GET') {
            try {
                const { uId } = req.query; // Extract uId from query params

                if (typeof uId === 'string') {
                    // Fetch a single user by uId
                    const user = await dbUsers.getUserByUId(uId);

                    if (!user) {
                        return res.status(404).json({ message: "User not found" });
                    }

                    return res.status(200).json({ users: [user] });
                } else {
                const users = await dbUsers.getAllUsers();
                
                // Sanitizing the user data to match the expected format
                const sanitizedUsers = users.map(({ _id, email, fav_pools, user_type, remaining_requests, uId }: any) => ({
                    _id,
                    email,
                    fav_pools,
                    user_type,
                    remaining_requests,
                    uId
                }));
                
    
                res.status(200).json({ users: sanitizedUsers });
            }
            } catch (error) {
                console.error("Error fetching users:", error);
                res.status(500).json({ users: [] });
            }
        } 
        
        // Handle POST request to create a new user
        else if (req.method === 'POST') {
            const { email, uId, fav_pools = [], user_type, remaining_requests } = req.body;

            if (!email || !uId) {
                return res.status(400).json({ message: "Missing required fields (email, uId)" });
            }

            const newUserId = await dbUsers.createUser({ email, uId, fav_pools, user_type, remaining_requests });
            
            if (!newUserId) {
                return res.status(500).json({ message: "Error creating user" });
            }
            return res.status(201).json({ message: "User created successfully", users: [{ _id: String(newUserId), email, uId }] });
        } 
        
        // Handle PUT request to update an existing user
        else if (req.method === 'PUT') {
            const { _id, email, uId, fav_pools, user_type, remaining_requests } = req.body;

            // Validate required fields
            if (!_id || !email || !uId) {
                return res.status(400).json({ message: "Missing required fields (_id, email, uId)" });
            }

            // Update the user
            const updatedUser = await dbUsers.updateUser({ _id, email, uId, fav_pools, user_type, remaining_requests });

            if (!updatedUser) {
                return res.status(404).json({ message: "User not found or update failed" });
            }

            return res.status(200).json({ message: "User updated successfully", users: [updatedUser] });
        } 
        
        // Handle DELETE request to delete a user
        else if (req.method === 'DELETE') {
            const { _id } = req.body;

            if (!_id) {
                return res.status(400).json({ message: "Missing required field (_id)" });
            }

            // Delete the user from the database
            const deletedUser = await dbUsers.deleteUser(_id);

            if (!deletedUser) {
                return res.status(404).json({ message: "User not found" });
            }

            return res.status(200).json({ message: "User deleted successfully" });
        }
        
        // Return error if the method is not allowed
        else {
            res.status(405).json({ message: "Method not allowed" });
        }
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}