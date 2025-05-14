import { validationResult } from "express-validator";
import { connectToDatabase, closeConnection } from "../database/mySql.js";
import { logError, logInfo, logWarning, queryAsync } from "../helper/index.js";
import multer from 'multer';
import path from 'path';

const learningMaterialStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/learning-materials');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

export const uploadLearningMaterial = multer({
    storage: learningMaterialStorage,
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, JPEG, and PNG are allowed.'));
        }
    }
});

export const uploadFile = async (req, res) => {
    let success = false;
    const userId = req.user.id;
    const { moduleId, subModuleId, unitId } = req.body; // These come from form data

    // Validation
    if (!req.file) {
        return res.status(400).json({ success, message: "No file uploaded" });
    }
    if (!unitId) {
        return res.status(400).json({ success, message: "Unit ID is required" });
    }

    try {
        connectToDatabase(async (err, conn) => {
            if (err) {
                logError("Database connection failed");
                return res.status(500).json({ success, message: "Database connection failed" });
            }

            try {
                // 1. Verify user exists
                const [user] = await queryAsync(conn, 
                    `SELECT UserID, Name FROM Community_User 
                     WHERE EmailId = ? AND ISNULL(delStatus, 0) = 0`, 
                    [userId]
                );

                if (!user) {
                    return res.status(404).json({ success, message: "User not found" });
                }

                // 2. Prepare file data
                const filePath = `/uploads/learning-materials/${req.file.filename}`;
                const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

                // 3. Insert into FilesDetails
                const fileInsert = await queryAsync(conn, `
                    INSERT INTO FilesDetails (
                        FilesName, 
                        FilePath, 
                        FileType, 
                        UnitID, 
                        AuthAdd, 
                        AddOnDt,
                        delStatus
                    ) VALUES (?, ?, ?, ?, ?, ?, 0)
                `, [
                    req.file.originalname,
                    filePath,
                    req.file.mimetype,
                    unitId,
                    user.Name,
                    currentDate
                ]);

                // 4. Update Unit's last edit info
                await queryAsync(conn, `
                    UPDATE UnitsDetails 
                    SET editOnDt = ?, AuthLstEdit = ?
                    WHERE UnitID = ?
                `, [currentDate, user.Name, unitId]);

                // 5. Get the new FileID
                const [newFile] = await queryAsync(conn, `
                    SELECT TOP 1 FileID FROM FilesDetails 
                    WHERE UnitID = ? 
                    ORDER BY AddOnDt DESC
                `, [unitId]);

                success = true;
                return res.status(200).json({
                    success,
                    data: {
                        fileId: newFile.FileID,
                        filePath,
                        fileName: req.file.originalname
                    },
                    message: "File uploaded successfully"
                });

            } catch (queryErr) {
                logError("Database error:", queryErr);
                return res.status(500).json({ 
                    success, 
                    message: "Database operation failed",
                    error: process.env.NODE_ENV === 'development' ? queryErr.message : null
                });
            } finally {
                closeConnection(conn);
            }
        });
    } catch (error) {
        logError("Server error:", error);
        return res.status(500).json({ 
            success, 
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

export const getSubModulesByModule = async (req, res) => {
    let success = false;
    const userId = req.user?.id;
    const moduleId = req.query.moduleId;

    if (!userId) {
        return res.status(400).json({
            success,
            message: "User ID not found. Please login."
        });
    }

    if (!moduleId) {
        return res.status(400).json({
            success,
            message: "Module ID is required."
        });
    }

    try {
        connectToDatabase(async (err, conn) => {
            if (err) {
                logError("Failed to connect to database");
                return res.status(500).json({
                    success,
                    message: "Failed to connect to database"
                });
            }

            try {
                // Verify user exists
                const userQuery = `SELECT UserID FROM Community_User WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?`;
                const userRows = await queryAsync(conn, userQuery, [userId]);

                if (userRows.length === 0) {
                    closeConnection(conn);
                    return res.status(404).json({
                        success,
                        message: "User not found."
                    });
                }

                // Fetch sub-modules for the specified module
                const subModuleQuery = `
            SELECT 
              SubModuleID as id,
              SubModuleName as name,
              SubModuleImage as image,
              SubModuleDescription as description,
              ModuleID as moduleId
            FROM SubModulesDetails
            WHERE ModuleID = ? AND ISNULL(delStatus, 0) = 0
            ORDER BY SubModuleName ASC
          `;

                const subModules = await queryAsync(conn, subModuleQuery, [moduleId]);

                success = true;
                closeConnection(conn);
                logInfo(`Fetched sub-modules for ModuleID: ${moduleId}`);

                return res.status(200).json({
                    success,
                    data: subModules,
                    message: "Sub-modules fetched successfully"
                });

            } catch (queryErr) {
                closeConnection(conn);
                logError("Database Query Error:", queryErr);
                return res.status(500).json({
                    success,
                    message: "Database Query Error"
                });
            }
        });
    } catch (error) {
        logError("Unexpected Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unexpected Error, check logs"
        });
    }
};

export const getUnitsBySubModule = async (req, res) => {
    let success = false;
    const userId = req.user?.id;
    const subModuleId = req.query.subModuleId;

    if (!userId) {
        return res.status(400).json({
            success,
            message: "User ID not found. Please login."
        });
    }

    if (!subModuleId) {
        return res.status(400).json({
            success,
            message: "Sub-Module ID is required."
        });
    }

    try {
        connectToDatabase(async (err, conn) => {
            if (err) {
                logError("Failed to connect to database");
                return res.status(500).json({
                    success,
                    message: "Failed to connect to database"
                });
            }

            try {
                // Verify user exists
                const userQuery = `SELECT UserID FROM Community_User WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?`;
                const userRows = await queryAsync(conn, userQuery, [userId]);

                if (userRows.length === 0) {
                    closeConnection(conn);
                    return res.status(404).json({
                        success,
                        message: "User not found."
                    });
                }

                // Fetch units for the specified sub-module
                const unitQuery = `
            SELECT 
              UnitID as id,
              UnitName as name,
              UnitImg as image,
              UnitDescription as description,
              SubModuleID as subModuleId
            FROM UnitsDetails
            WHERE SubModuleID = ? AND ISNULL(delStatus, 0) = 0
            ORDER BY UnitName ASC
          `;

                const units = await queryAsync(conn, unitQuery, [subModuleId]);

                success = true;
                closeConnection(conn);
                logInfo(`Fetched units for SubModuleID: ${subModuleId}`);

                return res.status(200).json({
                    success,
                    data: units,
                    message: "Units fetched successfully"
                });

            } catch (queryErr) {
                closeConnection(conn);
                logError("Database Query Error:", queryErr);
                return res.status(500).json({
                    success,
                    message: "Database Query Error"
                });
            }
        });
    } catch (error) {
        logError("Unexpected Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unexpected Error, check logs"
        });
    }
};
export const LMS = {
    upload: uploadLearningMaterial,
    uploadFile: uploadFile,
    getSubModules: getSubModulesByModule,
    getUnits: getUnitsBySubModule
};