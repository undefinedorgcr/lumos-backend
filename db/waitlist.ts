import clientPromise from '../lib/mongodb';

const getDB = async () => {
	const client = await clientPromise.connect();
	return client.db('lumos').collection('waitlist');
};

const addEmail = async (email: any): Promise<string | null> => {
    try {
        const db = await getDB();

        const result = await db.insertOne(email);
        return result.insertedId.toString();
    } catch (e) {
        console.error('Database error:', e);
        return null;
    }
};

export default {
	addEmail,
};
