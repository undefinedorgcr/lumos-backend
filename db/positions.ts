import { ObjectId } from 'mongodb';
import clientPromise from '../lib/mongodb';

const getDB = async () => {
	const client = await clientPromise.connect();
	return client.db('lumos').collection('positions');
};

const getAllPositions = async (): Promise<any[]> => {
	try {
		const positions = await (await getDB())
			.find({})
			.sort({ add_date: -1 })
			.toArray();
		return positions;
	} catch (e) {
		console.error(e);
		return [];
	}
};

const getPositionById = async (id: string): Promise<any | null> => {
	try {
		const position = await (
			await getDB()
		).findOne({ _id: new ObjectId(id) });
		return position;
	} catch (e) {
		console.error(e);
		return null;
	}
};

const createPosition = async (position: any): Promise<string | null> => {
	try {
		const db = await getDB();
		position.add_date = new Date();
		const result = await db.insertOne(position);
		return result.insertedId.toString();
	} catch (e) {
		console.error('Database error:', e);
		return null;
	}
};

const updatePosition = async (position: any): Promise<any | null> => {
	try {
		const { _id, ...updateData } = position;
		const objectId = new ObjectId(_id);

		const result = await (
			await getDB()
		).updateOne({ _id: objectId }, { $set: updateData });

		if (result.matchedCount === 0) {
			console.error('Position not found.');
			return null;
		}

		return { _id, ...updateData };
	} catch (error) {
		console.error('Error updating position:', error);
		return null;
	}
};

const deletePosition = async (id: string): Promise<boolean> => {
	try {
		const result = await (
			await getDB()
		).deleteOne({ _id: new ObjectId(id) });
		return result.deletedCount > 0;
	} catch (e) {
		console.error(e);
		return false;
	}
};

export default {
	getAllPositions,
	getPositionById,
	createPosition,
	updatePosition,
	deletePosition,
};
