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

    // Handle multipart form data (image upload)
    let ModuleName, ModuleDescription, ModuleImage;

    if (req.is('multipart/form-data')) {
        ModuleName = req.body.ModuleName;
        ModuleDescription = req.body.ModuleDescription;
        ModuleImage = req.file ? req.file.buffer : null; // Assuming multer middleware is used
    } else {
        // Handle JSON data
        ModuleName = req.body.ModuleName;
        ModuleDescription = req.body.ModuleDescription;
        ModuleImage = req.body.ModuleImage === null ? null : undefined; // Only set to null if explicitly set
    }

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
                    ModuleImage !== undefined ? ModuleImage : null, // Only update image if explicitly set
                    moduleId
                ]);

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

export const deleteModule = (req, res) => {
    const { moduleId } = req.body;

    // Input validation
    if (!moduleId || isNaN(moduleId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid module ID provided",
        });
    }

    try {
        connectToDatabase(async (err, conn) => {
            if (err) {
                logError(err);
                return res.status(500).json({
                    success: false,
                    message: "Database connection error",
                });
            }

            try {
                // Check if module exists and isn't deleted
                const checkQuery = `
                    SELECT * FROM ModulesDetails 
                    WHERE ModuleID = ? AND (delStatus IS NULL OR delStatus = 0)
                `;
                const [existingModule] = await queryAsync(conn, checkQuery, [moduleId]);

                if (!existingModule) {
                    closeConnection(conn);
                    return res.status(404).json({
                        success: false,
                        message: "Module not found or already deleted",
                    });
                }

                // Perform the soft delete
                const deleteQuery = `
                    UPDATE ModulesDetails
                    SET 
                        delStatus = 1,
                        delOnDt = GETDATE()
                    WHERE ModuleID = ? AND (delStatus IS NULL OR delStatus = 0)
                `;

                const result = await queryAsync(conn, deleteQuery, [moduleId]);
                closeConnection(conn);

                // Check if update was successful

                return res.status(200).json({
                    success: true,
                    data: {
                        moduleId: moduleId,
                        deletedAt: new Date().toISOString()
                    },
                    message: "Module deleted successfully",
                });

            } catch (error) {
                closeConnection(conn);
                logError(`Error deleting module: ${error.message}`);
                return res.status(500).json({
                    success: false,
                    message: "Database error during deletion",
                });
            }
        });
    } catch (outerError) {
        logError(`Unexpected error: ${outerError.message}`);
        return res.status(500).json({
            success: false,
            message: "Unexpected server error",
        });
    }
};

export const deleteSubModule = (req, res) => {
    const { subModuleId } = req.body;

    // Input validation
    if (!subModuleId || isNaN(subModuleId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid sub-module ID provided",
        });
    }

    try {
        connectToDatabase(async (err, conn) => {
            if (err) {
                logError(err);
                return res.status(500).json({
                    success: false,
                    message: "Database connection error",
                });
            }

            try {
                // Check if sub-module exists and isn't deleted
                const checkQuery = `
                    SELECT * FROM SubModulesDetails 
                    WHERE SubModuleID = ? AND (delStatus IS NULL OR delStatus = 0)
                `;
                const [existingSubModule] = await queryAsync(conn, checkQuery, [subModuleId]);

                if (!existingSubModule) {
                    closeConnection(conn);
                    return res.status(404).json({
                        success: false,
                        message: "Sub-module not found or already deleted",
                    });
                }

                // Perform the soft delete
                const deleteQuery = `
                    UPDATE SubModulesDetails
                    SET 
                        delStatus = 1,
                        delOnDt = GETDATE(),
                        AddDel = ?
                    WHERE SubModuleID = ? AND (delStatus IS NULL OR delStatus = 0)
                `;

                const adminId = req.user?.id; // Get current user ID
                await queryAsync(conn, deleteQuery, [adminId, subModuleId]);
                closeConnection(conn);

                return res.status(200).json({
                    success: true,
                    data: {
                        subModuleId: subModuleId,
                        deletedAt: new Date().toISOString(),
                        deletedBy: adminId
                    },
                    message: "Sub-module deleted successfully",
                });

            } catch (error) {
                closeConnection(conn);
                logError(`Error deleting sub-module: ${error.message}`);
                return res.status(500).json({
                    success: false,
                    message: "Database error during deletion",
                });
            }
        });
    } catch (outerError) {
        logError(`Unexpected error: ${outerError.message}`);
        return res.status(500).json({
            success: false,
            message: "Unexpected server error",
        });
    }
};






