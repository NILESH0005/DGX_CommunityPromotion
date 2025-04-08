import { validationResult } from "express-validator";
import { connectToDatabase, closeConnection } from "../database/mySql.js";
import { logError, logInfo, logWarning, queryAsync } from "../helper/index.js";

export const createQuiz = async (req, res) => {
  let success = false;
  const userId = req.user.id;

  console.log("User ID:", userId);

  // Remove validation middleware check since we're handling validation manually
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   logWarning("Data is not in the right format");
  //   return res.status(400).json({ success, data: errors.array(), message: "Data is not in the right format" });
  // }

  try {
    let {
      category,
      name,
      level,
      duration,
      negativeMarking,
      startDate,
      startTime,
      endDate,
      endTime,
      type,
      quizVisibility,
      quizImage
    } = req.body;

    console.log("Request Body:", req.body);

    // Manual validation
    if (!name || !startDate || !startTime || !endDate || !endTime) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    let startDateAndTime = `${startDate} ${startTime}`;
    let endDateTime = `${endDate} ${endTime}`;

    // Set default values for null checks
    category = category ?? null;
    name = name ?? null;
    level = level ?? null;
    duration = duration ?? null;
    negativeMarking = negativeMarking ?? false;
    startDateAndTime = startDateAndTime ?? null;
    endDateTime = endDateTime ?? null;
    type = type ?? null;
    quizVisibility = quizVisibility ?? "Public";
    quizImage = quizImage ?? null;

    connectToDatabase(async (err, conn) => {
      if (err) {
        logError("Failed to connect to database");
        return res.status(500).json({ success: false, message: "Failed to connect to database" });
      }
      logInfo("Database connection established successfully");

      try {
        const userQuery = `SELECT UserID, Name, isAdmin FROM Community_User WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?`;
        const userRows = await queryAsync(conn, userQuery, [userId]);
        console.log("User Rows:", userRows);

        if (userRows.length === 0) {
          logWarning("User not found, please login first.");
          return res.status(400).json({ success: false, message: "User not found, please login first." });
        }

        const user = userRows[0];
        const authAdd = user.Name;
        const authDel = null;
        const authLstEdit = null;

        // Insert quiz data with image
        const quizQuery = `
          INSERT INTO QuizDetails 
          (QuizCategory, QuizName, QuizLevel, QuizDuration, NegativeMarking, StartDateAndTime, EndDateTime, QuizVisibility, QuizImage, AuthAdd, AuthDel, AuthLstEdit, AddOnDt, delStatus) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE(), 0);
        `;
        console.log("Executing query: ", quizQuery);

        await queryAsync(conn, quizQuery, [
          category,
          name,
          level,
          duration,
          negativeMarking,
          startDateAndTime,
          endDateTime,
          quizVisibility,
          quizImage,
          authAdd,
          authDel,
          authLstEdit,
        ]);

        // Fetch last inserted Quiz ID
        const lastInsertedIdQuery = `SELECT TOP 1 QuizID FROM QuizDetails WHERE ISNULL(delStatus, 0) = 0 ORDER BY QuizID DESC;`;
        const lastInsertedId = await queryAsync(conn, lastInsertedIdQuery);
        console.log("Last Inserted ID:", lastInsertedId);

        success = true;
        logInfo("Quiz created successfully!");
        return res.status(200).json({
          success,
          data: { quizId: lastInsertedId[0].QuizID },
          message: "Quiz created successfully!",
        });
      } catch (queryErr) {
        logError("Database Query Error:", queryErr.message || queryErr);
        return res.status(500).json({ success: false, message: "Database Query Error" });
      } finally {
        closeConnection(conn);
      }
    });
  } catch (error) {
    logError("Unexpected Error:", error.stack || JSON.stringify(error));
    console.error("Error Details:", error);
    return res.status(500).json({ success: false, message: "Unexpected Error, check logs" });
  }
};

export const getQuizzes = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage = "Data is not in the right format";
    console.error(warningMessage, errors.array());
    logWarning(warningMessage);
    res.status(400).json({ success, data: errors.array(), message: warningMessage });
    return;
  }

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        const errorMessage = "Failed to connect to database";
        logError(err);
        res.status(500).json({ success: false, data: err, message: errorMessage });
        return;
      }

      try {
        const query = `SELECT QuizID, QuizCategory, QuizName, QuizLevel, QuizDuration, NegativeMarking, StartDateAndTime, EndDateTime, QuizVisibility FROM QuizDetails WHERE ISNULL(delStatus, 0) = 0 ORDER BY AddOnDt DESC`;
        const quizzes = await queryAsync(conn, query);

        success = true;
        closeConnection();
        const infoMessage = "Quizzes fetched successfully";
        logInfo(infoMessage);
        res.status(200).json({ success, data: { quizzes }, message: infoMessage });
      } catch (queryErr) {
        logError(queryErr);
        closeConnection();
        res.status(500).json({ success: false, data: queryErr, message: 'Something went wrong please try again' });
      }
    });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, data: {}, message: 'Something went wrong please try again' });
  }
};

export const deleteQuiz = (req, res) => {
  let success = false;
  const { QuizID } = req.body;
  const adminName = req.user?.id;

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        logError(err);
        return res.status(500).json({
          success: false,
          data: err,
          message: "Database connection error.",
        });
      }

      try {
        const checkQuery = `SELECT * FROM QuizDetails WHERE QuizID = ? AND (delStatus IS NULL OR delStatus = 0)`;
        const result = await queryAsync(conn, checkQuery, [QuizID]);

        if (result.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Quiz not found or already deleted.",
          });
        }
        const updateQuery = `
          UPDATE QuizDetails 
          SET 
            delStatus = 1, 
            delOnDt = GETDATE(), 
            AuthDel = ? 
          OUTPUT 
            inserted.QuizID, 
            inserted.delStatus, 
            inserted.delOnDt, 
            inserted.AuthDel 
          WHERE 
            QuizID = ? AND (delStatus IS NULL OR delStatus = 0)
        `;

        const rows = await queryAsync(conn, updateQuery, [adminName, QuizID]);

        if (rows.length > 0) {
          success = true;
          logInfo("Quiz deleted successfully");
          return res.status(200).json({
            success,
            data: {
              QuizID: rows[0].QuizID,
              AuthDel: rows[0].AuthDel,
              delOnDt: rows[0].delOnDt,
              delStatus: rows[0].delStatus,
            },
            message: "Quiz deleted successfully.",
          });
        } else {
          logWarning("Failed to delete the quiz.");
          return res.status(404).json({
            success: false,
            message: "Failed to delete the quiz.",
          });
        }
      } catch (updateErr) {
        logError(updateErr);
        return res.status(500).json({
          success: false,
          data: updateErr,
          message: "Error updating quiz deletion.",
        });
      }
    });
  } catch (error) {
    logError(error);
    return res.status(500).json({
      success: false,
      message: "Unable to connect to the database!",
    });
  }
};

export const createQuestion = async (req, res) => {
  let success = false;
  const userId = req.user.id;
  console.log("User ID:", userId);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, data: errors.array(), message: "Data is not in the right format" });
  }

  try {
    const { question_text, Ques_level, image, group_id, options } = req.body;

    if (!question_text || !Ques_level || !group_id || !options || options.length < 2) {
      return res.status(400).json({ success, message: "Missing required fields or insufficient options." });
    }

    connectToDatabase(async (err, conn) => {
      if (err) {
        return res.status(500).json({ success: false, data: err, message: "Failed to connect to database" });
      }

      try {
        const insertQuestionQuery = `
          INSERT INTO Questions 
          (question_text, Ques_level, image, group_id, AuthAdd, AddOnDt, delStatus) 
          VALUES (?, ?, ?, ?, ?, GETDATE(), 0);
        `;
        const questionResult = await queryAsync(conn, insertQuestionQuery, [
          question_text, Ques_level, image, group_id, userId
        ]);

        const lastQuestionIdQuery = `SELECT TOP 1 id FROM Questions ORDER BY id DESC;`;
        const lastQuestionIdResult = await queryAsync(conn, lastQuestionIdQuery);
        const questionId = lastQuestionIdResult[0].id;

        for (const option of options) {
          const { option_text, is_correct, image } = option;
          const insertOptionQuery = `
            INSERT INTO QuestionOptions 
            (question_id, option_text, is_correct, image, AuthAdd, AddOnDt, delStatus) 
            VALUES (?, ?, ?, ?, ?, GETDATE(), 0);
          `;
          await queryAsync(conn, insertOptionQuery, [
            questionId, option_text, is_correct ? 1 : 0, image, userId
          ]);
        }

        success = true;
        closeConnection();
        return res.status(200).json({
          success,
          data: { questionId },
          message: "Question and options added successfully!"
        });
      } catch (queryErr) {
        closeConnection();
        console.error("Database Query Error:", queryErr);
        return res.status(500).json({ success: false, data: queryErr, message: "Database Query Error" });
      }
    });
  } catch (error) {
    console.error("Unexpected Error:", error);
    return res.status(500).json({ success: false, data: error, message: "Unexpected Error, check logs" });
  }
};

export const getQuestion = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage = "Data is not in the right format";
    console.error(warningMessage, errors.array());
    logWarning(warningMessage);
    res.status(400).json({ success, data: errors.array(), message: warningMessage });
    return;
  }

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        const errorMessage = "Failed to connect to database";
        logError(err);
        res.status(500).json({ success: false, data: err, message: errorMessage });
        return;
      }

      try {
        const query = `select question_text,GroupMaster.group_name,tblDDReferences.ddValue,option_text, 0 as count
                          from Questions
                          left join GroupMaster on Questions.group_id = GroupMaster.group_id
                          left join tblDDReferences on Questions.Ques_level = tblDDReferences.idCode
                          left join QuestionOptions on Questions.id = QuestionOptions.question_id
                          where QuestionOptions.is_correct = 1 and isnull(Questions.delStatus,0)=0 ORDER BY Questions.AddOnDt DESC;`;
        const quizzes = await queryAsync(conn, query);

        success = true;
        closeConnection();
        const infoMessage = "Questions fetched successfully";
        logInfo(infoMessage);
        res.status(200).json({ success, data: { quizzes }, message: infoMessage });
      } catch (queryErr) {
        logError(queryErr);
        closeConnection();
        res.status(500).json({ success: false, data: queryErr, message: 'Something went wrong please try again' });
      }
    });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, data: {}, message: 'Something went wrong please try again' });
  }
};

export const deleteQuestion = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage = "Data is not in the right format";
    console.error(warningMessage, errors.array());
    logWarning(warningMessage);
    res.status(400).json({ success, data: errors.array(), message: warningMessage });
    return;
  }

  const { id } = req.body; // Extract the question ID from the request body

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        const errorMessage = "Failed to connect to database";
        logError(err);
        res.status(500).json({ success: false, data: err, message: errorMessage });
        return;
      }

      try {
        // Query to soft delete the question by updating the delStatus field
        const query = `UPDATE Questions SET delStatus = 1 WHERE id = ?`;
        await queryAsync(conn, query, [id]);

        success = true;
        closeConnection();
        const infoMessage = "Question deleted successfully";
        logInfo(infoMessage);
        res.status(200).json({ success, data: { id }, message: infoMessage });
      } catch (queryErr) {
        logError(queryErr);
        closeConnection();
        res.status(500).json({ success: false, data: queryErr, message: 'Something went wrong please try again' });
      }
    });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, data: {}, message: 'Something went wrong please try again' });
  }
};



export const getQuestionsByGroupAndLevel = async (req, res) => {
  let success = false;
  const { group_id, level_id } = req.body;

  if (!group_id || !level_id) {
    return res.status(400).json({
      success,
      message: "Group ID and Level ID are required"
    });
  }

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Database connection failed"
        });
      }

      try {
        const levelQuery = `SELECT ddValue FROM tblDDReferences WHERE idCode = ? AND ddCategory = 'questionLevel'`;
        const [levelResult] = await queryAsync(conn, levelQuery, [level_id]);

        if (!levelResult) {
          return res.status(400).json({
            success: false,
            message: "Invalid level ID"
          });
        }

        const levelName = levelResult.ddValue;
        const allQuestionsQuery = `SELECT  
          Questions.id as question_id,  
          Questions.question_text, 
          Questions.Ques_level as level, 
          Questions.group_id, 
          QuizMapping.quizGroupID as mapped_quiz_id,
          QuizMapping.totalMarks, 
          QuizMapping.negativeMarks, 
	  tblDDReferences.ddValue AS question_level,
	            QuestionOptions.option_text,
				          QuestionOptions.is_correct,
          QuizDetails.QuizName as quiz_name 
        FROM Questions 
        LEFT JOIN QuizMapping ON Questions.id = QuizMapping.QuestionsID
        LEFT JOIN QuizDetails ON QuizMapping.quizGroupID = QuizDetails.QuizID 
	LEFT JOIN tblDDReferences ON Questions.Ques_level = tblDDReferences.idCode
	        LEFT JOIN QuestionOptions ON Questions.id = QuestionOptions.question_id

        WHERE ISNULL(Questions.delStatus, 0) = 0 
          AND Questions.group_id = ?
          AND Questions.Ques_level = ?`;

        const questions = await queryAsync(conn, allQuestionsQuery, [group_id, level_id]); // Changed levelName to level_id

        return res.status(200).json({
          success: true,
          data: {
            questions: questions,
            levelInfo: {
              id: level_id,
              name: levelName
            }
          },
          message: "Data fetched successfully"
        });

      } catch (error) {
        console.error("Database error:", error);
        return res.status(500).json({
          success: false,
          message: "Database query failed"
        });
      } finally {
        closeConnection(conn);
      }
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const createQuizQuestionMapping = async (req, res) => {
  let success = false;
  const userId = req.user.id; // Get user ID from authenticated request
  console.log("User ID:", userId);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, data: errors.array(), message: "Data is not in the right format" });
  }

  try {
    const { mappings } = req.body;

    if (!mappings || !Array.isArray(mappings)) {
      return res.status(400).json({ success: false, message: 'Invalid mapping data' });
    }

    connectToDatabase(async (err, conn) => {
      if (err) {
        console.error("Database connection error:", err);
        return res.status(500).json({ success: false, message: 'Database connection failed' });
      }

      try {
        const userQuery = `SELECT UserID, Name, isAdmin FROM Community_User WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?`;
        const userRows = await queryAsync(conn, userQuery, [userId]);
        console.log("User Rows:", userRows);

        if (userRows.length === 0) {
          return res.status(400).json({ success: false, message: "User not found, please login first." });
        }

        const user = userRows[0];
        const authAdd = user.Name;
        await queryAsync(conn, "BEGIN TRANSACTION");

        const insertPromises = mappings.map(async (mapping) => {
          const { quizGroupID, QuestionsID, QuestionName, negativeMarks, totalMarks, quizId, Ques_level } = mapping;

          const params = [
            parseInt(quizGroupID) || 0,
            parseInt(quizId) || 0,
            parseInt(QuestionsID) || 0,
            String(QuestionName || '').substring(0, 500),
            parseFloat(negativeMarks) || 0,
            parseFloat(totalMarks) || 1,
            parseInt(Ques_level) || 0,
            authAdd,
            0
          ];

          return queryAsync(conn, `
            INSERT INTO QuizMapping (
              quizGroupID, quizId, QuestionsID, QuestionTxt,
              negativeMarks, totalMarks, Ques_level, AuthAdd, AddOnDt, delStatus
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, GETDATE(), ?)
          `, params);
        });

        await Promise.all(insertPromises);
        await queryAsync(conn, "COMMIT TRANSACTION");

        success = true;
        return res.json({
          success,
          count: mappings.length,
          message: 'Questions mapped successfully'
        });

      } catch (queryErr) {
        try {
          await queryAsync(conn, "ROLLBACK TRANSACTION");
        } catch (rollbackErr) {
          console.error("Rollback error:", rollbackErr);
        }
        console.error("Query error:", queryErr);
        return res.status(500).json({
          success: false,
          message: 'Failed to map questions',
          error: queryErr.message
        });
      } finally {
        closeConnection(conn);
      }
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getUserQuizCategory = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage = "Data is not in the right format";
    console.error(warningMessage, errors.array());
    logWarning(warningMessage);
    res.status(400).json({ success, data: errors.array(), message: warningMessage });
    return;
  }

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        const errorMessage = "Failed to connect to database";
        logError(err);
        res.status(500).json({ success: false, data: err, message: errorMessage });
        return;
      }

      try {
        const query = `select  
          QuizDetails.QuizName, 
          QuizDetails.QuizImage, 
          GroupMaster.group_name,
          count(distinct QuestionsID) as Total_Question_No, 
          SUM(distinct QuizMapping.totalMarks) as MaxScore, 
          group_id, 
          QuizDetails.QuizID
        from QuizMapping
        left join QuizDetails on QuizMapping.quizId = QuizDetails.QuizID
        left join GroupMaster on QuizDetails.QuizCategory = GroupMaster.group_id
        Left join quiz_score on QuizMapping.quizId = quiz_score.quizID
        where isnull(QuizMapping.delStatus,0)=0
        group by GroupMaster.group_name, QuizDetails.QuizName, GroupMaster.group_id, QuizDetails.QuizID, QuizDetails.QuizImage`;

        const quizzes = await queryAsync(conn, query);

        const validQuizzes = quizzes.filter(quiz =>
          quiz.QuizID !== null &&
          quiz.QuizName !== null &&
          quiz.group_id !== null &&
          quiz.group_name !== null
        );

        success = true;
        closeConnection();
        const infoMessage = "Quizzes fetched successfully";
        logInfo(infoMessage);
        res.status(200).json({
          success,
          data: { quizzes: validQuizzes },
          message: infoMessage
        });
      } catch (queryErr) {
        logError(queryErr);
        closeConnection();
        res.status(500).json({
          success: false,
          data: queryErr,
          message: 'Something went wrong please try again'
        });
      }
    });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      data: {},
      message: 'Something went wrong please try again'
    });
  }
};

export const getQuizQuestions = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success,
      data: errors.array(),
      message: "Data is not in the right format"
    });
  }

  try {
    const { QuizID } = req.body;

    if (!QuizID) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "QuizID is required"
      });
    }

    const quizId = parseInt(QuizID);
    if (isNaN(quizId)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "QuizID must be a valid number"
      });
    }

    connectToDatabase(async (err, conn) => {
      if (err) {
        console.error("Database connection error:", err);
        return res.status(500).json({
          success: false,
          data: null,
          message: "Database connection failed"
        });
      }

      try {
        const query = `SELECT 
          QuizMapping.idCode,
          QuizMapping.quizGroupID,
          QuizMapping.quizId,
          QuizMapping.QuestionsID,
          Questions.question_text AS QuestionTxt,
          Questions.Ques_level,
          QuizMapping.negativeMarks,
          QuizMapping.totalMarks,
          QuizMapping.AuthAdd,
          QuizMapping.AddOnDt,
          QuizMapping.delStatus,
          QuizDetails.QuizName,
          QuizDetails.QuizDuration,
          tblDDReferences.ddValue AS question_level,
          Questions.image AS question_image,
          QuestionOptions.option_text,
          QuestionOptions.is_correct,
          QuestionOptions.id AS optionId
        FROM QuizMapping
        LEFT JOIN Questions ON QuizMapping.QuestionsID = Questions.id
        LEFT JOIN QuizDetails ON QuizMapping.quizId = QuizDetails.QuizID
        LEFT JOIN tblDDReferences ON Questions.Ques_level = tblDDReferences.idCode
        LEFT JOIN QuestionOptions ON Questions.id = QuestionOptions.question_id
        WHERE QuizMapping.quizId = ? AND QuizMapping.delStatus = 0`;

        const questions = await queryAsync(conn, query, [quizId]);

        if (!questions || questions.length === 0) {
          closeConnection();
          return res.status(404).json({
            success: false,
            data: null,
            message: "No questions found for this quiz"
          });
        }
        const questionMap = {};
        questions.forEach(q => {
          if (!questionMap[q.QuestionsID]) {
            questionMap[q.QuestionsID] = {
              idCode: q.idCode,
              quizGroupID: q.quizGroupID,
              quizId: q.quizId,
              QuestionsID: q.QuestionsID,
              QuestionTxt: q.QuestionTxt,
              Ques_level: q.Ques_level,
              negativeMarks: q.negativeMarks,
              totalMarks: q.totalMarks,
              AuthAdd: q.AuthAdd,
              AddOnDt: q.AddOnDt,
              delStatus: q.delStatus,
              QuizName: q.QuizName,
              QuizDuration: q.QuizDuration,
              question_level: q.question_level,
              question_image: q.question_image,
              options: []
            };
          }

          // Add option if it exists
          if (q.option_text) {
            questionMap[q.QuestionsID].options.push({
              option_text: q.option_text,
              is_correct: q.is_correct === 1,
              optionId: q.optionId
            });
          }
        });

        const formattedQuestions = Object.values(questionMap);

        success = true;
        closeConnection();
        return res.status(200).json({
          success,
          data: {
            quizId,
            quizName: questions[0]?.QuizName || '',
            quizDuration: questions[0]?.QuizDuration || 0,
            questions: formattedQuestions
          },
          message: "Quiz questions fetched successfully"
        });
      } catch (queryErr) {
        console.error("Query error:", queryErr);
        closeConnection();
        return res.status(500).json({
          success: false,
          data: null,
          message: "Failed to execute query"
        });
      }
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error"
    });
  }
};

export const submitQuiz = async (req, res) => {
  console.log("Incoming quiz submission:", req.body);
  let success = false;
  const userId = req.user.id;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success,
      errors: errors.array(),
      message: "Invalid data format"
    });
  }

  try {
    const { quizId, answers } = req.body;

    connectToDatabase(async (err, conn) => {
      if (err) {
        console.error("Database connection error:", err);
        return res.status(500).json({
          success: false,
          message: "Database connection failed"
        });
      }

      try {
        // Begin transaction
        await queryAsync(conn, "BEGIN TRANSACTION");

        // Get user details
        const userQuery = `SELECT UserID, Name FROM Community_User 
                         WHERE ISNULL(delStatus,0) = 0 AND EmailId = ?`;
        const userRows = await queryAsync(conn, userQuery, [userId]);

        if (userRows.length === 0) {
          await queryAsync(conn, "ROLLBACK");
          return res.status(404).json({
            success: false,
            message: "User not found"
          });
        }

        const user = userRows[0];

        for (const answer of answers) {
          if (!answer || !answer.selectedOptionId) continue; 

          const optionQuery = `SELECT is_correct FROM QuestionOptions 
                             WHERE id = ? AND question_id = ?`;
          const optionRows = await queryAsync(conn, optionQuery, [
            answer.selectedOptionId,
            answer.questionId
          ]);

          if (optionRows.length === 0) {
            console.warn(`Option not found: ${answer.selectedOptionId} for question ${answer.questionId}`);
            continue;
          }

          const isCorrect = optionRows[0].is_correct === 1;
          const marksQuery = `SELECT totalMarks, negativeMarks FROM QuizMapping
                           WHERE quizId = ? AND QuestionsID = ?`;
          const marksRows = await queryAsync(conn, marksQuery, [
            quizId,
            answer.questionId
          ]);

          let marksAwarded = 0;
          if (marksRows.length > 0) {
            marksAwarded = isCorrect
              ? marksRows[0].totalMarks
              : (marksRows[0].negativeMarks || 0) * -1;
          }

          const insertQuery = `
            INSERT INTO quiz_score (
              userID, quizID, questionID, answerID, correctAns, 
              marks, AuthAdd, AddOnDt, editOnDt, delStatus
            ) VALUES (?, ?, ?, ?, ?, ?, ?, GETDATE(), GETDATE(), 0)
          `;

          await queryAsync(conn, insertQuery, [
            user.UserID,
            quizId,
            answer.questionId,
            answer.selectedOptionId,
            isCorrect,
            marksAwarded,
            user.Name
          ]);
        }
        await queryAsync(conn, "COMMIT");
        closeConnection();

        return res.status(200).json({
          success: true,
          message: "Quiz submitted successfully"
        });

      } catch (queryErr) {
        await queryAsync(conn, "ROLLBACK");
        closeConnection();
        console.error("Database query error:", queryErr);
        return res.status(500).json({
          success: false,
          message: "Failed to submit quiz",
          error: queryErr.message
        });
      }
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const updateQuiz = async (req, res) => {
  console.log("Incoming quiz update request:", req.body);
  let success = false;
  const userId = req.user.id;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success,
      errors: errors.array(),
      message: "Invalid data format"
    });
  }

  try {
    const {
      QuizID,
      QuizCategory,
      QuizName,
      QuizLevel,
      QuizDuration,
      NegativeMarking,
      StartDateAndTime,
      EndDateTime,
      QuizVisibility,
      AuthLstEdit
    } = req.body;

    if (!QuizID) {
      return res.status(400).json({
        success: false,
        message: "QuizID is required"
      });
    }

    connectToDatabase(async (err, conn) => {
      if (err) {
        console.error("Database connection error:", err);
        return res.status(500).json({
          success: false,
          message: "Database connection failed"
        });
      }

      try {
        const checkQuizQuery = `
          SELECT QuizID FROM QuizDetails 
          WHERE QuizID = ? AND ISNULL(delStatus, 0) = 0
        `;
        const quizRows = await queryAsync(conn, checkQuizQuery, [QuizID]);

        if (quizRows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Quiz not found or has been deleted"
          });
        }

        // Update quiz details with current timestamp and editor info
        const updateQuery = `
          UPDATE QuizDetails 
          SET 
            QuizCategory = ?,
            QuizName = ?,
            QuizLevel = ?,
            QuizDuration = ?,
            NegativeMarking = ?,
            StartDateAndTime = CONVERT(datetime, ?),
            EndDateTime = CONVERT(datetime, ?),
            QuizVisibility = ?,
            AuthLstEdit = ?,
            editOnDt = GETDATE()
          WHERE QuizID = ? AND ISNULL(delStatus, 0) = 0
        `;

        const updateParams = [
          QuizCategory,
          QuizName,
          QuizLevel,
          QuizDuration,
          NegativeMarking,
          new Date(StartDateAndTime).toISOString(),
          new Date(EndDateTime).toISOString(),
          QuizVisibility,
          AuthLstEdit || req.user.username || 'Unknown', // Fallback to current user if not provided
          QuizID
        ];

        const result = await queryAsync(conn, updateQuery, updateParams);

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: "No quiz was updated. Quiz may not exist or data was identical."
          });
        }

        closeConnection();

        return res.status(200).json({
          success: true,
          message: "Quiz updated successfully",
          quizId: QuizID
        });

      } catch (queryErr) {
        closeConnection();
        console.error("Database query error:", queryErr);
        return res.status(500).json({
          success: false,
          message: "Failed to update quiz",
          error: queryErr.message
        });
      }
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const unmappQuestion = (req, res) => {
  const { mappingIds } = req.body;
  const adminName = req.user?.id;

  if (!mappingIds || (Array.isArray(mappingIds) && mappingIds.length === 0)) {
    return res.status(400).json({
      success: false,
      message: "Mapping ID(s) are required"
    });
  }

  const idsToUnmap = Array.isArray(mappingIds) ? mappingIds : [mappingIds];

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        logError(err);
        return res.status(500).json({
          success: false,
          message: "Database connection error.",
        });
      }

      try {
        const updateQuery = `
          UPDATE QuizMapping 
          SET 
            delStatus = 1, 
            delOnDt = GETDATE(), 
            AuthDel = ? 
          WHERE 
            idCode IN (?) AND (delStatus IS NULL OR delStatus = 0)
        `;

        // Execute the update without checking affected rows
        await queryAsync(conn, updateQuery, [adminName, idsToUnmap]);

        // Always return success if the query executed without errors
        return res.status(200).json({
          success: true,
          message: "Unmapping request processed successfully"
        });

      } catch (updateErr) {
        logError(updateErr);
        return res.status(500).json({
          success: false,
          message: "Error updating question unmapping.",
          error: updateErr.message
        });
      } finally {
        if (conn) closeConnection(conn);
      }
    });
  } catch (error) {
    logError(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateQuestion = async (req, res) => {
  console.log("Incoming question update request:", req.body);
  let success = false;
  const userId = req.user.id;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success,
      errors: errors.array(),
      message: "Invalid data format"
    });
  }

  try {
    const {
      question_id,
      question_text,
      Ques_level,
      group_id,
      image,
      question_type,
      options,
      AuthLstEdit
    } = req.body;

    if (!question_id) {
      return res.status(400).json({
        success: false,
        message: "Question ID is required"
      });
    }

    connectToDatabase(async (err, conn) => {
      if (err) {
        console.error("Database connection error:", err);
        return res.status(500).json({
          success: false,
          message: "Database connection failed"
        });
      }

      try {
        // Check if question exists
        const checkQuestionQuery = `
          SELECT question_id FROM QuizQuestions 
          WHERE question_id = ? AND ISNULL(delStatus, 0) = 0
        `;
        const questionRows = await queryAsync(conn, checkQuestionQuery, [question_id]);

        if (questionRows.length === 0) {
          closeConnection();
          return res.status(404).json({
            success: false,
            message: "Question not found or has been deleted"
          });
        }

        // Begin transaction
        await queryAsync(conn, "BEGIN TRANSACTION");

        try {
          // Update question details
          const updateQuestionQuery = `
            UPDATE QuizQuestions 
            SET 
              question_text = ?,
              Ques_level = ?,
              group_id = ?,
              image = ?,
              question_type = ?,
              AuthLstEdit = ?,
              editOnDt = GETDATE()
            WHERE question_id = ? AND ISNULL(delStatus, 0) = 0
          `;

          const updateQuestionParams = [
            question_text,
            Ques_level,
            group_id,
            image || null,
            question_type,
            AuthLstEdit || req.user.username || 'Unknown',
            question_id
          ];

          await queryAsync(conn, updateQuestionQuery, updateQuestionParams);

          // Soft delete existing options (mark as deleted)
          const deleteOptionsQuery = `
            UPDATE QuizOptions 
            SET 
              delStatus = 1,
              AuthDel = ?,
              delOnDt = GETDATE()
            WHERE question_id = ? AND ISNULL(delStatus, 0) = 0
          `;
          await queryAsync(conn, deleteOptionsQuery, [
            AuthLstEdit || req.user.username || 'Unknown',
            question_id
          ]);

          // Insert new options
          for (const option of options) {
            if (!option.option_text) continue;

            const insertOptionQuery = `
              INSERT INTO QuizOptions (
                question_id,
                option_text,
                is_correct,
                image,
                AuthAdd,
                AuthLstEdit,
                AddOnDt,
                editOnDt,
                delStatus
              ) VALUES (?, ?, ?, ?, ?, ?, GETDATE(), GETDATE(), 0)
            `;

            await queryAsync(conn, insertOptionQuery, [
              question_id,
              option.option_text,
              option.is_correct ? 1 : 0,
              option.image || null,
              AuthLstEdit || req.user.username || 'Unknown',
              AuthLstEdit || req.user.username || 'Unknown'
            ]);
          }

          // Commit transaction
          await queryAsync(conn, "COMMIT");
          closeConnection();

          return res.status(200).json({
            success: true,
            message: "Question updated successfully",
            questionId: question_id
          });

        } catch (queryErr) {
          // Rollback transaction on error
          await queryAsync(conn, "ROLLBACK");
          closeConnection();
          console.error("Database query error:", queryErr);
          return res.status(500).json({
            success: false,
            message: "Failed to update question",
            error: queryErr.message
          });
        }
      } catch (error) {
        closeConnection();
        console.error("Database error:", error);
        return res.status(500).json({
          success: false,
          message: "Database operation failed",
          error: error.message
        });
      }
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
