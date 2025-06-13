// import { body, validationResult } from "express-validator";
import { connectToDatabase, closeConnection } from "../database/mySql.js";
import dotenv from "dotenv";
import { queryAsync, logError, logInfo } from "../helper/index.js";

dotenv.config();

export const getDropdownValues = async (req, res) => {
    let success = false;
    let infoMessage = ''
    try {
        const { category } = req.query;
        if (!category) {
            return res.status(400).json({ success, data: {}, message: "Category is required" });
        }

        connectToDatabase(async (err, conn) => {

            if (err) {
                console.error('Connection error:', err);
                const errorMessage = "Failed to connect to database";
                logError(err);
                res.status(500).json({ success: false, data: err, message: errorMessage });
                return;
            }
            try {
                const query = `SELECT idCode, ddValue FROM tblDDReferences WHERE ddCategory = ? AND delStatus = 0`;
                const results = await queryAsync(conn, query, [category]);
                if (results.length === 0) {
                    success = false;
                    infoMessage = `No data found for ${category} category`;
                    logInfo(infoMessage);
                    res.status(404).json({ success, message: infoMessage });
                } else {
                    success = true;
                    infoMessage = "Dropdown values fetched successfully";
                    logInfo(infoMessage);
                    res.status(200).json({ success, data: results, message: infoMessage });
                }
                closeConnection();
            } catch (queryErr) {
                console.error('Query error:', queryErr);
                logError(queryErr);
                closeConnection();
                res.status(500).json({ success: false, data: queryErr, message: "Something went wrong, please try again" });
            }
        });
    } catch (error) {
        logError(error);
        res.status(500).json({ success: false, data: {}, message: "Something went wrong, please try again" });
    }
};

export const getQuizDropdown = async (req, res) => {
    let success = false;
    let infoMessage = '';

    try {
        connectToDatabase(async (err, conn) => {
            if (err) {
                console.error('Connection error:', err);
                const errorMessage = "Failed to connect to database";
                logError(err);
                return res.status(500).json({ success: false, data: err, message: errorMessage });
            }

            try {
                const query = `SELECT qd.QuizID, QuizName, NegativeMarking, QuizDuration, QuizLevel,  StartDateAndTime, EndDateTime,count(QuestionsID) Questioncount FROM QuizDetails qd
                left join  QuizMapping qm on  qm.quizId=qd.QuizID
                where qd.delstatus=0 and ISNULL(qm.delstatus, 0)=0 and EndDateTime > GETDATE()
                group by qd.QuizID, QuizName, NegativeMarking, QuizDuration, QuizLevel,  StartDateAndTime, EndDateTime`;
                const results = await queryAsync(conn, query);

                if (results.length === 0) {
                    success = false;
                    infoMessage = "No groups found";
                    logInfo(infoMessage);
                    return res.status(404).json({ success, message: infoMessage });
                } else {
                    success = true;
                    infoMessage = "Group names fetched successfully";
                    logInfo(infoMessage);
                    return res.status(200).json({ success, data: results, message: infoMessage });
                }

                closeConnection();
            } catch (queryErr) {
                console.error('Query error:', queryErr);
                logError(queryErr);
                closeConnection();
                return res.status(500).json({ success: false, data: queryErr, message: "Something went wrong, please try again" });
            }
        });
    } catch (error) {
        logError(error);
        return res.status(500).json({ success: false, data: {}, message: "Something went wrong, please try again" });
    }
};

export const getQuizGroupDropdown = async (req, res) => {
    let success = false;
    let infoMessage = '';

    try {
        connectToDatabase(async (err, conn) => {
            if (err) {
                console.error('Connection error:', err);
                const errorMessage = "Failed to connect to database";
                logError(err);
                return res.status(500).json({ success: false, data: err, message: errorMessage });
            }

            try {
                const query = `SELECT group_id, group_name FROM GroupMaster WHERE delStatus = 0 AND group_category = 'quizGroup';`;
                const results = await queryAsync(conn, query);

                if (results.length === 0) {
                    success = false;
                    infoMessage = "No groups found";
                    logInfo(infoMessage);
                    return res.status(404).json({ success, message: infoMessage });
                } else {
                    success = true;
                    infoMessage = "Group names fetched successfully";
                    logInfo(infoMessage);
                    return res.status(200).json({ success, data: results, message: infoMessage });
                }

                closeConnection();
            } catch (queryErr) {
                console.error('Query error:', queryErr);
                logError(queryErr);
                closeConnection();
                return res.status(500).json({ success: false, data: queryErr, message: "Something went wrong, please try again" });
            }
        });
    } catch (error) {
        logError(error);
        return res.status(500).json({ success: false, data: {}, message: "Something went wrong, please try again" });
    }
};

export const getQuestionGroupDropdown = async (req, res) => {
    let success = false;
    let infoMessage = '';

    try {
        connectToDatabase(async (err, conn) => {
            if (err) {
                console.error('Connection error:', err);
                const errorMessage = "Failed to connect to database";
                logError(err);
                return res.status(500).json({ success: false, data: err, message: errorMessage });
            }

            try {
                const query = `SELECT group_id, group_name FROM GroupMaster WHERE delStatus = 0 AND group_category = 'questionGroup';`;
                const results = await queryAsync(conn, query);

                if (results.length === 0) {
                    success = false;
                    infoMessage = "No groups found";
                    logInfo(infoMessage);
                    return res.status(404).json({ success, message: infoMessage });
                } else {
                    success = true;
                    infoMessage = "Group names fetched successfully";
                    logInfo(infoMessage);
                    return res.status(200).json({ success, data: results, message: infoMessage });
                }

                closeConnection();
            } catch (queryErr) {
                console.error('Query error:', queryErr);
                logError(queryErr);
                closeConnection();
                return res.status(500).json({ success: false, data: queryErr, message: "Something went wrong, please try again" });
            }
        });
    } catch (error) {
        logError(error);
        return res.status(500).json({ success: false, data: {}, message: "Something went wrong, please try again" });
    }
};

export const getModuleById = async (req, res) => {
    let success = false;
    const { moduleId } = req.query;

    if (!moduleId) {
        return res.status(400).json({
            success,
            message: "Module ID is required"
        });
    }

    try {
        connectToDatabase(async (err, conn) => {
            if (err) {
                logError(err);
                return res.status(500).json({
                    success,
                    message: "Database connection error"
                });
            }

            try {
                const query = `
          SELECT 
            ModuleID,
            ModuleName,
            ModuleImage,
            ModuleDescription
          FROM ModulesDetails
          WHERE ModuleID = ?
          AND ISNULL(delStatus, 0) = 0
        `;

                const results = await queryAsync(conn, query, [moduleId]);

                if (results.length === 0) {
                    return res.status(404).json({
                        success,
                        message: "Module not found"
                    });
                }

                const moduleData = {
                    ...results[0],
                    ModuleImage: results[0].ModuleImage
                        ? { data: results[0].ModuleImage.toString('base64') }
                        : null
                };

                success = true;
                res.status(200).json({
                    success,
                    data: moduleData,
                    message: "Module fetched successfully"
                });
            } catch (queryErr) {
                logError(queryErr);
                res.status(500).json({
                    success,
                    message: "Error fetching module"
                });
            } finally {
                closeConnection();
            }
        });
    } catch (error) {
        logError(error);
        res.status(500).json({
            success,
            message: "Server error"
        });
    }
};

export const getModules = async (req, res) => {
    let success = false;

    try {
        connectToDatabase(async (err, conn) => {
            if (err) {
                logError(err);
                return res.status(500).json({
                    success,
                    message: "Database connection error"
                });
            }

            try {
                const query = `
            SELECT 
              ModuleID, 
              ModuleName, 
              ModuleImage, 
              ModuleDescription 
            FROM ModulesDetails 
            WHERE delStatus = 0
            ORDER BY ModuleID
          `;

                const results = await queryAsync(conn, query);

                success = true;
                res.status(200).json({
                    success,
                    data: results,
                    message: "Modules fetched successfully"
                });
            } catch (queryErr) {
                logError(queryErr);
                res.status(500).json({
                    success,
                    message: "Error fetching modules"
                });
            } finally {
                closeConnection();
            }
        });
    } catch (error) {
        logError(error);
        res.status(500).json({
            success,
            message: "Server error"
        });
    }
};

export const getSubModules = async (req, res) => {
    let success = false;
    const { moduleId } = req.query;

    if (!moduleId) {
        return res.status(400).json({ success, message: "moduleId is required" });
    }

    try {
        connectToDatabase(async (err, conn) => {
            if (err) {
                logError(err);
                return res.status(500).json({ success, message: "Database connection error" });
            }

            try {
                const query = `
                    SELECT 
                        SubModuleID, 
                        SubModuleName, 
                        SubModuleImage, 
                        SubModuleDescription,
                        ModuleID
                    FROM SubModulesDetails 
                    WHERE ISNULL(delStatus, 0) = 0 AND ModuleID = ?
                    ORDER BY SubModuleID
                `;

                const results = await queryAsync(conn, query, [moduleId]);

                success = true;
                res.status(200).json({
                    success,
                    data: results,
                    message: "SubModules fetched successfully"
                });
            } catch (queryErr) {
                logError(queryErr);
                res.status(500).json({ success, message: "Error fetching submodules" });
            } finally {
                closeConnection();
            }
        });
    } catch (error) {
        logError(error);
        res.status(500).json({ success, message: "Server error" });
    }
};


// export const getUnitsWithFiles = async (req, res) => {
//     let success = false;

//     try {
//         connectToDatabase(async (err, conn) => {
//             if (err) {
//                 logError(err);
//                 return res.status(500).json({
//                     success,
//                     message: "Database connection error"
//                 });
//             }

//             try {
//                 // First get all units
//                 const unitsQuery = `
//                     SELECT 
//                         UnitID,
//                         UnitName,
//                         UnitImg,
//                         UnitDescription,
//                         SubModuleID,
//                         AuthAdd
//                     FROM UnitsDetails
//                     WHERE ISNULL(delStatus, 0) = 0
//                     ORDER BY UnitID
//                 `;

//                 const units = await queryAsync(conn, unitsQuery);

//                 // Then get all files
//                 const filesQuery = `
//                     SELECT 
//                         FileID,
//                         FilesName,
//                         FilePath,
//                         FileType,
//                         UnitID,
//                         AuthAdd,
//                         Percentage
//                     FROM FilesDetails
//                     WHERE ISNULL(delStatus, 0) = 0
//                     ORDER BY FileID
//                 `;

//                 const files = await queryAsync(conn, filesQuery);

//                 // Group files by UnitID
//                 const filesByUnit = files.reduce((acc, file) => {
//                     if (!acc[file.UnitID]) {
//                         acc[file.UnitID] = [];
//                     }
//                     acc[file.UnitID].push(file);
//                     return acc;
//                 }, {});

//                 // Combine units with their files
//                 const result = units.map(unit => ({
//                     ...unit,
//                     files: filesByUnit[unit.UnitID] || []
//                 }));

//                 success = true;
//                 res.status(200).json({
//                     success,
//                     data: result,
//                     message: "Units with files fetched successfully"
//                 });
//             } catch (queryErr) {
//                 logError(queryErr);
//                 res.status(500).json({
//                     success,
//                     message: "Error fetching units with files"
//                 });
//             } finally {
//                 closeConnection();
//             }
//         });
//     } catch (error) {
//         logError(error);
//         res.status(500).json({
//             success,
//             message: "Server error"
//         });
//     }
// };



export const getUnitsWithFiles = async (req, res) => {
    let success = false;
    const { subModuleId } = req.params; 

    try {
        connectToDatabase(async (err, conn) => {
            if (err) {
                logError(err);
                return res.status(500).json({
                    success,
                    message: "Database connection error"
                });
            }

            try {
                const query = `
                    SELECT 
                        u.UnitID,
                        u.UnitName,
                        u.UnitImg,
                        u.UnitDescription,
                        u.SubModuleID,
                        u.AuthAdd,
                        f.FileID,
                        f.FilesName,
                        f.FilePath,
                        f.FileType,
                        f.Description,
                        f.AuthAdd AS FileAuthAdd,
                        f.Percentage
                    FROM UnitsDetails u
                    LEFT JOIN FilesDetails f ON u.UnitID = f.UnitID AND ISNULL(f.delStatus, 0) = 0
                    WHERE ISNULL(u.delStatus, 0) = 0
                    AND u.SubModuleID = ?
                    ORDER BY u.UnitID, f.FileID
                `;

                const results = await queryAsync(conn, query, [subModuleId]);

                // Group files by UnitID
                const unitsMap = new Map();
                results.forEach(row => {
                    if (!unitsMap.has(row.UnitID)) {
                        unitsMap.set(row.UnitID, {
                            UnitID: row.UnitID,
                            UnitName: row.UnitName,
                            UnitImg: row.UnitImg,
                            UnitDescription: row.UnitDescription,
                            SubModuleID: row.SubModuleID,
                            AuthAdd: row.AuthAdd,
                            files: []
                        });
                    }

                    if (row.FileID) {
                        unitsMap.get(row.UnitID).files.push({
                            FileID: row.FileID,
                            FilesName: row.FilesName,
                            Description: row.Description,
                            FilePath: row.FilePath,
                            FileType: row.FileType,
                            AuthAdd: row.FileAuthAdd,
                            Percentage: row.Percentage
                        });
                    }
                });

                const result = Array.from(unitsMap.values());

                success = true;
                res.status(200).json({
                    success,
                    data: result,
                    message: "Units with files fetched successfully"
                });
            } catch (queryErr) {
                logError(queryErr);
                res.status(500).json({
                    success,
                    message: "Error fetching units with files"
                });
            } finally {
                closeConnection();
            }
        });
    } catch (error) {
        logError(error);
        res.status(500).json({
            success,
            message: "Server error"
        });
    }
};

