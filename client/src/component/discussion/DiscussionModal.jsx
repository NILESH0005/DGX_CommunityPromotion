import React, { useState, useContext } from "react";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import ApiContext from "../../context/ApiContext.jsx";
import images from "../../../public/images.js";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom"; // Add this import
import { FaReply } from "react-icons/fa";

const DiscussionModal = ({
  isOpen,
  onRequestClose,
  discussion,
  setDemoDiscussion,
  setDemoDiscussions,
}) => {
  const navigate = useNavigate();
  const handleAuthCheck = () => {
    if (!userToken) {
      Swal.fire({
        icon: "warning",
        title: "Authentication Required",
        text: "You need to login to perform this action",
        confirmButtonText: "Login",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/SignInn"); // Replace with your login route
        }
      });
      return false;
    }
    return true;
  };

  const setDiscussionState = setDemoDiscussion || setDemoDiscussions;
  const [dissComments, setDissComments] = useState(discussion.comment || []);
  const [newComment, setNewComment] = useState("");
  const [replyTexts, setReplyTexts] = useState({});
  const [nestedReplyTexts, setNestedReplyTexts] = useState({});
  const [activeReplyIndex, setActiveReplyIndex] = useState(null);
  const [activeNestedReplyIndex, setActiveNestedReplyIndex] = useState({});
  const { fetchData, userToken, user } = useContext(ApiContext);
  const [loading, setLoading] = useState(false);
  const handleAddComment = async (id) => {
    if (!handleAuthCheck()) return;

    if (!newComment.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Comment cannot be empty!",
      });
      return;
    }

    if (userToken) {
      const endpoint = "discussion/discussionpost";
      const method = "POST";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };
      const body = { reference: id, comment: newComment };

      setLoading(true);

      try {
        const data = await fetchData(endpoint, method, body, headers);
        console.log("API Responserrrr:", data); // Debug log

        if (!data.success) {
          setLoading(false);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: `Error posting comment: ${data.message}`,
          });
          return;
        }

        // Create a new comment object
        const newCommentObj = {
          UserID: user.UserID,
          UserName: user.Name,
          DiscussionID: data.data?.postId || data.postId || Date.now(), // Handle both response structures
          timestamp: new Date().toISOString(),
          Comment: newComment,
          comment: [],
          likeCount: 0,
          userLike: 0,
        };
        // Update the parent state
        setDemoDiscussion((prevDiscussions) =>
          prevDiscussions.map((item) =>
            item.DiscussionID === discussion.DiscussionID
              ? {
                  ...item,
                  comment: [newCommentObj, ...item.comment],
                }
              : item
          )
        );

        // Update local state
        setDissComments((prev) => [newCommentObj, ...prev]);
        setNewComment("");
        setLoading(false);

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Comment posted successfully!",
        });
      } catch (error) {
        setLoading(false);
        console.error("Error posting comment:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong. Try again.",
        });
      }
    }
  };

  const handleReplyTextChange = (index, text) => {
    setReplyTexts((prevState) => ({
      ...prevState,
      [index]: text,
    }));
  };

  const handleAddReply = async (
    commentIndex,
    replyText,
    id,
    parentReplyIndex = null
  ) => {
    if (!handleAuthCheck()) return;

    if (!replyText.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Reply cannot be empty!",
      });
      return;
    }

    const endpoint = "discussion/discussionpost";
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };
    const body = {
      reference: id,
      comment: replyText,
    };

    setLoading(true);

    try {
      const data = await fetchData(endpoint, method, body, headers);

      if (!data.success) {
        throw new Error(data.message || "Failed to post reply");
      }

      const newReplyObj = {
        Comment: replyText,
        DiscussionID: id,
        UserName: user.Name,
        UserID: user.UserID,
        UserImage: user.ProfilePicture,
        likeCount: 0,
        timestamp: new Date().toISOString(),
        userLike: 0,
        comment: [], // Initialize with empty array
      };

      // Update the parent state
      setDemoDiscussion((prevDiscussions) =>
        prevDiscussions.map((item) => {
          if (item.DiscussionID === discussion.DiscussionID) {
            const updatedComments = [...item.comment];

            if (parentReplyIndex !== null) {
              // Ensure the comment array exists before spreading
              const parentComment =
                updatedComments[commentIndex].comment[parentReplyIndex];
              parentComment.comment = parentComment.comment || [];
              parentComment.comment = [...parentComment.comment, newReplyObj];
            } else {
              // Ensure the comment array exists before spreading
              updatedComments[commentIndex].comment =
                updatedComments[commentIndex].comment || [];
              updatedComments[commentIndex].comment = [
                ...updatedComments[commentIndex].comment,
                newReplyObj,
              ];
            }

            return {
              ...item,
              comment: updatedComments,
            };
          }
          return item;
        })
      );

      // Update local state
      if (parentReplyIndex !== null) {
        setNestedReplyTexts((prev) => ({
          ...prev,
          [`${commentIndex}-${parentReplyIndex}`]: "",
        }));
        setActiveNestedReplyIndex((prev) => ({
          ...prev,
          [commentIndex]: null,
        }));
      } else {
        setReplyTexts((prev) => ({
          ...prev,
          [commentIndex]: "",
        }));
        setActiveReplyIndex(null);
      }

      setLoading(false);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Reply posted successfully!",
      });
    } catch (error) {
      setLoading(false);
      console.error("Error posting reply:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: `Error posting reply: ${error.message}`,
      });
    }
  };

  const toggleReply = (commentIndex) => {
    setActiveReplyIndex(
      activeReplyIndex === commentIndex ? null : commentIndex
    );
  };

  const toggleNestedReply = (commentIndex, replyIndex) => {
    setActiveNestedReplyIndex((prev) => ({
      ...prev,
      [commentIndex]:
        activeNestedReplyIndex[commentIndex] === replyIndex ? null : replyIndex,
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getUserImage = (userData) => {
    return userData?.UserImage || images.defaultProfile;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <img
              src={getUserImage(discussion)}
              className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-full"
              alt="Profile"
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                {discussion.Title}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-500">
                <span>{discussion.AuthAdd || "Unknown author"}</span>
                <span className="hidden sm:block">•</span>
                <span>
                  {discussion.AddOnDt
                    ? formatDate(discussion.AddOnDt)
                    : "No date available"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onRequestClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Discussion Content */}
          <div className="md:w-1/2 p-6 overflow-y-auto border-b md:border-b-0 md:border-r border-gray-200">
            {discussion.Image && (
              <div className="mb-6 rounded-lg overflow-hidden">
                <img
                  src={discussion.Image}
                  alt="Post"
                  className="w-full h-auto max-h-96 object-contain mx-auto"
                />
              </div>
            )}

            <div
              className="prose max-w-none mb-6"
              dangerouslySetInnerHTML={{ __html: discussion.Content }}
            />

            {discussion.Tag && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {discussion.Tag.split(",")
                    .filter((tag) => tag)
                    .map((tag, index) => (
                      <span
                        key={index}
                        className="bg-DGXblue text-white px-3 py-1 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {discussion.ResourceUrl && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Links
                </h3>
                <ul className="space-y-2">
                  {discussion.ResourceUrl.split(",")
                    .filter((link) => link)
                    .map((link, index) => (
                      <li key={index}>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-DGXblue hover:underline break-all"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="md:w-1/2 flex flex-col">
            {/* Comment Input */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex space-x-2">
                <img
                  src={user?.ProfilePicture || images.defaultProfile}
                  className="w-10 h-10 rounded-full"
                  alt="User"
                />
                <div className="flex-1">
                  <textarea
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-DGXblue focus:border-transparent"
                    placeholder="Add a comment..."
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => handleAddComment(discussion.DiscussionID)}
                      className="bg-DGXgreen hover:bg-DGXblue text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      {userToken ? "Post Comment" : "Login to Comment"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Comments ({dissComments.length})
              </h3>

              {dissComments.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                <ul className="space-y-4">
                  {dissComments.map((comment, commentIndex) => (
                    <li key={commentIndex} className="group">
                      <div className="flex space-x-3">
                        <img
                          src={getUserImage(comment)}
                          className="w-10 h-10 rounded-full"
                          alt="User"
                        />
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-semibold text-gray-800">
                                  {comment.UserName}
                                </span>
                                <span className="text-xs text-gray-500 ml-2">
                                  {formatDate(comment.timestamp)}
                                </span>
                              </div>
                              <button
                                onClick={() => toggleReply(commentIndex)}
                                className="text-gray-500 hover:text-DGXblue"
                              >
                                <FaReply />
                              </button>
                            </div>
                            <p className="mt-1 text-gray-700">
                              {comment.Comment}
                            </p>
                          </div>

                          {/* Reply form */}
                          {activeReplyIndex === commentIndex && (
                            <div className="ml-10 mt-3">
                              <div className="flex space-x-2">
                                <img
                                  src={
                                    user?.ProfilePicture ||
                                    images.defaultProfile
                                  }
                                  className="w-8 h-8 rounded-full"
                                  alt="User"
                                />
                                <div className="flex-1">
                                  <textarea
                                    rows={2}
                                    value={replyTexts[commentIndex] || ""}
                                    onChange={(e) =>
                                      handleReplyTextChange(
                                        commentIndex,
                                        e.target.value
                                      )
                                    }
                                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-DGXblue focus:border-transparent"
                                    placeholder="Write a reply..."
                                  />
                                  <div className="flex justify-end mt-1 space-x-2">
                                    <button
                                      onClick={() => setActiveReplyIndex(null)}
                                      className="text-sm text-gray-600 hover:text-gray-800"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleAddReply(
                                          commentIndex,
                                          replyTexts[commentIndex],
                                          comment.DiscussionID
                                        )
                                      }
                                      className="bg-DGXgreen hover:bg-DGXblue text-white text-sm font-medium py-1 px-3 rounded-lg transition-colors"
                                    >
                                      Reply
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Replies */}
                          {comment.comment?.length > 0 && (
                            <div className="ml-10 mt-3 space-y-3">
                              {comment.comment.map((reply, replyIndex) => (
                                <div
                                  key={replyIndex}
                                  className="flex space-x-3"
                                >
                                  <img
                                    src={getUserImage(reply)}
                                    className="w-8 h-8 rounded-full"
                                    alt="User"
                                  />
                                  <div className="flex-1">
                                    <div className="bg-gray-50 rounded-lg p-3">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <span className="font-semibold text-gray-800">
                                            {reply.UserName}
                                          </span>
                                          <span className="text-xs text-gray-500 ml-2">
                                            {formatDate(reply.timestamp)}
                                          </span>
                                        </div>
                                        <button
                                          onClick={() =>
                                            toggleNestedReply(
                                              commentIndex,
                                              replyIndex
                                            )
                                          }
                                          className="text-gray-500 hover:text-DGXblue"
                                        >
                                          <FaReply />
                                        </button>
                                      </div>
                                      <p className="mt-1 text-gray-700 text-sm">
                                        {reply.Comment}
                                      </p>
                                    </div>

                                    {/* Nested Reply form */}
                                    {activeNestedReplyIndex[commentIndex] ===
                                      replyIndex && (
                                      <div className="ml-8 mt-2">
                                        <div className="flex space-x-2">
                                          <img
                                            src={
                                              user?.ProfilePicture ||
                                              images.defaultProfile
                                            }
                                            className="w-6 h-6 rounded-full"
                                            alt="User"
                                          />
                                          <div className="flex-1">
                                            <textarea
                                              rows={1}
                                              value={
                                                nestedReplyTexts[
                                                  `${commentIndex}-${replyIndex}`
                                                ] || ""
                                              }
                                              onChange={(e) =>
                                                setNestedReplyTexts((prev) => ({
                                                  ...prev,
                                                  [`${commentIndex}-${replyIndex}`]:
                                                    e.target.value,
                                                }))
                                              }
                                              className="w-full rounded-lg border border-gray-300 p-2 text-xs focus:ring-2 focus:ring-DGXblue focus:border-transparent"
                                              placeholder="Write a reply..."
                                            />
                                            <div className="flex justify-end mt-1 space-x-2">
                                              <button
                                                onClick={() =>
                                                  setActiveNestedReplyIndex(
                                                    (prev) => ({
                                                      ...prev,
                                                      [commentIndex]: null,
                                                    })
                                                  )
                                                }
                                                className="text-xs text-gray-600 hover:text-gray-800"
                                              >
                                                Cancel
                                              </button>
                                              <button
                                                onClick={() =>
                                                  handleAddReply(
                                                    commentIndex,
                                                    nestedReplyTexts[
                                                      `${commentIndex}-${replyIndex}`
                                                    ],
                                                    comment.DiscussionID,
                                                    replyIndex
                                                  )
                                                }
                                                className="bg-DGXgreen hover:bg-DGXblue text-white text-xs font-medium py-1 px-2 rounded-lg transition-colors"
                                              >
                                                Reply
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Nested Replies */}
                                    {reply.comment?.length > 0 && (
                                      <div className="ml-8 mt-2 space-y-2">
                                        {reply.comment.map(
                                          (nestedReply, nestedIndex) => (
                                            <div
                                              key={nestedIndex}
                                              className="flex space-x-2 mt-2"
                                            >
                                              <img
                                                src={getUserImage(nestedReply)}
                                                className="w-6 h-6 rounded-full"
                                                alt="User"
                                              />
                                              <div className="flex-1 bg-gray-50 rounded-lg p-2">
                                                <div className="flex justify-between items-start">
                                                  <div>
                                                    <span className="font-medium text-gray-800 text-xs">
                                                      {nestedReply.UserName}
                                                    </span>
                                                    <span className="text-xs text-gray-500 ml-2">
                                                      {formatDate(
                                                        nestedReply.timestamp
                                                      )}
                                                    </span>
                                                  </div>
                                                </div>
                                                <p className="mt-1 text-gray-700 text-xs">
                                                  {nestedReply.Comment}
                                                </p>
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionModal;
