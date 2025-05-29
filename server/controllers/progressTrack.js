import { body, validationResult } from 'express-validator';
import { connectToDatabase, closeConnection } from '../database/mySql.js';
import dotenv from 'dotenv'
import { queryAsync, mailSender, logError, logInfo, logWarning } from '../helper/index.js';

dotenv.config()

export const getUserFileIDs = async (req, res) => {
    let success = false;
    const userId = req.user.id; // Changed from userId to id to match getUserDiscussion
    console.log("Received request for getUserFileIDs. User ID:", userId);

    try {
        connectToDatabase(async (err, conn) => {
            if (err) {
                const errorMessage = "Database connection failed";
                logError(err);
                return res.status(500).json({
                    success: false,
                    data: err,
                    message: errorMessage
                });
            }

            try {
                // First get the user details
                const userQuery = `
                    SELECT UserID 
                    FROM Community_User 
                    WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?
                `;
                const userRows = await queryAsync(conn, userQuery, [userId]);

                if (userRows.length === 0 || !userRows[0].UserID) {
                    closeConnection();
                    return res.status(404).json({
                        success: false,
                        message: "User not found",
                        data: []
                    });
                }

                const dbUserID = userRows[0].UserID;

                // Get total count of files first
                const countQuery = `
                    SELECT COUNT(*) as totalCount 
                    FROM UserLmsProgress 
                    WHERE UserID = ? AND ISNULL(delStatus, 0) = 0
                `;
                const countResult = await queryAsync(conn, countQuery, [dbUserID]);
                const totalCount = countResult[0].totalCount;

                // Then get the file IDs
                const fileQuery = `
                    SELECT FileID 
                    FROM UserLmsProgress 
                    WHERE UserID = ? AND ISNULL(delStatus, 0) = 0
                    ORDER BY FileID DESC
                `;
                const fileIds = await queryAsync(conn, fileQuery, [dbUserID]);

                success = true;
                closeConnection();

                const successMessage = "File IDs fetched successfully";
                logInfo(successMessage);

                res.status(200).json({
                    success,
                    data: {
                        fileIds,
                        totalCount
                    },
                    message: successMessage
                });

            } catch (queryErr) {
                logError(queryErr);
                closeConnection();
                res.status(500).json({
                    success: false,
                    message: "Query execution failed",
                    data: queryErr
                });
            }
        });
    } catch (error) {
        logError(error);
        res.status(500).json({
            success: false,
            data: {},
            message: "Unexpected error occurred"
        });
    }
};


