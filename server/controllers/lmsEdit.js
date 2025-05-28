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
                           AuthLstEdit, editOnDt, ModuleImage
                    FROM ModulesDetails
                    WHERE ModuleID = ? AND ISNULL(delStatus, 0) = 0
                `;

                const updatedModule = await queryAsync(conn, fetchQuery, [moduleId]);
                const moduleData = updatedModule[0];
                if (moduleData.ModuleImage) {
                    moduleData.ModuleImage = {
                        data: moduleData.ModuleImage.toString('base64'),
                        contentType: 'image/jpeg' // Adjust based on your actual image type
                    };
                }
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

    // 1. Authentication and validation
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

    let conn; // Declare connection outside try-catch

    try {
        // Get database connection
        conn = await new Promise((resolve, reject) => {
            connectToDatabase((err, connection) => {
                if (err) return reject(err);
                resolve(connection);
            });
        });

        // Begin transaction
        await queryAsync(conn, "BEGIN TRANSACTION");

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
            await queryAsync(conn, "ROLLBACK");
            closeConnection(conn);
            return res.status(404).json({ success, message: "User not found" });
        }

        const user = userRows[0];

        // 5. Build dynamic update query with proper image handling
        let imageBuffer = null;
        if (SubModuleImage) {
            if (SubModuleImage.startsWith('data:image')) {
                const base64Data = SubModuleImage.replace(/^data:image\/\w+;base64,/, '');
                imageBuffer = Buffer.from(base64Data, 'base64');
            } else {
                imageBuffer = Buffer.from(SubModuleImage, 'binary');
            }
        }

        const updateParams = [
            SubModuleName || null,
            SubModuleDescription || null,
            imageBuffer,
            user.Name,
            new Date(),
            subModuleId
        ];
        console.log("save updateParams test", updateParams);
        let updateQuery = `
            UPDATE SubModulesDetails
            SET 
                SubModuleName = ?,
                SubModuleDescription = ?,
                SubModuleImage=CONVERT(IMAGE, ?),
                AuthLstEdit = ?,
                editOnDt = ?
        `;

        // Add image parameter only if we have an image
        // if (imageBuffer !== null && imageBuffer !== undefined) {
        //     updateQuery += `, SubModuleImage = ?`;
        //     updateParams.push(imageBuffer);
        // }

        updateQuery += ` WHERE SubModuleID = ? AND ISNULL(delStatus, 0) = 0`;
        //console.log("Update test query",updateQuery);
        //updateParams.push(subModuleId);

        // 6. Execute update
        const result = await queryAsync(conn, updateQuery, updateParams);
        console.log("save result test", result);
        if (result.affectedRows === 0) {
            await queryAsync(conn, "ROLLBACK");
            closeConnection(conn);
            return res.status(404).json({
                success,
                message: "Submodule not found or already deleted",
            });
        }

        // 7. Fetch updated submodule
        const fetchQuery = `
            SELECT SubModuleID, SubModuleName, SubModuleDescription, 
                   AuthLstEdit, editOnDt, SubModuleImage
            FROM SubModulesDetails
            WHERE SubModuleID = ? AND ISNULL(delStatus, 0) = 0
        `;

        const updatedSubmodule = await queryAsync(conn, fetchQuery, [subModuleId]);
        const submoduleData = updatedSubmodule[0];

        // Convert image buffer to base64 if it exists
        if (submoduleData.SubModuleImage) {
            submoduleData.SubModuleImage = {
                data: submoduleData.SubModuleImage.toString('base64'),
                contentType: 'image/jpeg' // Adjust based on your actual image type
            };
        }

        // Commit transaction
        await queryAsync(conn, "COMMIT");
        success = true;
        logInfo("Submodule updated successfully");

        return res.status(200).json({
            success,
            data: submoduleData,
            message: "Submodule updated successfully",
        });

    } catch (error) {
        // Rollback transaction if there was an error
        if (conn) {
            await queryAsync(conn, "ROLLBACK").catch(rollbackErr => {
                logError("Rollback failed", rollbackErr);
            });
        }

        logError("Unexpected error", error);
        return res.status(500).json({
            success,
            message: "Unexpected server error",
            details: error.message,
        });
    } finally {
        // Close connection if it exists
        if (conn) {
            closeConnection(conn);
        }
    }
};

export const addSubmodule = async (req, res) => {
    console.log("Incoming request body", req.body);
    let success = false;
    const userId = req.user.id;
    console.log("User ID:", userId);


    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const warningMessage = "Data is not in the right format";
        logWarning(warningMessage);
        return res.status(400).json({
            success,
            data: errors.array(),
            message: warningMessage
        });
    }

    try {
        const {
            SubModuleName,
            SubModuleDescription,
            SubModuleImage,
            ModuleID // Added ModuleID from request body
        } = req.body;

        // Validate required ModuleID
        if (!ModuleID) {
            const warningMessage = "ModuleID is required";
            logWarning(warningMessage);
            return res.status(400).json({
                success: false,
                data: {},
                message: warningMessage
            });
        }

        // Connect to database
        connectToDatabase(async (err, conn) => {
            if (err) {
                const errorMessage = "Failed to connect to database";
                logError(errorMessage);
                return res.status(500).json({
                    success: false,
                    data: err,
                    message: errorMessage
                });
            }

            try {
                const userQuery = `SELECT UserID, Name FROM Community_User WHERE ISNULL(delStatus,0) = 0 AND EmailId = ?`;
                const userRows = await queryAsync(conn, userQuery, [userId]);

                if (userRows.length === 0) {
                    closeConnection();
                    const warningMessage = "User not found";
                    logWarning(warningMessage);
                    return res.status(404).json({
                        success: false,
                        data: {},
                        message: warningMessage
                    });
                }

                let imageBuffer = null;
                if (SubModuleImage) {
                    if (SubModuleImage.startsWith('data:image')) {
                        const base64Data = SubModuleImage.replace(/^data:image\/\w+;base64,/, '');
                        imageBuffer = Buffer.from(base64Data, 'base64');
                    } else {
                        imageBuffer = Buffer.from(SubModuleImage, 'binary');
                    }
                }

                // Insert new submodule with ModuleID
                const insertQuery = `
                    INSERT INTO SubModulesDetails 
                    (
                        SubModuleName, 
                        SubModuleImage, 
                        SubModuleDescription,
                        ModuleID,
                        AuthAdd,
                        AddOnDt,
                        delStatus
                    ) 
                    VALUES (?, CONVERT(IMAGE, ?), ?, ?, ?, GETDATE(), 0);
                `;

                const insertResult = await queryAsync(
                    conn,
                    insertQuery,
                    [
                        SubModuleName,
                        imageBuffer,
                        SubModuleDescription,
                        ModuleID, // Added ModuleID parameter
                        userRows[0].Name
                    ]
                );

                // Get the newly created submodule
                const newSubmoduleQuery = `
                    SELECT * FROM SubModulesDetails 
                    WHERE SubModuleID = SCOPE_IDENTITY() 
                    AND ISNULL(delStatus,0) = 0;
                `;
                const newSubmodule = await queryAsync(conn, newSubmoduleQuery);

                success = true;
                closeConnection();

                const infoMessage = "Submodule added successfully";
                logInfo(infoMessage);

                return res.status(200).json({
                    success,
                    data: newSubmodule[0],
                    message: infoMessage
                });

            } catch (queryErr) {
                closeConnection();
                console.error("Database Query Error:", queryErr);
                logError(queryErr);
                return res.status(500).json({
                    success: false,
                    data: queryErr,
                    message: 'Failed to add submodule. Please check your input data.'
                });
            }
        });
    } catch (error) {
        logError(error);
        return res.status(500).json({
            success: false,
            data: {},
            message: 'Internal server error'
        });
    }
};

export const deleteUnit = (req, res) => {
    const { unitId } = req.body;

    // Input validation
    if (!unitId || isNaN(unitId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid unit ID provided",
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
                // Check if unit exists and isn't deleted
                const checkQuery = `
                    SELECT * FROM UnitsDetails 
                    WHERE UnitID = ? AND (delStatus IS NULL OR delStatus = 0)
                `;
                const [existingUnit] = await queryAsync(conn, checkQuery, [unitId]);

                if (!existingUnit) {
                    closeConnection(conn);
                    return res.status(404).json({
                        success: false,
                        message: "Unit not found or already deleted",
                    });
                }

                // Perform the soft delete
                const deleteQuery = `
                    UPDATE UnitsDetails
                    SET 
                        delStatus = 1,
                        delOnDt = GETDATE(),
                        AddDel = ?
                    WHERE UnitID = ? AND (delStatus IS NULL OR delStatus = 0)
                `;

                const adminId = req.user?.id; // Get current user ID
                await queryAsync(conn, deleteQuery, [adminId, unitId]);
                closeConnection(conn);

                return res.status(200).json({
                    success: true,
                    data: {
                        unitId: unitId,
                        deletedAt: new Date().toISOString(),
                        deletedBy: adminId
                    },
                    message: "Unit deleted successfully",
                });

            } catch (error) {
                closeConnection(conn);
                logError(`Error deleting unit: ${error.message}`);
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


export const updateUnit = async (req, res) => {
    let success = false;

    // 1. Authentication and validation
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
    const unitId = parseInt(req.params.id, 10);
    if (isNaN(unitId)) {
        return res.status(400).json({ success, message: "Invalid unit ID" });
    }

    // 3. Extract body fields
    const { UnitName, UnitDescription } = req.body;

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
                let userQuery, userRows;

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

                // 5. Build update query
                const updateQuery = `
                    UPDATE UnitsDetails
                    SET 
                        UnitName = ?,
                        UnitDescription = ?,
                        AuthLstEdit = ?,
                        editOnDt = ?
                    WHERE UnitID = ? AND ISNULL(delStatus, 0) = 0
                `;

                const updateParams = [
                    UnitName || null,
                    UnitDescription || null,
                    user.Name,  // AuthLstEdit
                    new Date(),  // editOnDt
                    unitId
                ];

                // 6. Execute update
                const result = await queryAsync(conn, updateQuery, updateParams);

                if (result.affectedRows === 0) {
                    closeConnection(conn);
                    return res.status(404).json({
                        success,
                        message: "Unit not found or already deleted",
                    });
                }

                // 7. Fetch updated unit
                const fetchQuery = `
                    SELECT 
                        UnitID, 
                        UnitName, 
                        UnitDescription,
                        AuthLstEdit, 
                        editOnDt
                    FROM UnitsDetails
                    WHERE UnitID = ? AND ISNULL(delStatus, 0) = 0
                `;

                const updatedUnit = await queryAsync(conn, fetchQuery, [unitId]);

                success = true;
                closeConnection(conn);
                logInfo("Unit updated successfully");

                return res.status(200).json({
                    success,
                    data: updatedUnit[0],
                    message: "Unit updated successfully",
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

export const deleteFile = (req, res) => {
    const { fileId } = req.body;

    // Input validation
    if (!fileId || isNaN(fileId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid file ID provided",
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
                await queryAsync(conn, 'BEGIN TRANSACTION');

                // Check if file exists and isn't deleted
                const checkQuery = `
                    SELECT * FROM FilesDetails 
                    WHERE FileID = ? AND (delStatus IS NULL OR delStatus = 0)
                `;
                const [existingFile] = await queryAsync(conn, checkQuery, [fileId]);

                if (!existingFile) {
                    await queryAsync(conn, 'ROLLBACK TRANSACTION');
                    closeConnection(conn);
                    return res.status(404).json({
                        success: false,
                        message: "File not found or already deleted",
                    });
                }

                // Get the unit ID before deleting
                const unitId = existingFile.UnitID;

                // Perform the soft delete
                const deleteQuery = `
                    UPDATE FilesDetails
                    SET 
                        delStatus = 1,
                        delOnDt = GETDATE(),
                        AddDel = ?
                    WHERE FileID = ? AND (delStatus IS NULL OR delStatus = 0)
                `;

                const adminId = req.user?.id; // Get current user ID
                await queryAsync(conn, deleteQuery, [adminId, fileId]);

                // Count remaining active files in the unit
                const countQuery = `
                    SELECT COUNT(*) as remainingCount 
                    FROM FilesDetails 
                    WHERE UnitID = ? AND (delStatus IS NULL OR delStatus = 0)
                `;
                const [countResult] = await queryAsync(conn, countQuery, [unitId]);

                // Update percentages if files remain
                if (countResult.remainingCount > 0) {
                    const newPercentage = (100 / countResult.remainingCount).toFixed(2);

                    await queryAsync(
                        conn,
                        `UPDATE FilesDetails 
                         SET Percentage = ?
                         WHERE UnitID = ? AND (delStatus IS NULL OR delStatus = 0)`,
                        [newPercentage, unitId]
                    );
                }

                await queryAsync(conn, 'COMMIT TRANSACTION');
                closeConnection(conn);

                return res.status(200).json({
                    success: true,
                    data: {
                        fileId: fileId,
                        deletedAt: new Date().toISOString(),
                        deletedBy: adminId,
                        fileName: existingFile.FilesName,
                        unitId: unitId,
                        remainingFiles: countResult.remainingCount,
                        newPercentage: countResult.remainingCount > 0 ?
                            (100 / countResult.remainingCount).toFixed(2) : 0
                    },
                    message: "File deleted successfully",
                });

            } catch (error) {
                await queryAsync(conn, 'ROLLBACK TRANSACTION');
                closeConnection(conn);
                logError(`Error deleting file: ${error.message}`);
                return res.status(500).json({
                    success: false,
                    message: "Database error during deletion",
                    details: error.message
                });
            }
        });
    } catch (outerError) {
        logError(`Unexpected error: ${outerError.message}`);
        return res.status(500).json({
            success: false,
            message: "Unexpected server error",
            details: outerError.message
        });
    }
};

export const addUnit = async (req, res) => {
    console.log("Incoming request body", req.body);
    let success = false;
    const userId = req.user?.id || req.user?.UserID;
    console.log("User ID:", userId);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const warningMessage = "Data is not in the right format";
        logWarning(warningMessage);
        return res.status(400).json({
            success,
            data: errors.array(),
            message: warningMessage
        });
    }

    try {
        const {
            UnitName,
            UnitDescription,
            SubModuleID // Required parent reference
        } = req.body;

        // Validate required fields
        if (!SubModuleID) {
            const warningMessage = "SubModuleID is required";
            logWarning(warningMessage);
            return res.status(400).json({
                success: false,
                data: {},
                message: warningMessage
            });
        }

        // Connect to database
        connectToDatabase(async (err, conn) => {
            if (err) {
                const errorMessage = "Failed to connect to database";
                logError(errorMessage);
                return res.status(500).json({
                    success: false,
                    data: err,
                    message: errorMessage
                });
            }

            try {
                // Get user details
                let userQuery, userRows;

                // Try by numeric ID first
                if (!isNaN(Number(userId))) {
                    userQuery = `SELECT UserID, Name FROM Community_User WHERE ISNULL(delStatus,0) = 0 AND UserID = ?`;
                    userRows = await queryAsync(conn, userQuery, [Number(userId)]);
                }

                // If not found and looks like email, try by email
                if ((!userRows || userRows.length === 0) && typeof userId === 'string' && userId.includes('@')) {
                    userQuery = `SELECT UserID, Name FROM Community_User WHERE ISNULL(delStatus,0) = 0 AND EmailId = ?`;
                    userRows = await queryAsync(conn, userQuery, [userId]);
                }

                if (!userRows || userRows.length === 0) {
                    closeConnection(conn);
                    const warningMessage = "User not found";
                    logWarning(warningMessage);
                    return res.status(404).json({
                        success: false,
                        data: {},
                        message: warningMessage
                    });
                }

                // Insert new unit
                const insertQuery = `
                    INSERT INTO UnitsDetails 
                    (
                        UnitName, 
                        UnitDescription,
                        SubModuleID,
                        AuthAdd,
                        AddOnDt,
                        delStatus
                    ) 
                    VALUES (?, ?, ?, ?, GETDATE(), 0);
                `;

                const insertResult = await queryAsync(
                    conn,
                    insertQuery,
                    [
                        UnitName,
                        UnitDescription || null,
                        SubModuleID,
                        userRows[0].Name
                    ]
                );

                // Get the newly created unit
                const newUnitQuery = `
                    SELECT 
                        UnitID,
                        UnitName,
                        UnitDescription,
                        SubModuleID,
                        AuthAdd,
                        AddOnDt
                    FROM UnitsDetails
                    WHERE UnitID = SCOPE_IDENTITY() 
                    AND ISNULL(delStatus,0) = 0;
                `;
                const newUnit = await queryAsync(conn, newUnitQuery);

                success = true;
                closeConnection(conn);

                const infoMessage = "Unit added successfully";
                logInfo(infoMessage);

                return res.status(200).json({
                    success,
                    data: newUnit[0],
                    message: infoMessage
                });

            } catch (queryErr) {
                closeConnection(conn);
                console.error("Database Query Error:", queryErr);
                logError(queryErr);
                return res.status(500).json({
                    success: false,
                    data: queryErr,
                    message: 'Failed to add unit. Please check your input data.'
                });
            }
        });
    } catch (error) {
        logError(error);
        return res.status(500).json({
            success: false,
            data: {},
            message: 'Internal server error'
        });
    }
};



/*-----------------------progress api -------------------------*/

export const recordFileView = async (req, res) => {
    console.log("Incoming file view request");
    var success = false;
    var infoMessage = "";
    const userId = req.user.id;

    try {
        const { FileID } = req.body;
        let isFileRead = 0;
        let alreadyVisitedFiles = [];
        if (!FileID) {
            const warningMessage = "FileID is required";
            logWarning(warningMessage);
            return res.status(400).json({ success, message: warningMessage });
        }
        connectToDatabase(async (err, conn) => {
            if (err) {
                const errorMessage = "Database connection failed";
                logError(err);
                return res.status(500).json({ success: false, message: errorMessage });
            }

            try {
                const userQuery = `SELECT UserID, Name FROM Community_User 
                                 WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?`;
                const userRows = await queryAsync(conn, userQuery, [userId]);

                if (userRows.length === 0) {
                    closeConnection();
                    const warningMessage = "User not found";
                    logWarning(warningMessage);
                    return res.status(404).json({ success: false, message: warningMessage });
                }

                const user = userRows[0];

                const strQuery = `select UserID,FileID from UserLmsProgress where FileID = ? and isnull(delStatus,0)=0`;
                const isFileAvail = await queryAsync(conn, strQuery, [FileID]);
                console.log("file already visited", [FileID]);

                if (isFileAvail.length !== 0) {
                    isFileRead = 1;
                    alreadyVisitedFiles.push(FileID);

                }

                //console.log("read test",isFileAvail);
                if (isFileRead === 0) {
                    const insertQuery = `
                    INSERT INTO UserLmsProgress 
                    (UserID, FileID, AuthAdd, AddOnDt, delStatus) 
                    VALUES (?, ?, ?, GETDATE(), 0);
                `;

                    await queryAsync(conn, insertQuery, [
                        user.UserID,
                        FileID,
                        user.Name
                    ]);
                    success = true;
                    closeConnection();
                    infoMessage = "File view recorded added successfully";
                }
                else {
                    infoMessage = "File view allready recorded";
                }



                logInfo(infoMessage);
                return res.status(200).json({
                    success,
                    message: infoMessage,
                    alreadyVisitedFiles
                });

            } catch (queryErr) {
                closeConnection();
                console.error("Database Query Error:", queryErr);
                logError(queryErr);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to record file view'
                });
            }
        });
    } catch (error) {
        logError(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};





