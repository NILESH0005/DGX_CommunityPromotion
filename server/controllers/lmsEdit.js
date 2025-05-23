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
import { log } from "util";
import { Console } from "console";

dotenv.config();

export const updateModule = async (req, res) => {
    let success = false;

    // 1. Authentication and validation - handle both numeric ID and email
    const userId = req.user?.UserID || req.user?.id;
    if (!userId) {
        return res.status(401).json({ success, message: "User not authenticated" });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logWarning("Data validation failed", errors.array());
        return res.status(400).json({
            success,
            data: errors.array(),
            message: "Data is not in the right format",
        });
    }

    // 2. Parameter extraction
    const moduleId = parseInt(req.params.id, 10);
    if (isNaN(moduleId)) {
        return res.status(400).json({ success, message: "Invalid module ID" });
    }

    // 3. Extract/update body fields with proper image handling
    let { ModuleName, ModuleDescription, ModuleImage } = req.body;
    let imageBuffer = null;

    if (req.is("multipart/form-data")) {
        // Handle file upload from form-data
        imageBuffer = req.file ? req.file.buffer : null;
    } else if (req.body.ModuleImage?.data) {
        // Handle base64 image string
        try {
            imageBuffer = Buffer.from(req.body.ModuleImage.data, 'base64');
        } catch (e) {
            logError("Image conversion error", e);
            return res.status(400).json({
                success: false,
                message: "Invalid image format"
            });
        }
    }

    try {
        connectToDatabase(async (err, conn) => {
            if (err) {
                logError("Database connection failed", err);
                return res.status(500).json({
                    success,
                    message: "Failed to connect to database",
                });
            }

            try {
                // 4. Fetch user details - handle both numeric ID and email
                let userQuery, userRows;

                // First try to get user by numeric ID
                if (!isNaN(Number(userId))) {
                    userQuery = `
                        SELECT UserID, Name, isAdmin FROM Community_User 
                        WHERE ISNULL(delStatus, 0) = 0 AND UserID = ?
                    `;
                    userRows = await queryAsync(conn, userQuery, [Number(userId)]);
                }

                // If not found and userId looks like an email, try by email
                if ((!userRows || userRows.length === 0) && typeof userId === 'string' && userId.includes('@')) {
                    userQuery = `
                        SELECT UserID, Name, isAdmin FROM Community_User 
                        WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?
                    `;
                    userRows = await queryAsync(conn, userQuery, [userId]);
                }

                if (!userRows || userRows.length === 0) {
                    closeConnection(conn);
                    return res.status(404).json({ success, message: "User not found" });
                }

                const user = userRows[0];

                // 5. Build dynamic update query with proper image handling
                const updateParams = [
                    ModuleName || null,
                    ModuleDescription || null,
                    user.Name,
                    new Date(),
                ];

                let updateQuery = `
                    UPDATE ModulesDetails
                    SET 
                        ModuleName = ?,
                        ModuleDescription = ?,
                        AuthLstEdit = ?,
                        editOnDt = ?
                `;

                // Add image parameter only if we have an image
                if (imageBuffer !== null && imageBuffer !== undefined) {
                    updateQuery += `, ModuleImage = ?`;
                    updateParams.push(imageBuffer);
                }

                updateQuery += ` WHERE ModuleID = ? AND ISNULL(delStatus, 0) = 0`;
                updateParams.push(moduleId);

                // 6. Execute update
                const result = await queryAsync(conn, updateQuery, updateParams);

                if (result.affectedRows === 0) {
                    closeConnection(conn);
                    return res.status(404).json({
                        success,
                        message: "Module not found or already deleted",
                    });
                }

                // 7. Fetch updated module
                const fetchQuery = `
                    SELECT ModuleID, ModuleName, ModuleDescription, 
                           AuthLstEdit, editOnDt
                    FROM ModulesDetails
                    WHERE ModuleID = ? AND ISNULL(delStatus, 0) = 0
                `;

                const updatedModule = await queryAsync(conn, fetchQuery, [moduleId]);

                success = true;
                closeConnection(conn);
                logInfo("Module updated successfully");

                return res.status(200).json({
                    success,
                    data: updatedModule[0],
                    message: "Module updated successfully",
                });
            } catch (queryErr) {
                closeConnection(conn);
                logError("Database query failed", queryErr);
                return res.status(500).json({
                    success,
                    message: "Database operation failed",
                    details: queryErr.message.includes('Conversion failed')
                        ? "Invalid data type in database operation"
                        : queryErr.message,
                });
            }
        });
    } catch (error) {
        logError("Unexpected error", error);
        return res.status(500).json({
            success,
            message: "Unexpected server error",
            details: error.message,
        });
    }
};


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

export const updateSubModule = async (req, res) => {
    let success = false;

    // 1. Authentication and validation - handle both numeric ID and email
    const userId = req.user?.UserID || req.user?.id;
    if (!userId) {
        return res.status(401).json({ success, message: "User not authenticated" });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logWarning("Data validation failed", errors.array());
        return res.status(400).json({
            success,
            data: errors.array(),
            message: "Data is not in the right format",
        });
    }

    // 2. Parameter extraction
    const subModuleId = parseInt(req.params.id, 10);
    if (isNaN(subModuleId)) {
        return res.status(400).json({ success, message: "Invalid submodule ID" });
    }

    // 3. Extract/update body fields with proper image handling
    let { SubModuleName, SubModuleDescription, SubModuleImage } = req.body;
    let imageBuffer = null;

    if (req.is("multipart/form-data")) {
        // Handle file upload from form-data
        imageBuffer = req.file ? req.file.buffer : null;
    } else if (req.body.SubModuleImage?.data) {
        // Handle base64 image string
        try {
            imageBuffer = Buffer.from(req.body.SubModuleImage.data, 'base64');
        } catch (e) {
            logError("Image conversion error", e);
            return res.status(400).json({ 
                success: false, 
                message: "Invalid image format" 
            });
        }
    }

    try {
        connectToDatabase(async (err, conn) => {
            if (err) {
                logError("Database connection failed", err);
                return res.status(500).json({
                    success,
                    message: "Failed to connect to database",
                });
            }

            try {
                // 4. Fetch user details - handle both numeric ID and email
                let userQuery, userRows;

                // First try to get user by numeric ID
                if (!isNaN(Number(userId))) {
                    userQuery = `
                        SELECT UserID, Name, isAdmin FROM Community_User 
                        WHERE ISNULL(delStatus, 0) = 0 AND UserID = ?
                    `;
                    userRows = await queryAsync(conn, userQuery, [Number(userId)]);
                }
                
                // If not found and userId looks like an email, try by email
                if ((!userRows || userRows.length === 0) && typeof userId === 'string' && userId.includes('@')) {
                    userQuery = `
                        SELECT UserID, Name, isAdmin FROM Community_User 
                        WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?
                    `;
                    userRows = await queryAsync(conn, userQuery, [userId]);
                }

                if (!userRows || userRows.length === 0) {
                    closeConnection(conn);
                    return res.status(404).json({ success, message: "User not found" });
                }

                const user = userRows[0];

                // 5. Build dynamic update query with proper image handling
                const updateParams = [
                    SubModuleName || null,
                    SubModuleDescription || null,
                    user.Name,  // AuthLstEdit
                    new Date(),  // editOnDt
                ];

                let updateQuery = `
                    UPDATE SubModulesDetails
                    SET 
                        SubModuleName = ?,
                        SubModuleDescription = ?,
                        AuthLstEdit = ?,
                        editOnDt = ?
                `;

                // Add image parameter only if we have an image
                if (imageBuffer !== null && imageBuffer !== undefined) {
                    updateQuery += `, SubModuleImage = ?`;
                    updateParams.push(imageBuffer);
                }

                updateQuery += ` WHERE SubModuleID = ? AND ISNULL(delStatus, 0) = 0`;
                updateParams.push(subModuleId);

                // 6. Execute update
                const result = await queryAsync(conn, updateQuery, updateParams);

                if (result.affectedRows === 0) {
                    closeConnection(conn);
                    return res.status(404).json({
                        success,
                        message: "Submodule not found or already deleted",
                    });
                }

                // 7. Fetch updated submodule
                const fetchQuery = `
                    SELECT 
                        SubModuleID, 
                        SubModuleName, 
                        SubModuleDescription,
                        AuthLstEdit, 
                        editOnDt
                    FROM SubModulesDetails
                    WHERE SubModuleID = ? AND ISNULL(delStatus, 0) = 0
                `;

                const updatedSubModule = await queryAsync(conn, fetchQuery, [subModuleId]);

                success = true;
                closeConnection(conn);
                logInfo("Submodule updated successfully");

                return res.status(200).json({
                    success,
                    data: updatedSubModule[0],
                    message: "Submodule updated successfully",
                });
            } catch (queryErr) {
                closeConnection(conn);
                logError("Database query failed", queryErr);
                return res.status(500).json({
                    success,
                    message: "Database operation failed",
                    details: queryErr.message.includes('Conversion failed') 
                        ? "Invalid data type in database operation" 
                        : queryErr.message,
                });
            }
        });
    } catch (error) {
        logError("Unexpected error", error);
        return res.status(500).json({
            success,
            message: "Unexpected server error",
            details: error.message,
        });
    }
};






