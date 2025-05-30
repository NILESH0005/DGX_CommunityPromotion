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

export const getSubModuleProgress = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage = "Data is not in the right format";
    console.error(warningMessage, errors.array());
    logWarning(warningMessage);
    return res.status(400).json({ success, data: errors.array(), message: warningMessage });
  }

  try {
    // Get user email from JWT token (like in getUserQuizHistory)
    const userEmail = req.user.id;
    console.log("User email from token:", userEmail);

    connectToDatabase(async (err, conn) => {
      if (err) {
        const errorMessage = "Failed to connect to database";
        logError(err);
        return res.status(500).json({ success: false, data: err, message: errorMessage });
      }

      try {
        const { subModuleID } = req.body; // Now only need subModuleID from body
        
        // First get the user ID from email (like in getUserQuizHistory)
        const userIdQuery = "SELECT UserID FROM Community_User WHERE EmailId = ? AND ISNULL(delStatus, 0) = 0";
        const userResult = await queryAsync(conn, userIdQuery, [userEmail]);

        if (!userResult || userResult.length === 0) {
          const errorMessage = "User not found";
          logError(errorMessage);
          closeConnection();
          return res.status(404).json({ success: false, message: errorMessage });
        }

        const userID = userResult[0].UserID;
        console.log("Found user ID:", userID);

        // Query 1: Get total files count in the submodule
        const totalFilesQuery = `
          SELECT COUNT(FileID) as totalFiles 
          FROM FilesDetails fd
          INNER JOIN UnitsDetails ud ON ud.UnitID = fd.UnitID AND ISNULL(ud.delStatus, 0) = 0
          INNER JOIN SubModulesDetails mds ON mds.SubModuleID = ud.SubModuleID AND ISNULL(mds.delStatus, 0) = 0     
          WHERE mds.SubModuleID = ? AND ISNULL(mds.delStatus, 0) = 0 AND ISNULL(fd.delStatus, 0) = 0
        `;
        
        // Query 2: Get files read by user in the submodule
        const userProgressQuery = `
          SELECT COUNT(*) as filesRead 
          FROM UserLmsProgress 
          WHERE ISNULL(delStatus, 0) = 0 
          AND UserID = ? 
          AND FileID IN (
            SELECT FileID FROM FilesDetails
            LEFT JOIN UnitsDetails ON UnitsDetails.UnitID = FilesDetails.UnitID AND ISNULL(UnitsDetails.delStatus, 0) = 0
            LEFT JOIN SubModulesDetails smd ON UnitsDetails.SubModuleID = smd.SubModuleID AND ISNULL(smd.delStatus, 0) = 0
            WHERE smd.SubModuleID = ? AND ISNULL(FilesDetails.delStatus, 0) = 0
          )
        `;

        // Execute both queries
        const [totalFilesResult] = await queryAsync(conn, totalFilesQuery, [subModuleID]);
        const [userProgressResult] = await queryAsync(conn, userProgressQuery, [userID, subModuleID]);

        const totalFiles = totalFilesResult.totalFiles || 0;
        const filesRead = userProgressResult.filesRead || 0;
        
        // Calculate progress percentage (handle division by zero)
        const progress = totalFiles > 0 ? Math.round((filesRead / totalFiles) * 100) : 0;

        success = true;
        closeConnection();
        const infoMessage = "Submodule progress calculated successfully";
        logInfo(infoMessage);
        return res.status(200).json({ 
          success, 
          data: { 
            subModuleID,
            userID,
            totalFiles,
            filesRead,
            progressPercentage: progress 
          }, 
          message: infoMessage 
        });
      } catch (queryErr) {
        logError(queryErr);
        closeConnection();
        return res.status(500).json({
          success: false,
          data: queryErr,
          message: "Something went wrong please try again",
        });
      }
    });
  } catch (error) {
    logError(error);
    return res.status(500).json({
      success: false,
      data: {},
      message: "Something went wrong please try again",
    });
  }
};


