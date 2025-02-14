import { ObjectId } from "mongodb";
import clientPromise from "../lib/mongodb";
import { getFutureDate } from "../utils/utils";
import { LumosPlan, getLumosPlanFromString, getPlanDetails, isValidUserType } from "../enums/plans";

/**
 * Retrieves the MongoDB collection for users.
 * @returns {Promise<Collection>} The 'users' collection from the database.
 */
const getDB = async () => {
    const client = await clientPromise.connect();
    return client.db("lumos").collection("users");
};

/**
 * Fetches all users from the database, sorted by 'metacritic' in descending order.
 * @returns {Promise<any[]>} A list of users.
 */
const getAllUsers = async (): Promise<any[]> => {
    try {
        const users = await (await getDB())
            .find({})
            .sort({ metacritic: -1 })
            .limit(100)
            .toArray();
        return users;
    } catch (e) {
        console.error(e);
        return [];
    }
};

/**
 * Fetches a user by their ID.
 * @param {string} id - The ID of the user.
 * @returns {Promise<any | null>} The user document if found, otherwise null.
 */
const getUserById = async (id: string): Promise<any | null> => {
    try {
        const user = await (await getDB()).findOne({ _id: new ObjectId(id) });
        return user;
    } catch (e) {
        console.error(e);
        return null;
    }
};

/**
 * Fetches a user by their uId.
 * @param {string} uId - The uId of the user.
 * @returns {Promise<any | null>} The user document if found, otherwise null.
 */
const getUserByUId = async (uId: string): Promise<any | null> => {
    try {
        const user = await (await getDB()).findOne({ uId });
        return user;
    } catch (e) {
        console.error(e);
        return null;
    }
};

/**
 * Creates a new user in the database if the email is not already registered.
 * @param {any} user - The user data to be inserted.
 * @returns {Promise<string | null>} The inserted user ID if successful, otherwise null.
 */
const createUser = async (user: any): Promise<string | null> => {
    try {
        const db = await getDB();
        
        // Check if a user with the same uId already exists
        const existingUser = await db.findOne({ uId: user.uId });

        if (existingUser) {
            console.log("User with this uId already exists.");
            return existingUser._id.toString(); // Prevent duplicate users
        }

        const planDetails = getPlanDetails(user.user_type);
        if (planDetails) {
            if (user.user_type === LumosPlan.Free) {
                // Free plan does not expire
                user.plan_exp_date = null;
            } else {
                user.plan_exp_date = getFutureDate(planDetails.expirationDays);
            }
            user.remaining_requests = planDetails.dailyRequests;
        }

        // Insert new user if uId is unique
        const result = await db.insertOne(user);
        return result.insertedId.toString();  // Ensure it's returned as a string.
    } catch (e) {
        console.error("Database error:", e);
        return null;
    }
};

/**
 * Updates an existing user in the database.
 * @param {any} user - The user data, including the ID to be updated.
 * @returns {Promise<any | null>} The updated user data if successful, otherwise null.
 */
const updateUser = async (user: any): Promise<any | null> => {
    try {
        const { _id, ...updateData } = user;
        const objectId = new ObjectId(_id);

        const result = await (await getDB()).updateOne(
            { _id: objectId },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            console.error("User not found.");
            return null;
        }

        return { _id, ...updateData };
    } catch (error) {
        console.error("Error updating user:", error);
        return null;
    }
};

/**
 * Deletes a user by their ID.
 * @param {string} id - The ID of the user to be deleted.
 * @returns {Promise<boolean>} Returns true if the user was deleted, otherwise false.
 */
const deleteUser = async (id: string): Promise<boolean> => {
    try {
        const result = await (await getDB()).deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    } catch (e) {
        console.error(e);
        return false;
    }
};

/**
 * Updates the user's subscription plan based on the provided user ID and new plan.
 * This function will find the user by their unique `uId`, validate the new user type, and update the user's plan
 * and related details in the database.
 * 
 * @param {string} uId - The unique identifier of the user whose plan is to be updated.
 * @param {string} newUserType - The new plan type for the user (e.g., "FREE", "PRO", "DEGEN").
 * @returns {Promise<Object | null>} - Returns an object containing the `uId`, updated `user_type`, `remaining_requests`, 
 * and `plan_exp_date` if successful. Returns `null` if the user is not found, plan is invalid, or any error occurs.
 */
const updateUserType = async (uId: string, newUserType: string): Promise<Object | null> => {
    try {
        // Find the user by uId
        const db = await getDB();
        const userDb = await db.findOne({ uId });

        if (!userDb) {
            console.error("User not found.");
            return null;
        }

        // Convert the string plan type to LumosPlan enum
        const newPlan = getLumosPlanFromString(newUserType);
        if (!newPlan) {
            console.error("User plan not found");
            return null;
        }

        // Get the details of the new plan
        const planDetails = getPlanDetails(newPlan);
        if (!planDetails) {
            console.error("Plan details not found.");
            return null;
        }

        // Prepare the data for updating the user
        const updateData = {
            user_type: newPlan,
            remaining_requests: planDetails.dailyRequests,
            plan_exp_date: newPlan === LumosPlan.Free ? null : getFutureDate(planDetails.expirationDays),
        };

        // Update the user's plan in the database
        const result = await db.updateOne({ uId }, { $set: updateData });

        if (result.matchedCount === 0) {
            console.error("User not found.");
            return null;
        }

        // Return the updated user data
        return { uId, ...updateData };
    } catch (error) {
        console.error("Error updating user plan:", error);
        return null;
    }
};

export default { 
    getAllUsers, 
    getUserById, 
    createUser, 
    updateUser, 
    deleteUser, 
    getUserByUId, 
    updateUserType 
};