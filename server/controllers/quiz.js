import { validationResult } from "express-validator";
import { connectToDatabase, closeConnection } from "../database/mySql.js";
import { logError, logInfo, logWarning, queryAsync } from "../helper/index.js";

export const createQuiz = async (req, res) => {
  let success = false;
  const userId = req.user.id;

  console.log("User ID:", userId);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logWarning("Data is not in the right format");
    return res.status(400).json({ success, data: errors.array(), message: "Data is not in the right format" });
  }

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
    } = req.body;

    console.log("Request Body:", req.body);

    if (!name || !startDate || !startTime || !endDate || !endTime) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    let startDateAndTime = `${startDate} ${startTime}`;
    let endDateTime = `${endDate} ${endTime}`;

    category = category ?? null;
    name = name ?? null;
    level = level ?? null;
    duration = duration ?? null;
    negativeMarking = negativeMarking ?? false;
    startDateAndTime = startDateAndTime ?? null;
    endDateTime = endDateTime ?? null;
    type = type ?? null;
    quizVisibility = quizVisibility ?? "Public";

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

        // Insert quiz data
        const quizQuery = `
          INSERT INTO QuizDetails 
          (QuizCategory, QuizName, QuizLevel, QuizDuration, NegativeMarking, StartDateAndTime, EndDateTime, QuizVisibility, AuthAdd, AuthDel, AuthLstEdit, AddOnDt, delStatus) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE(), 0);
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
    console.error("Error Details:", error); // This will log to your console
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

export const getQuestionsByGroup = async (req, res) => {
  let success = false;
  const groupId = req.query.groupId || req.body.groupId;

  if (!groupId) {
    return res.status(400).json({
      success,
      message: "Group ID is required"
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
        // Get quizzes
        const quizzesQuery = `SELECT QuizID as quiz_id, QuizName as quiz_name, QuizLevel as quiz_level
                             FROM QuizDetails 
                             WHERE ISNULL(delStatus, 0) = 0
                             AND (QuizCategory = ? OR QuizCategory = CAST(? AS NVARCHAR(50)))`;

        // Get not mapped questions
        const notMappedQuery = `SELECT id as question_id, question_text, group_id 
                               FROM Questions 
                               WHERE ISNULL(delStatus, 0) = 0
                               AND group_id = ?
                               AND id NOT IN (SELECT QuestionsID FROM QuizMapping WHERE quizGroupID = ?)`;

        // Get mapped questions with marks and quiz info
        // In your API endpoint:
        const mappedQuery = `SELECT 
  q.id as question_id,
  q.question_text,
  qm.totalMarks,
  qm.negativeMarks,
  qm.QuestionName as quiz_name,
  qm.quizGroupID as quiz_id
FROM Questions q
INNER JOIN QuizMapping qm ON q.id = qm.QuestionsID
LEFT JOIN QuizDetails qd ON qm.quizGroupID = qd.QuizID
WHERE q.group_id = ?`;

        const [quizzes, unmappedQuestions, mappedQuestions] = await Promise.all([
          queryAsync(conn, quizzesQuery, [groupId, groupId.toString()]),
          queryAsync(conn, notMappedQuery, [groupId, groupId]),
          queryAsync(conn, mappedQuery, [groupId, groupId])
        ]);

        return res.status(200).json({
          success: true,
          data: {
            questions: unmappedQuestions,
            mappedQuestions: mappedQuestions.map(q => ({
              question_id: q.id,
              question_text: q.question_text || q.QuestionName, // Fallback to QuestionName if needed
              group_id: q.group_id,
              marks: q.totalMarks,
              negative_marks: q.negativeMarks,
              quiz_name: q.quiz_name,
              quiz_id: q.quiz_id
            })),
            quizzes
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

// export const createQuizQuestionMapping = async (req, res) => {
//   let success = false;
//   const userId = req.user?.id || req.headers['user-id'];
//   console.log("User ID:", userId);

//   const { quiz_id, questions, created_by } = req.body;

//   // Validate required fields
//   if (!quiz_id || !questions || !Array.isArray(questions) || questions.length === 0 || !created_by) {
//     const warningMessage = "Missing required fields: quiz_id, questions array, or created_by";
//     console.error(warningMessage);
//     logWarning(warningMessage);
//     return res.status(400).json({
//       success,
//       message: warningMessage
//     });
//   }

//   try {
//     connectToDatabase(async (err, conn) => {
//       if (err) {
//         const errorMessage = "Failed to connect to database";
//         logError(err);
//         return res.status(500).json({
//           success: false,
//           message: errorMessage
//         });
//       }

//       try {
//         // 1. First get the quiz's category/group ID and name
//         const getQuizQuery = `SELECT QuizCategory, QuizName FROM QuizDetails WHERE QuizID = ? AND ISNULL(delStatus, 0) = 0`;
//         const quizResult = await queryAsync(conn, getQuizQuery, [parseInt(quiz_id)]);

//         if (!quizResult || quizResult.length === 0) {
//           closeConnection();
//           return res.status(404).json({
//             success: false,
//             message: "Quiz not found"
//           });
//         }

//         const quizGroupID = quizResult[0].QuizCategory;
//         const quizName = quizResult[0].QuizName;

//         // 2. Begin transaction
//         await queryAsync(conn, "BEGIN TRANSACTION");

//         try {
//           for (const question of questions) {
//             const questionId = parseInt(question.question_id);
//             const marks = parseFloat(question.marks) || 1;
//             const negativeMarks = parseFloat(question.negative_marks) || 0;

//             // 3. Validate question exists and belongs to the same group
//             const validateQuestionQuery = `
//               SELECT id FROM Questions 
//               WHERE id = ? AND group_id = ? AND ISNULL(delStatus, 0) = 0
//             `;
//             const questionExists = await queryAsync(conn, validateQuestionQuery, [
//               questionId,
//               parseInt(quizGroupID)
//             ]);

//             if (!questionExists || questionExists.length === 0) {
//               throw new Error(`Question ID ${questionId} not found or doesn't belong to quiz's group`);
//             }

//             // 4. Insert the mapping with quiz name
//             const insertMappingQuery = `
//               INSERT INTO QuizMapping 
//               (quizGroupID, QuestionsID, QuestionName, negativeMarks, totalMarks, AuthAdd, AddOnDt, delStatus)
//               VALUES (?, ?, ?, ?, ?, ?, GETDATE(), 0)
//             `;

//             await queryAsync(conn, insertMappingQuery, [
//               parseInt(quizGroupID),
//               questionId,
//               quizName, // Using the quiz name here
//               negativeMarks,
//               marks,
//               userId.toString()
//             ]);
//           }

//           // 5. Commit transaction
//           await queryAsync(conn, "COMMIT TRANSACTION");

//           success = true;
//           closeConnection();

//           const infoMessage = "Question mappings created successfully";
//           logInfo(infoMessage);

//           return res.status(200).json({
//             success,
//             message: infoMessage
//           });

//         } catch (queryErr) {
//           // 6. Rollback on error
//           await queryAsync(conn, "ROLLBACK TRANSACTION");
//           throw queryErr;
//         }

//       } catch (queryErr) {
//         logError(queryErr);
//         closeConnection();
//         return res.status(500).json({
//           success: false,
//           message: queryErr.message || "Failed to create question mappings"
//         });
//       }
//     });
//   } catch (error) {
//     logError(error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error"
//     });
//   }
// };


export const createQuizQuestionMapping = async (req, res) => {
  let success = false;
  const userId = req.user?.id || req.headers['user-id'];
  console.log("User ID:", userId);

  const { quiz_id, questions, created_by } = req.body;

  // Validate required fields
  if (!quiz_id || !questions || !Array.isArray(questions) || questions.length === 0 || !created_by) {
    const warningMessage = "Missing required fields: quiz_id, questions array, or created_by";
    console.error(warningMessage);
    logWarning(warningMessage);
    return res.status(400).json({
      success,
      message: warningMessage
    });
  }

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        const errorMessage = "Failed to connect to database";
        logError(err);
        return res.status(500).json({
          success: false,
          message: errorMessage
        });
      }

      try {
        // 1. First get the quiz's category/group ID and name
        const getQuizQuery = `SELECT QuizCategory, QuizName FROM QuizDetails WHERE QuizID = ? AND ISNULL(delStatus, 0) = 0`;
        const quizResult = await queryAsync(conn, getQuizQuery, [parseInt(quiz_id)]);

        if (!quizResult || quizResult.length === 0) {
          closeConnection();
          return res.status(404).json({
            success: false,
            message: "Quiz not found"
          });
        }

        const quizGroupID = quizResult[0].QuizCategory;
        const quizName = quizResult[0].QuizName;

        // 2. Begin transaction
        await queryAsync(conn, "BEGIN TRANSACTION");

        try {
          for (const question of questions) {
            const questionId = parseInt(question.question_id);
            const marks = parseFloat(question.marks) || 1;
            const negativeMarks = parseFloat(question.negative_marks) || 0;

            // 3. Validate question exists and belongs to the same group
            const validateQuestionQuery = `
              SELECT id FROM Questions 
              WHERE id = ? AND group_id = ? AND ISNULL(delStatus, 0) = 0
            `;
            const questionExists = await queryAsync(conn, validateQuestionQuery, [
              questionId,
              parseInt(quizGroupID)
            ]);

            if (!questionExists || questionExists.length === 0) {
              throw new Error(`Question ID ${questionId} not found or doesn't belong to quiz's group`);
            }

            const insertMappingQuery = `
              INSERT INTO QuizMapping 
              (quizGroupID, QuestionsID, QuestionName, negativeMarks, totalMarks, AuthAdd, AddOnDt, delStatus, quizId)
              VALUES (?, ?, ?, ?, ?, ?, GETDATE(), 0, ?)
            `;

            await queryAsync(conn, insertMappingQuery, [
              parseInt(quizGroupID),
              questionId,
              quizName,
              negativeMarks,
              marks,
              userId.toString(),
              parseInt(quiz_id)  // Add quizId here
            ]);
          }

          // 5. Commit transaction
          await queryAsync(conn, "COMMIT TRANSACTION");

          success = true;
          closeConnection();

          const infoMessage = "Question mappings created successfully";
          logInfo(infoMessage);

          return res.status(200).json({
            success,
            message: infoMessage
          });

        } catch (queryErr) {
          // 6. Rollback on error
          await queryAsync(conn, "ROLLBACK TRANSACTION");
          throw queryErr;
        }

      } catch (queryErr) {
        logError(queryErr);
        closeConnection();
        return res.status(500).json({
          success: false,
          message: queryErr.message || "Failed to create question mappings"
        });
      }
    });
  } catch (error) {
    logError(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
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
        const query = `select group_name, QuizDetails.QuizName,count(QuestionsID) as Total_Question_No, SUM(totalMarks) as MaxScore , group_id, QuizDetails.QuizID
        from
        QuizMapping
        left join GroupMaster on QuizMapping.quizGroupID = GroupMaster.group_id
        left join QuizDetails on QuizMapping.quizId = QuizDetails.QuizID
        where isnull(QuizMapping.delStatus,0)=0
        group by GroupMaster.group_name,QuizDetails.QuizName, GroupMaster.group_id, QuizDetails.QuizID`;
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
    const { quizGroupID, QuizID } = req.body; // Changed from QuizName to QuizID

    if (!quizGroupID || !QuizID) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Both quizGroupID and QuizID are required"
      });
    }

    const groupId = parseInt(quizGroupID);
    const quizId = parseInt(QuizID); // Parse QuizID as integer
    if (isNaN(groupId)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "quizGroupID must be a valid number"
      });
    }
    if (isNaN(quizId)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "QuizID must be a valid number"
      });
    }

    connectToDatabase(async (err, conn) => {
      if (err) {
        return res.status(500).json({
          success: false,
          data: null,
          message: "Database connection failed"
        });
      }

      try {
        // const query = `
        //   SELECT 
        //     quizGroupID,
        //     QuizMapping.quizId,
        //     QuestionsID,
        //     question_text,
        //     Questions.image,
        //     QuestionOptions.id,
        //     QuestionOptions.is_correct,
        //     QuestionOptions.option_text,
        //     QuestionOptions.image,
        //     QuizDetails.QuizName,
        //     QuestionOptions.is_correct
        //     totalMarks,
        //     negativeMarks,
        //     QuizDuration
        //   FROM QuizMapping
        //   LEFT JOIN Questions ON QuizMapping.QuestionsID = Questions.id
        //   LEFT JOIN QuestionOptions ON QuizMapping.QuestionsID = QuestionOptions.question_id
        //   LEFT JOIN QuizDetails ON QuizMapping.quizId = QuizDetails.QuizID
        //   LEFT JOIN QuestionOptions on QuizMapping.QuestionsID = QuestionOptions.question_id
        //   WHERE quizGroupID = ? AND QuizMapping.quizId = ?
        // `;

        const query = `SELECT 
    qm.quizGroupID,
    qm.quizId,
    qm.QuestionsID,
    q.question_text,
    q.image AS question_image,
    qo.id AS option_id,
    qo.is_correct,
    qo.option_text,
    qo.image AS option_image,
    qd.QuizName,
    qm.totalMarks,
    qm.negativeMarks,
    qd.QuizDuration
FROM QuizMapping qm
LEFT JOIN Questions q ON qm.QuestionsID = q.id
LEFT JOIN QuestionOptions qo ON qm.QuestionsID = qo.question_id
LEFT JOIN QuizDetails qd ON qm.quizId = qd.QuizID
WHERE qm.quizGroupID = ? AND qm.quizId = ?;`;

        const questions = await queryAsync(conn, query, [groupId, quizId]);

        if (!questions || questions.length === 0) {
          closeConnection();
          return res.status(404).json({
            success: false,
            data: null,
            message: "No questions found for this quiz"
          });
        }

        success = true;
        closeConnection();
        return res.status(200).json({
          success,
          data: { questions },
          message: "Quiz questions fetched successfully"
        });
      } catch (queryErr) {
        closeConnection();
        console.error("Query error:", queryErr);
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
  const userId = req.user.id; // Assuming you have user authentication

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
        const currentDate = new Date().toISOString();

        // Insert each answer
        for (const answer of answers) {
          if (!answer) continue; // Skip unanswered questions

          const insertQuery = `
                  INSERT INTO quiz_score (
                      userID, quizID, questionID, answerID, correctAns, 
                      marks, AuthAdd, AddOnDt, editOnDt, delStatus
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, GETDATE(), GETDATE(), 0)
                  `;
          for (const option of answer.options) {
            await queryAsync(conn, insertQuery, [
              user.UserID,
              quizId,
              answer.questionId,
              option.id,
              option.is_correct,
              answer.marksAwarded,
              user.Name
            ]);
          }
        }

        // Commit transaction
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
          message: "Failed to submit quiz"
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

// export const getQuizResults = async (req, res) => {
//   let success = false;

//   try {
//     const userEmail = req.user?.id; // This is the email from auth token
//     const { quizId } = req.params;

//     // Validate parameters
//     if (!userEmail || !quizId) {
//       const message = "Both user ID and quiz ID are required";
//       console.warn(message);
//       return res.status(400).json({ success, data: {}, message });
//     }

//     // Convert quizId to number
//     const numericQuizId = parseInt(quizId, 10);
//     if (isNaN(numericQuizId)) {
//       const message = `Invalid quiz ID: ${quizId}`;
//       console.warn(message);
//       return res.status(400).json({ success, data: {}, message });
//     }

//     // Get database connection
//     const conn = await new Promise((resolve, reject) => {
//       connectToDatabase((err, connection) => {
//         if (err) {
//           console.error("DB connection failed:", err);
//           reject(err);
//         } else {
//           resolve(connection);
//         }
//       });
//     });

//     try {
//       // First get the numeric UserID from email
//       const userQuery = `SELECT UserID FROM Community_User 
//                          WHERE ISNULL(delStatus,0) = 0 AND EmailId = ?`;
//       const userRows = await queryAsync(conn, userQuery, [userEmail]);

//       if (userRows.length === 0) {
//         return res.status(404).json({
//           success: false,
//           message: "User not found"
//         });
//       }

//       const numericUserId = userRows[0].UserID;

//       // Now query with the numeric UserID
//       const totalMarksQuery = `
//         SELECT SUM(totalMarks) as totalPossibleMarks
//         FROM quiz_questions
//         WHERE quizID = ? AND ISNULL(delStatus, 0) = 0
//       `;

//       const userScoreQuery = `
//         SELECT 
//           SUM(CAST(marks AS INT)) as totalScore,
//           COUNT(CASE WHEN correctAns = 1 THEN 1 END) as correctAnswers,
//           COUNT(questionID) as totalQuestions
//         FROM quiz_score 
//         WHERE userID = ? AND quizID = ? AND ISNULL(delStatus, 0) = 0
//       `;

//       const [totalMarksResult, userScoreResult] = await Promise.all([
//         queryAsync(conn, totalMarksQuery, [numericQuizId]),
//         queryAsync(conn, userScoreQuery, [numericUserId, numericQuizId])
//       ]);

//       return res.status(200).json({
//         success: true,
//         data: {
//           totalScore: userScoreResult[0]?.totalScore || 0,
//           correctAnswers: userScoreResult[0]?.correctAnswers || 0,
//           totalQuestions: userScoreResult[0]?.totalQuestions || 0,
//           totalPossibleMarks: totalMarksResult[0]?.totalPossibleMarks || 0,
//           userId: numericUserId,
//           quizId: numericQuizId
//         },
//         message: "Quiz results fetched successfully"
//       });

//     } catch (queryErr) {
//       console.error("Query error:", queryErr);
//       return res.status(500).json({
//         success: false,
//         data: {},
//         message: "Database query failed"
//       });
//     } finally {
//       if (conn) closeConnection(conn);
//     }

//   } catch (error) {
//     console.error("Unexpected error:", error);
//     return res.status(500).json({
//       success: false,
//       data: {},
//       message: "Internal server error"
//     });
//   }
// };
