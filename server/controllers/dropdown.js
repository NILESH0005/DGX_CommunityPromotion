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




