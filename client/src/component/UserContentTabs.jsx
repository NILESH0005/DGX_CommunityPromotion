import React from "react";
import { FaArrowRight, FaTrash, FaEdit } from "react-icons/fa";
import AddUserEvent from "./AddUserEvent.jsx";
import AddUserBlog from "./AddUserBlog.jsx";
import UserQuiz from "./UserQuiz.jsx";
import ChangePassword from "./ChangePassword.jsx";

const UserContentTabs = ({
  activeTab,
  userDisscussions,
  stripHtmlTags,
  handleClickDiscussion,
  handleDeleteDiscussion,
  events,
  setEvents,
  blogs,
  setBlogs,
  quiz,
  setQuiz,
  userBlogCount, 
  setDiscussionToEdit,          
  setEditModalIsOpen
}) => {
  const handleEditDiscussion = (discussion) => {
    setDiscussionToEdit(discussion);
    setEditModalIsOpen(true);
  };
  return (
    <div className="w-full lg:w-3/4 bg-white rounded-xl shadow-lg p-6 mx-auto">
      {activeTab === "posts" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">My Posts</h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {userDisscussions.length}{" "}
              {userDisscussions.length === 1 ? "Post" : "Posts"}
            </span>
          </div>

          {userDisscussions.length > 0 ? (
            <div className="space-y-6">
              {userDisscussions.map((discussion, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 bg-white border border-gray-100"
                >
                  <div className="flex flex-col md:flex-row">
                    {discussion.Image && (
                      <div className="w-full md:w-1/3 h-48 md:h-auto">
                        <img
                          className="object-cover w-full h-full"
                          src={discussion.Image}
                          alt={discussion.Title || "Post image"}
                        />
                      </div>
                    )}
                    <div
                      className={`p-5 ${
                        discussion.Image ? "md:w-2/3" : "w-full"
                      }`}
                    >
                      <div className="flex flex-col h-full justify-between">
                        <div>
                          {discussion.Title && (
                            <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                              {discussion.Title}
                            </h3>
                          )}
                          {discussion.Content && (
                            <p className="text-gray-600 mb-4 line-clamp-3">
                              {stripHtmlTags(discussion.Content)}
                            </p>
                          )}
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleClickDiscussion(discussion)}
                              className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                            >
                              Read more
                              <FaArrowRight className="ml-2" />
                            </button>
                            <button
                              onClick={() => handleEditDiscussion(discussion)}
                              className="flex items-center text-green-600 hover:text-green-800 font-medium transition-colors"
                            >
                              Edit
                              <FaEdit className="ml-2" />
                            </button>
                          </div>
                          <button
                            onClick={() => handleDeleteDiscussion(discussion)}
                            className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                            aria-label="Delete post"
                          >
                            <FaTrash className="text-lg" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">
                You haven't created any posts yet.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "events" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">My Events</h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {events.length} {events.length === 1 ? "Event" : "Events"}
            </span>
          </div>
          <AddUserEvent events={events} setEvents={setEvents} />
        </div>
      )}

      {activeTab === "blogs" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">My Blogs</h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {userBlogCount !== undefined ? userBlogCount : blogs.length}{" "}
              {/* Use userBlogCount if available */}
              {userBlogCount === 1 ? " Blog" : " Blogs"}
            </span>
          </div>
          <AddUserBlog blogs={blogs} setBlogs={setBlogs} />
        </div>
      )}

      {activeTab === "quiz" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">User Quiz</h2>
          <UserQuiz quiz={quiz} setQuiz={setQuiz} />
        </div>
      )}

      {activeTab === "password" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Change Password
          </h2>
          <ChangePassword />
        </div>
      )}
    </div>
  );
};

export default UserContentTabs;
