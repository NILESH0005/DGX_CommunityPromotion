import { body, validationResult } from 'express-validator';
import { connectToDatabase, closeConnection } from '../database/mySql.js';
import dotenv from 'dotenv'
import { queryAsync, mailSender, logError, logInfo, logWarning } from '../helper/index.js';

dotenv.config()


export const discussionpost = async (req, res) => {
    console.log("invoming req body", req.body);
    let success = false;

    const userId = req.user.id;
    console.log(userId)

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const warningMessage = "Data is not in the right format";
        logWarning(warningMessage); // Log the warning
        res.status(400).json({ success, data: errors.array(), message: warningMessage });
        return;
    }

    try {
        console.log(req.body)
        let { title, content, image, likes, comment, tags, url, visibility, reference } = req.body;
        const threadReference = reference ?? 0;
        title = title ?? null
        content = content ?? null
        image = image ?? null
        likes = likes ?? null
        comment = comment ?? null
        tags = tags ?? null
        url = url ?? null
        visibility = visibility ?? null

        // Connect to the database
        connectToDatabase(async (err, conn) => {
            if (err) {
                const errorMessage = "Failed to connect to database";
                logError(err); // Log the error
                res.status(500).json({ success: false, data: err, message: errorMessage });
                return;
            }

            try {
                const query = `SELECT UserID, Name FROM Community_User WHERE isnull(delStatus,0) = 0 AND EmailId = ?`;
                const rows = await queryAsync(conn, query, [userId]);
                // console.log(rows)

                if (rows.length > 0) {

                    if (likes !== null) {
                        const likeExistsQuery = `select DiscussionID from Community_Discussion where ISNULL(delStatus,0)=0 and Reference= ? and UserID = ? and Likes is not null;`
                        const likeExists = await queryAsync(conn, likeExistsQuery, [threadReference, rows[0].UserID])
                        if (likeExists.length > 0) {
                            // console.log(likeExists[0].DiscussionID)
                            const updateLikeQuery = `UPDATE Community_Discussion SET Likes = ?, AuthLstEdit= ?, editOnDt= GETDATE() WHERE ISNULL(delStatus, 0) = 0 AND DiscussionID = ?`
                            const updateLike = await queryAsync(conn, updateLikeQuery, [likes, rows[0].Name, likeExists[0].DiscussionID])
                            const infoMessage = "like Posted Successfully"
                            closeConnection();
                            res.status(200).json({ success: true, data: {}, message: infoMessage });
                            return
                        }
                    }
                    const discussionPostQuery = `
                    INSERT INTO Community_Discussion 
                    (UserID, Title, Content, Image, Likes, Comment, Tag, Visibility, Reference, ResourceUrl, AuthAdd, AddOnDt, delStatus) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE(), ?); 
                    `;
                    const discussionPost = await queryAsync(conn, discussionPostQuery, [rows[0].UserID, title, content, image, likes, comment, tags, visibility, threadReference, url, rows[0].Name, 0])
                    const lastInsertedIdQuerry = `select top 1 DiscussionID, Visibility from Community_Discussion where ISNULL(delStatus,0)=0 order by DiscussionID desc;`
                    const lastInsertedId = await queryAsync(conn, lastInsertedIdQuerry)
                    const lstInsertedvisibilityValue = `SELECT ddValue FROM tblDDReferences WHERE idCode = 1 AND ISNULL(delStatus,0) = 0`;
                    // const lstInserterterVal = await queryAsync(conn, lstInsertedvisibilityValue, [lastInsertedId[0].Visibility])
                    const lstInserterterVal = await queryAsync(conn, lstInsertedvisibilityValue, [lastInsertedId[0].Visibility]);
                    console.log("val", lstInserterterVal[0].ddValue)
                    success = true;
                    closeConnection();
                    const infoMessage = "Disscussion Posted Successfully"
                    logInfo(infoMessage)
                    res.status(200).json({ success, data: { postId: lastInsertedId[0].DiscussionID, visibility: { value: lstInserterterVal[0].ddValue, id: lastInsertedId[0].Visibility } }, message: infoMessage });
                    return
                } else {
                    closeConnection();
                    const warningMessage = "User not found login first"
                    logWarning(warningMessage)
                    res.status(200).json({ success: false, data: {}, message: warningMessage });
                    return
                }
            } catch (queryErr) {
                closeConnection();
                console.error("Database Query Error:", queryErr);
                logError(queryErr)
                res.status(500).json({ success: false, data: queryErr, message: 'Something went wrong please try again' });
                return
            }
        });
    } catch (error) {
        logError(error)
        return res.status(500).json({ success: false, data: {}, message: 'Something went wrong please try again' });

    }
}

export const getdiscussion = async (req, res) => {
    let success = false;
    console.log("user is", req.body);
    
    const userId = req.body.user;
    console.log("Received request for getdiscussion. User ID:", userId)
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
                let rows = [];
                if (userId !== null && userId !== undefined) {
                    const query = `SELECT UserID, Name FROM Community_User WHERE isnull(delStatus,0) = 0 AND EmailId = ?`;
                    rows = await queryAsync(conn, query, [userId]);
                    // console.log("User Query Result:", rows); // Log the result of the user query
                }

                if (rows.length === 0) {
                    rows.push({ UserID: null });
                }

                const discussionGetQuery = `SELECT DiscussionID, UserID, AuthAdd as UserName, Title, Content, Image, Tag, ResourceUrl, AddOnDt as timestamp FROM Community_Discussion WHERE ISNULL(delStatus, 0) = 0 AND Visibility = '2' AND Reference = 0 ORDER BY AddOnDt DESC`;
                const discussionGet = await queryAsync(conn, discussionGetQuery);
                // console.log("Discussion Get Result:", discussionGet); // Log discussionGet

                const updatedDiscussions = [];

                for (const item of discussionGet) {
                    const likeCountQuery = `SELECT DiscussionID, UserID, Likes, AuthAdd as UserName FROM Community_Discussion WHERE ISNULL(delStatus, 0) = 0 AND Likes > 0 AND Reference = ?`;
                    const likeCountResult = await queryAsync(conn, likeCountQuery, [item.DiscussionID]);
                    // console.log("Like Count Result for Discussion:", item.DiscussionID, likeCountResult); // Log likeCountResult

                    const commentQuery = `SELECT DiscussionID, UserID, Comment, AuthAdd as UserName, AddOnDt as timestamp FROM Community_Discussion WHERE ISNULL(delStatus, 0) = 0 AND  Comment IS NOT NULL AND Reference = ? ORDER BY AddOnDt DESC`;
                    const commentResult = await queryAsync(conn, commentQuery, [item.DiscussionID]);
                    const commentsArray = Array.isArray(commentResult) ? commentResult : [];
                    // console.log("Comments Array for Discussion:", item.DiscussionID, commentsArray); // Log commentsArray

                    const commentsArrayUpdated = [];
                    let userLike = 0;

                    if (likeCountResult.some(likeItem => likeItem.UserID === rows[0].UserID && likeItem.Likes === 1)) {
                        userLike = 1;
                    }

                    if (commentsArray.length > 0) {
                        for (const comment of commentsArray) {
                            const commentsArrayUpdatedSecond = [];

                            const likeCountQuery = `SELECT DiscussionID, UserID, Likes, AuthAdd as UserName FROM Community_Discussion WHERE ISNULL(delStatus, 0) = 0 AND Likes > 0 AND Reference = ?`;
                            const likeCountResult = await queryAsync(conn, likeCountQuery, [comment.DiscussionID]);
                            const likeCount = likeCountResult.length > 0 ? likeCountResult.length : 0;

                            const commentQuery = `SELECT DiscussionID, UserID, Comment, AuthAdd as UserName, AddOnDt as timestamp FROM Community_Discussion WHERE ISNULL(delStatus, 0) = 0 AND  Comment IS NOT NULL AND Reference = ? ORDER BY AddOnDt DESC`;
                            const commentResult = await queryAsync(conn, commentQuery, [comment.DiscussionID]);
                            const secondLevelCommentsArray = Array.isArray(commentResult) ? commentResult : [];

                            let secondLevelUserLike = 0;
                            if (likeCountResult.some(likeItem => likeItem.UserID === rows[0].UserID && likeItem.Likes === 1)) {
                                secondLevelUserLike = 1;
                            }

                            if (secondLevelCommentsArray.length > 0) {
                                for (const secondLevelComment of secondLevelCommentsArray) {
                                    const secondLevelLikeCountQuery = `SELECT DiscussionID, UserID, Likes, AuthAdd as UserName, AddOnDt as timestamp FROM Community_Discussion WHERE ISNULL(delStatus, 0) = 0 AND Likes > 0 AND Reference = ?`;
                                    const secondLevelLikeCountResult = await queryAsync(conn, secondLevelLikeCountQuery, [secondLevelComment.DiscussionID]);
                                    const secondLevelLikeCount = secondLevelLikeCountResult.length > 0 ? secondLevelLikeCountResult.length : 0;

                                    let secondLevelUserLike = 0;
                                    if (secondLevelLikeCountResult.some(likeItem => likeItem.UserID === rows[0].UserID && likeItem.Likes === 1)) {
                                        secondLevelUserLike = 1;
                                    }

                                    commentsArrayUpdatedSecond.push({ ...secondLevelComment, likeCount: secondLevelLikeCount, userLike: secondLevelUserLike });
                                }
                            }

                            commentsArrayUpdated.push({ ...comment, likeCount, userLike: secondLevelUserLike, comment: commentsArrayUpdatedSecond });
                        }
                    }

                    const likeCount = likeCountResult.length > 0 ? likeCountResult.length : 0;
                    updatedDiscussions.push({ ...item, likeCount, userLike, comment: commentsArrayUpdated });
                }

                success = true;
                // console.log("Updated Discussions Array:", updatedDiscussions); // Log final updatedDiscussions array

                closeConnection(); // Close the connection after all operations
                const infoMessage = "Discussion Get Successfully";
                logInfo(infoMessage);
                res.status(200).json({ success, data: { updatedDiscussions }, message: infoMessage });
            }
            catch (queryErr) {
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

export const searchdiscussion = async (req, res) => {
    let success = false;
    const { searchTerm, userId } = req.body;

    if (!searchTerm || searchTerm.trim() === "") {
        return res.status(400).json({ success: false, message: "Search term is required." });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const warningMessage = "Data is not in the right format";
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
                let rows = [];
                if (userId) {
                    const query = `SELECT UserID, Name FROM Community_User WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?`;
                    rows = await queryAsync(conn, query, [userId]);
                }

                if (rows.length === 0) {
                    rows.push({ UserID: null });
                }

                const searchPattern = `%${searchTerm}%`;
                const discussionGetQuery = `
                    SELECT 
                        DiscussionID, UserID, AuthAdd as UserName, Title, Content, Image, Tag, ResourceUrl, AddOnDt as timestamp 
                    FROM 
                        Community_Discussion 
                    WHERE 
                        ISNULL(delStatus, 0) = 0 
                        AND Visibility = 'public' 
                        AND Reference = 0 
                        AND (
                            Title LIKE ? OR 
                            Content LIKE ? OR 
                            Tag LIKE ?
                        ) 
                    ORDER BY AddOnDt DESC
                `;

                const discussionGet = await queryAsync(conn, discussionGetQuery, [searchPattern, searchPattern, searchPattern]);

                const updatedDiscussions = [];

                for (const item of discussionGet) {
                    const likeCountQuery = `SELECT DiscussionID, UserID, Likes FROM Community_Discussion WHERE ISNULL(delStatus, 0) = 0 AND Likes > 0 AND Reference = ?`;
                    const likeCountResult = await queryAsync(conn, likeCountQuery, [item.DiscussionID]);

                    const commentQuery = `SELECT DiscussionID, UserID, Comment, AuthAdd as UserName, AddOnDt as timestamp FROM Community_Discussion WHERE ISNULL(delStatus, 0) = 0 AND Comment IS NOT NULL AND Reference = ? ORDER BY AddOnDt DESC`;
                    const commentResult = await queryAsync(conn, commentQuery, [item.DiscussionID]);

                    const commentsArrayUpdated = [];
                    let userLike = 0;

                    if (likeCountResult.some(likeItem => likeItem.UserID === rows[0].UserID && likeItem.Likes === 1)) {
                        userLike = 1;
                    }

                    if (commentResult.length > 0) {

                    }

                    updatedDiscussions.push({
                        ...item,
                        likeCount: likeCountResult.length,
                        userLike,
                        comment: commentsArrayUpdated,
                        highlightedTitle: item.Title.replace(new RegExp(searchTerm, 'gi'), (match) => `<strong>${match}</strong>`),
                        highlightedContent: item.Content.replace(new RegExp(searchTerm, 'gi'), (match) => `<strong>${match}</strong>`),
                    });
                }

                success = true;
                closeConnection();
                res.status(200).json({ success, data: { updatedDiscussions }, message: "Discussion Get Successfully" });
                return;

            } catch (queryErr) {
                closeConnection();
                logError(queryErr);
                res.status(500).json({ success: false, data: queryErr, message: 'Something went wrong, please try again.' });
                return;
            }
        });
    } catch (error) {
        logError(error);
        return res.status(500).json({ success: false, data: {}, message: 'Something went wrong, please try again.' });
    }
};

// export const deleteProjectShowcase = (req, res) => {
//     let success = false;
//     const adminName = req.user?.id; // Extract user ID from the token

//     if (!adminName) {
//         return res.status(401).json({
//             success: false,
//             message: "Unauthorized: User information not found in token.",
//         });
//     }

//     try {
//         connectToDatabase(async (err, conn) => {
//             if (err) {
//                 logError(err);
//                 return res.status(500).json({
//                     success: false,
//                     data: err,
//                     message: "Database connection error.",
//                 });
//             }
//             try {
//                 // Check if the ProjectShowcase exists and is not already deleted
//                 const checkQuery = `SELECT * FROM tblCMSContent WHERE ComponentName = 'ProjectShowcase' AND (delStatus IS NULL OR delStatus = 0)`;
//                 const result = await queryAsync(conn, checkQuery);

//                 if (result.length === 0) {
//                     return res.status(404).json({
//                         success: false,
//                         message: "ProjectShowcase not found or already deleted.",
//                     });
//                 } else {
//                     try {
//                         // Update the delStatus, delOnDt, and AuthDel fields for the ProjectShowcase
//                         const updateQuery = `
//                 UPDATE tblCMSContent  
//                 SET delStatus = 1, delOnDt = GETDATE(), AuthDel = ?  
//                 OUTPUT inserted.idCode, inserted.delStatus, inserted.delOnDt, inserted.AuthDel
//                 WHERE ComponentName = 'ProjectShowcase' AND (delStatus IS NULL OR delStatus = 0)
//               `;
//                         const rows = await queryAsync(conn, updateQuery, [adminName]);

//                         if (rows.length > 0) {
//                             success = true;
//                             logInfo("ProjectShowcase deleted successfully");
//                             return res.status(200).json({
//                                 success,
//                                 data: {
//                                     idCode: rows[0].idCode,
//                                     AuthDel: rows[0].AuthDel,
//                                     delOnDt: rows[0].delOnDt,
//                                     delStatus: rows[0].delStatus
//                                 },
//                                 message: "ProjectShowcase deleted successfully.",
//                             });
//                         } else {
//                             logWarning("Failed to delete the ProjectShowcase.");
//                             return res.status(404).json({
//                                 success: false,
//                                 message: "Failed to delete the ProjectShowcase.",
//                             });
//                         }
//                     } catch (updateErr) {
//                         logError(updateErr);
//                         return res.status(500).json({
//                             success: false,
//                             data: updateErr,
//                             message: "Error updating ProjectShowcase deletion.",
//                         });
//                     }
//                 }
//             } catch (error) {
//                 logError(error);
//                 return res.status(404).json({
//                     success: false,
//                     message: "Error finding ProjectShowcase data!",
//                 });
//             }
//         });
//     } catch (error) {
//         logError(error);
//         return res.status(500).json({
//             success: false,
//             message: "Unable to connect to the database!",
//         });
//     }
// };


export const deleteDiscussion = (req, res) => {
    let success = false;
    const { discussionId } = req.body;
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
                const checkQuery = `SELECT * FROM Community_Discussion WHERE DiscussionID = ? AND (delStatus IS NULL OR delStatus = 0)`;
                const result = await queryAsync(conn, checkQuery, [discussionId]);

                if (result.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Discussion not found or already deleted.",
                    });
                } else {
                    try {
                        const updateQuery = ` UPDATE Community_Discussion  SET delStatus = 1, delOnDt = GETDATE(), AuthDel = ?  OUTPUT inserted.DiscussionID, inserted.delStatus,inserted.delOnDt, inserted.AuthDel
                WHERE DiscussionID = ? AND (delStatus IS NULL OR delStatus = 0)
              `;
                        const rows = await queryAsync(conn, updateQuery, [adminName, discussionId]);

                        if (rows.length > 0) {
                            success = true;
                            logInfo("Discussion deleted successfully");
                            return res.status(200).json({
                                success,
                                data: {
                                    discussionId: rows[0].DiscussionID,
                                    AuthDel: rows[0].AuthDel,
                                    delOnDt: rows[0].delOnDt,
                                    delStatus: rows[0].delStatus
                                },
                                message: "Discussion deleted successfully.",
                            });
                        } else {
                            logWarning("Failed to delete the discussion.");
                            return res.status(404).json({
                                success: false,
                                message: "Failed to delete the discussion.",
                            });
                        }
                    } catch (updateErr) {
                        logError(updateErr);
                        return res.status(500).json({
                            success: false,
                            data: updateErr,
                            message: "Error updating discussion deletion.",
                        });
                    }
                }
            } catch (error) {
                return res.status(404).json({
                    success: false,
                    message: "Error finding discussion data!",
                });
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to connect to the database!",
        });
    }
};
