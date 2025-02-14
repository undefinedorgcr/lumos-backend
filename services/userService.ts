import dbUsers from "../db/users";
import { isValidUserType } from "../enums/plans";
import { NextApiRequest, NextApiResponse } from "next";
import { ResponseData } from "../types/usersApiResponseData";

/**
 * Handles GET request to fetch all users.
 */
const handleGetUsers = async (res: NextApiResponse<ResponseData>) => {
    try {
        const users = await dbUsers.getAllUsers();

        // Sanitize the user data
        const sanitizedUsers = users.map(({ _id, email, fav_pools, user_type, remaining_requests, uId ,plan_exp_date}: any) => ({
            _id,
            email,
            fav_pools,
            user_type,
            remaining_requests,
            uId,
            plan_exp_date,
        }));

        return res.status(200).json({
            users: sanitizedUsers
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({
            message: "Failed to fetch users"
        });
    }
};

/**
 * Handles GET request to fetch a user by uId.
 */
const handleGetUserByUid = async (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {
    try {
        const { uId } = req.query; // Extract uId from query params
        // Fetch a single user by uId
        if(uId == null) {
            return res.status(404).json({
                message: "missing user id"
            });
        }
        const user = await dbUsers.getUserByUId(Array.isArray(uId) ? uId[0] : uId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        return res.status(200).json({
            users: [user]
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({
            message: "Failed to fetch users"
        });
    }
};

/**
 * Handles POST request to create a new user.
 */
const handleCreateUser = async (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {
    const { email, uId, fav_pools = [], user_type } = req.body;

    if (!email || !uId || !isValidUserType(user_type)) {
        return res.status(400).json({
            message: "Missing or invalid required fields (email, uId, user_type)"
        });
    }

    try {
        const newUserId = await dbUsers.createUser({
            email,
            uId,
            fav_pools,
            user_type
        });

        if (!newUserId) {
            return res.status(500).json({
                message: "Error creating user"
            });
        }

        return res.status(201).json({
            message: "User created successfully",
            users: [{
                _id: String(newUserId),
                email,
                uId
            }]
        });
    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({
            message: "Failed to create user"
        });
    }
};

/**
 * Handles PUT request to update an existing user.
 */
const handleUpdateUser = async (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {
    const { _id, email, uId, fav_pools, user_type, remaining_requests } = req.body;

    if (!_id || !email || !uId || !isValidUserType(user_type)) {
        return res.status(400).json({
            message: "Missing or invalid required fields (_id, email, uId, user_type)"
        });
    }

    try {
        const updatedUser = await dbUsers.updateUser({
            _id,
            email,
            uId,
            fav_pools,
            user_type,
            remaining_requests
        });

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found or update failed"
            });
        }

        return res.status(200).json({
            message: "User updated successfully",
            users: [updatedUser]
        });
    } catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({
            message: "Failed to update user"
        });
    }
};

/**
 * Handles DELETE request to delete a user.
 */
const handleDeleteUser = async (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {
    const { _id } = req.body;

    if (!_id) {
        return res.status(400).json({
            message: "Missing required field (_id)"
        });
    }

    try {
        const deletedUser = await dbUsers.deleteUser(_id);

        if (!deletedUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({
            message: "Failed to delete user"
        });
    }
};

/**
 * Handles updating the user's plan.
 */
export const handleUpdateUserType = async (req: NextApiRequest, res: NextApiResponse) => {
    const { uId, newUserType } = req.body; // Expecting body to contain uId and newPlan
    console.log(newUserType);
    if (!uId || !isValidUserType(newUserType)) {
        return res.status(400).json({
            message: "Missing or invalid required fields (uId, user_type)"
        });
    }

    try {
        const updatedUser = await dbUsers.updateUserType(uId, newUserType);

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found or update failed"
            });
        }

        return res.status(200).json({
            message: "User type updated successfully",
            users: [updatedUser]
        });

    } catch (error) {
        console.error("Error updating user type:", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export default {
    handleGetUsers,
    handleGetUserByUid,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    handleUpdateUserType
};