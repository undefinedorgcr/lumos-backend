import { NextApiRequest, NextApiResponse } from "next";
import { ResponseData } from "../types/positionsApiResponseData";
import dbWaitlist from '../db/waitlist';

const handleSaveEmail = async (
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            message:
                'Missing or invalid required fields (email)',
        });
    }

    try {
        const newEmail = await dbWaitlist.addEmail({
            email,
        });

        if (!newEmail) {
            return res.status(500).json({
                message: 'Error saving email',
            });
        }

        return res.status(201).json({
            message: 'Email added successfully',
        });
    } catch (error) {
        console.error('Error saving email:', error);
        return res.status(500).json({
            message: 'Failed to save email',
        });
    }
};

export default {
    handleSaveEmail,
};