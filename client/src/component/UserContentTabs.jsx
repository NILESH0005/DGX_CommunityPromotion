import React from 'react';
import { FaArrowRight, FaTrash } from 'react-icons/fa';
import AddUserEvent from './AddUserEvent.jsx';
import AddUserBlog from './AddUserBlog.jsx';
import UserQuiz from './UserQuiz.jsx';
import ChangePassword from './ChangePassword.jsx';

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
  setQuiz
}) => {
  return (
    <div className="w-full lg:w-3/4 bg-DGXwhite rounded-lg shadow-xl md:p-4 md:border border-DGXgreen mx-auto">
      {activeTab === 'posts' && (
        <div>
          <div className='post_bar pt-4 flex flex-col space-y-6'>
            <div className='flex-col'>
              <h4 className="text-xl text-[#0f172a] font-bold">My Posts</h4>
            </div>
            {userDisscussions.map((discussion, index) => (
              <div key={index} className='post shadow-xl rounded-md p-2'>
                <a href="#" className="m-2 shadow-xl flex flex-col md:flex-row bg-white border border-DGXgreen rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                  <div className="w-full md:w-1/4">
                    <img className="object-cover w-full h-96 md:h-auto md:rounded-none rounded-t-lg md:rounded-s-lg" src={discussion.Image} alt="" />
                  </div>
                  <div className="w-full md:w-3/4 flex flex-col justify-between p-4 leading-normal">
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{discussion.Title}</h5>
                    <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">{stripHtmlTags(discussion.Content)}</p>
                    <div className="flex justify-between items-center">
                      <span className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        onClick={() => handleClickDiscussion(discussion)}>
                        Read more
                        <FaArrowRight className="ml-1 text-blue-600 dark:text-blue-400" />
                      </span>
                      <div className="flex items-center gap-x-4">
                        <FaTrash className="text-gray-600 hover:text-red-600 cursor-pointer text-xl transition-transform transform hover:scale-110"
                          onClick={() => handleDeleteDiscussion(discussion)} />
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeTab === 'events' && (
        <div className='w-full'>
          <div className='flex-col'>
            <h4 className="text-xl text-[#0f172a] font-bold">My Events</h4>
          </div>
          <AddUserEvent events={events} setEvents={setEvents} />
        </div>
      )}
      {activeTab === 'blogs' && (
        <div className='w-full'>
          <div className='flex-col'>
            <h4 className="text-xl text-[#0f172a] font-bold">My Blogs</h4>
          </div>
          <AddUserBlog blogs={blogs} setBlogs={setBlogs} />
        </div>
      )}
      {activeTab === 'quiz' && (
        <div className='w-full'>
          <div className='flex-col'>
            <h4 className="text-xl text-[#0f172a] font-bold">User Quiz</h4>
          </div>
          <UserQuiz quiz={quiz} setQuiz={setQuiz} />
        </div>
      )}
      {activeTab === 'password' && (
        <div>
          <h4 className="text-xl text-[#0f172a] font-bold">Change Password</h4>
          <ChangePassword />
        </div>
      )}
    </div>
  );
};

export default UserContentTabs;