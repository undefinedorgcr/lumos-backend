import clientPromise from "../lib/mongodb";
import { ObjectId } from "mongodb";

/**
 * Retrieves the MongoDB collection for users.
 * @returns {Promise<Collection>} The 'users' collection from the database.
 */
const getDB = async () => {
    const client = await clientPromise;
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
 * Creates a new user in the database.
 * @param {any} user - The user data to be inserted.
 * @returns {Promise<string | null>} The inserted user ID if successful, otherwise null.
 */
const createUser = async (user: any): Promise<string | null> => {
    try {
        const result = await (await getDB()).insertOne(user);
        return result.insertedId.toString();  // Ensure it's returned as a string.
    } catch (e) {
        console.error(e);
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

export default { getAllUsers, getUserById, createUser, updateUser, deleteUser };