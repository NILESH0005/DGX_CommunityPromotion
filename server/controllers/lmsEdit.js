import { body, validationResult } from "express-validator";
import { connectToDatabase, closeConnection } from "../database/mySql.js";
import dotenv from "dotenv";
import {
    queryAsync,
    mailSender,
    logError,
    logInfo,
    logWarning,
} from "../helper/index.js";

dotenv.config();

export const updateModule = async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const warningMessage = "Data is not in the right format";
        console.error(warningMessage, errors.array());
        logWarning(warningMessage);
        return res.status(400).json({ success, data: errors.array(), message: warningMessage });
    }

    const userId = req.user?.UserID;
    const moduleId = parseInt(req.params.id, 10);
    const { ModuleName, ModuleDescription, ModuleImage } = req.body;

    try {
        connectToDatabase(async (err, conn) => {
            if (err) {
                const errorMessage = "Failed to connect to database";
                logError(err);
                return res.status(500).json({ success: false, data: err, message: errorMessage });
            }

            try {
                // Step 1: Fetch user details
                const userQuery = `SELECT Name FROM Community_User WHERE ISNULL(delStatus, 0) = 0 AND UserID = ?`;
                const userRows = await queryAsync(conn, userQuery, [userId]);

                if (userRows.length === 0) {
                    closeConnection(conn);
                    return res.status(404).json({ success: false, data: {}, message: "User not found" });
                }

                const userName = userRows[0].Name;
                const currentDateTime = new Date();

                // Step 2: Prepare the ModuleImage parameter
                let moduleImageParam = null;

                if (typeof ModuleImage === 'string') {
                    if (ModuleImage.startsWith('data:')) {
                        const base64Data = ModuleImage.split(',')[1];
                        moduleImageParam = Buffer.from(base64Data, 'base64');
                    } else {
                        moduleImageParam = Buffer.from(ModuleImage, 'base64');
                    }
                }


                // Step 3: Perform the update
                const updateQuery = `
                   UPDATE ModulesDetails
                    SET 
                        ModuleName = ?,
                        ModuleDescription = ?,
                        AuthLstEdit = ?,
                        editOnDt = ?,
                        ModuleImage = ?
                    WHERE ModuleID = ? AND ISNULL(delStatus, 0) = 0
                `;

                const result = await queryAsync(conn, updateQuery, [
                    ModuleName || null,
                    ModuleDescription || null,
                    userName,
                    currentDateTime,
                    moduleImageParam, // Use the prepared image parameter
                    moduleId
                ]);

                console.log('Params:', { ModuleName, ModuleDescription, userName, currentDateTime, moduleImageParam, moduleId });


                if (result.affectedRows === 0) {
                    closeConnection(conn);
                    return res.status(404).json({ success: false, data: {}, message: "Module not found or already deleted" });
                }

                // Step 4: Fetch the updated module
                const fetchQuery = `
                    SELECT 
                        ModuleID,
                        ModuleName,
                        ModuleDescription,
                        ModuleImage,
                        AuthLstEdit,
                        editOnDt
                    FROM ModulesDetails
                    WHERE ModuleID = ? AND ISNULL(delStatus, 0) = 0
                `;

                const updatedModule = await queryAsync(conn, fetchQuery, [moduleId]);
                const moduleData = updatedModule[0];

                // Convert image to base64 for response
                if (moduleData.ModuleImage) {
                    moduleData.ModuleImage = {
                        data: moduleData.ModuleImage.toString('base64'),
                        contentType: 'image/jpeg'
                    };
                }

                success = true;
                closeConnection(conn);
                logInfo("Module updated successfully!");

                return res.status(200).json({
                    success,
                    data: moduleData,
                    message: "Module updated successfully!",
                });

            } catch (queryErr) {
                logError(queryErr);
                closeConnection(conn);
                return res.status(500).json({
                    success: false,
                    data: queryErr,
                    message: "Database Query Error",
                    details: queryErr.message
                });
            }
        });
    } catch (error) {
        logError(error);
        return res.status(500).json({
            success: false,
            data: error,
            message: "Unexpected error, please try again",
            details: error.message
        });
    }
}




