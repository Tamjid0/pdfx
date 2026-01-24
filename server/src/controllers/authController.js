import User from '../models/User.js';
import logger from '../utils/logger.js';

/**
 * Syncs a Firebase user with the MongoDB database.
 * If the user doesn't exist, it creates a new record.
 * If the user exists, it updates their last login and basic profile info.
 */
export const syncUser = async (req, res) => {
    try {
        const { firebaseUid, email, displayName, photoURL } = req.body;

        if (!firebaseUid || !email) {
            return res.status(400).json({
                success: false,
                message: 'firebaseUid and email are required for sync'
            });
        }

        // Find existing user or create a new one
        let user = await User.findOne({ firebaseUid });

        if (user) {
            // Update existing user profile info if it changed
            user.displayName = displayName || user.displayName;
            user.photoURL = photoURL || user.photoURL;
            user.lastLogin = Date.now();
            await user.save();
            logger.info(`User synced (updated): ${email}`);
        } else {
            // Create new user
            user = await User.create({
                firebaseUid,
                email,
                displayName,
                photoURL,
                tier: 'free',
                credits: 10
            });
            logger.info(`User synced (created): ${email}`);
        }

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                email: user.email,
                displayName: user.displayName,
                tier: user.tier,
                credits: user.credits
            }
        });
    } catch (error) {
        logger.error('Error in syncUser:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during auth sync'
        });
    }
};
