import { validationResult } from "express-validator";
import { connectToDatabase, closeConnection } from "../database/mySql.js";
import { logError, logInfo, logWarning, queryAsync } from "../helper/index.js";
import multer from 'multer';
import path from 'path';

// Multer configuration
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
        fileSize: 10 * 1024 * 1024 // 10MB limit
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

    console.log("User ID:", userId);
    console.log("Uploaded File:", req.file);

    try {
        // Manual validation
        if (!req.file) {
            logWarning("No file uploaded");
            return res.status(400).json({ success, message: "No file uploaded" });
        }

        const { moduleId, subModuleId, unitId } = req.body;

        if (!moduleId || !unitId) {
            return res.status(400).json({
                success: false,
                message: "Module ID and Unit ID are required"
            });
        }

        connectToDatabase(async (err, conn) => {
            if (err) {
                logError("Failed to connect to database");
                return res.status(500).json({
                    success: false,
                    message: "Failed to connect to database"
                });
            }
            logInfo("Database connection established successfully");

            try {
                // Get user details (similar to your quiz controller)
                const userQuery = `SELECT UserID, Name FROM Community_User WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?`;
                const userRows = await queryAsync(conn, userQuery, [userId]);
                console.log("User Rows:", userRows);

                if (userRows.length === 0) {
                    logWarning("User not found, please login first.");
                    return res.status(400).json({
                        success: false,
                        message: "User not found, please login first.",
                    });
                }

                const user = userRows[0];
                const authAdd = user.Name;
                const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

                // Insert file data (following your table schema)
                const fileQuery = `
          INSERT INTO FilesDetails (
            FilesName, 
            FilePath, 
            FileType, 
            UnitID, 
            AuthAdd, 
            AddOnDt, 
            delStatus
          ) VALUES (?, ?, ?, ?, ?, ?, 0)
        `;

                const filePath = `/uploads/learning-materials/${req.file.filename}`;

                await queryAsync(conn, fileQuery, [
                    req.file.originalname,
                    filePath,
                    req.file.mimetype,
                    unitId,
                    authAdd,
                    currentDate
                ]);

                // Get last inserted ID (similar to your quiz controller)
                const lastInsertedIdQuery = `SELECT TOP 1 FileID FROM FilesDetails WHERE ISNULL(delStatus, 0) = 0 ORDER BY FileID DESC`;
                const lastInsertedId = await queryAsync(conn, lastInsertedIdQuery);
                console.log("Last Inserted File ID:", lastInsertedId);

                // Update Unit's edit timestamp
                await queryAsync(conn, `
          UPDATE UnitsDetails 
          SET editOnDt = ?, AuthLstEdit = ?
          WHERE UnitID = ?`,
                    [currentDate, authAdd, unitId]
                );

                success = true;
                logInfo("File uploaded successfully!");
                return res.status(200).json({
                    success,
                    data: {
                        fileId: lastInsertedId[0].FileID,
                        filePath: filePath,
                        fileName: req.file.originalname
                    },
                    message: "File uploaded successfully!",
                });
            } catch (queryErr) {
                logError("Database Query Error:", queryErr.message || queryErr);
                return res.status(500).json({
                    success: false,
                    message: "Database Query Error",
                    details: process.env.NODE_ENV === 'development' ? queryErr.stack : undefined
                });
            } finally {
                closeConnection(conn);
            }
        });
    } catch (error) {
        logError("Unexpected Error:", error.stack || JSON.stringify(error));
        console.error("Error Details:", error);
        return res.status(500).json({
            success: false,
            message: "Unexpected Error, check logs",
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const LMS = {
    upload: uploadLearningMaterial,
    uploadFile: uploadFile
};