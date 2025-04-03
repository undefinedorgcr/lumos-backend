import dbPositions from '../db/positions';
import { NextApiRequest, NextApiResponse } from 'next';
import { Position } from '../types/position';

const handleGetPositions = async (res: NextApiResponse) => {
	try {
		const positions = await dbPositions.getAllPositions();
		return res.status(200).json({ positions });
	} catch (error) {
		console.error('Error fetching positions:', error);
		return res.status(500).json({ message: 'Failed to fetch positions' });
	}
};

const handleGetPositionByUId = async (
	req: NextApiRequest,
	res: NextApiResponse
) => {
	try {
		const { uId } = req.query;
		if (!uId) {
			return res.status(400).json({ message: 'Missing position ID' });
		}
		const position = await dbPositions.getPositionByUId(uId as string);
		if (!position) {
			return res.status(404).json({ message: 'Position not found' });
		}
		return res.status(200).json({ position });
	} catch (error) {
		console.error('Error fetching position:', error);
		return res.status(500).json({ message: 'Failed to fetch position' });
	}
};

const handleCreatePosition = async (
	req: NextApiRequest,
	res: NextApiResponse
) => {
	const { uId, token, total_value, protocol } = req.body;

	if (!uId || !token || !total_value || !protocol) {
		return res.status(400).json({
			message:
				'Missing or invalid required fields (uId, token, total_value , protocol )',
		});
	}

	try {
		const newPositionId = await dbPositions.createPosition({
			uId,
			token,
			total_value,
			protocol,
		});
		return res.status(201).json({
			message: 'Position created successfully',
			positionId: newPositionId,
		});
	} catch (error) {
		console.error('Error creating position:', error);
		return res.status(500).json({ message: 'Failed to create position' });
	}
};

const handleUpdatePosition = async (
	req: NextApiRequest,
	res: NextApiResponse
) => {
	const { _id, token, total_value, protocol } = req.body;

	if (!_id || !token || !total_value || !protocol) {
		return res
			.status(400)
			.json({ message: 'Missing or invalid required fields' });
	}

	try {
		const updatedPosition = await dbPositions.updatePosition({
			_id,
			token,
			total_value,
			protocol,
		});
		if (!updatedPosition) {
			return res
				.status(404)
				.json({ message: 'Position not found or update failed' });
		}
		return res.status(200).json({
			message: 'Position updated successfully',
			updatedPosition,
		});
	} catch (error) {
		console.error('Error updating position:', error);
		return res.status(500).json({ message: 'Failed to update position' });
	}
};

const handleDeletePosition = async (
	req: NextApiRequest,
	res: NextApiResponse
) => {
	const { _id } = req.body;

	if (!_id) {
		return res
			.status(400)
			.json({ message: 'Missing required field (_id)' });
	}

	try {
		const deletedPosition = await dbPositions.deletePosition(_id);
		if (!deletedPosition) {
			return res.status(404).json({ message: 'Position not found' });
		}
		return res
			.status(200)
			.json({ message: 'Position deleted successfully' });
	} catch (error) {
		console.error('Error deleting position:', error);
		return res.status(500).json({ message: 'Failed to delete position' });
	}
};

export default {
	handleGetPositions,
	handleGetPositionByUId,
	handleCreatePosition,
	handleUpdatePosition,
	handleDeletePosition,
};
