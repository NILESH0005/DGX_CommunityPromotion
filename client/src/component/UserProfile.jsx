import React, { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import UserProfileChart from './UserProfileChart';
import { FaArrowRight, FaEdit, FaUsers, FaPoll, FaTrash } from 'react-icons/fa';
import { GoCommentDiscussion } from "react-icons/go";
import { FaArrowTrendDown, FaArrowTrendUp, FaEllipsisVertical, FaPersonWalkingDashedLineArrowRight } from "react-icons/fa6";
import { images } from '../../public/index.js';
import ChangePassword from './ChangePassword.jsx';
import { CgProfile } from "react-icons/cg";
import { MdEventAvailable } from "react-icons/md";
import { CgPassword } from "react-icons/cg";
import { SlLogout } from "react-icons/sl";
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import ApiContext from '../context/ApiContext.jsx';
import { LiaBlogSolid } from "react-icons/lia";
import LoadPage from './LoadPage.jsx';
import EditProfileModal from './EditProfileModal';
import DiscussionModal from './discussion/DiscussionModal.jsx';
import AddUserEvent from './AddUserEvent.jsx';
import AddUserBlog from './AddUserBlog.jsx';
import UserQuiz from './UserQuiz.jsx'; 
import UserContentTabs from './UserContentTabs';
import UserAvatar from './UserAvatar';

const UserProfile = (props) => {
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { user, userToken, fetchData, setUserToken } = useContext(ApiContext);
  const navigate = useNavigate();
  const [backgroundImage, setBackgroundImage] = useState(images.NvidiaBackground);
  const [userDisscussions, setUserDisscussion] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState([]);
  const [profileImage, setProfileImage] = useState(null);

  // Fetch profile image when user data changes
  useEffect(() => {
    if (user?.ProfilePicture) {
      const fetchProfileImage = async () => {
        try {
          const response = await fetch(user.ProfilePicture);
          if (response.ok) {
            const blob = await response.blob();
            setProfileImage(URL.createObjectURL(blob));
          }
        } catch (error) {
          console.error('Error fetching profile image:', error);
          setProfileImage(null);
        }
      };
      fetchProfileImage();
    }
  }, [user]);

  const stripHtmlTags = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const handleImageChange = (eventOrUrl) => {
    if (typeof eventOrUrl === 'string') {
      // Direct URL case
      setBackgroundImage(eventOrUrl);
    } else if (eventOrUrl.target && eventOrUrl.target.files) {
      // Event object case
      const file = eventOrUrl.target.files[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setBackgroundImage(imageUrl);
      }
    }
  };
  const handleButtonClick = () => {
    setShowEmailInput(true);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const handleEmailBlur = () => {
    if (!validateEmail(email)) {
      setEmailError('Invalid email address');
    } else {
      setEmailError('');
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (validateEmail(email)) {
      setEmailError('');
      setEmailSubmitted(true);
      const endpoint = "user/sendinvite";
      const method = "POST";
      const body = {
        "email": email
      };
      const headers = {
        'Content-Type': 'application/json',
        'auth-token': userToken
      };
      setLoading(true);

      try {
        const data = await fetchData(endpoint, method, body, headers);
        if (!data.success) {
          setLoading(false);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `Error in sending invite: ${data.message}`,
          });
        } else if (data.success) {
          setLoading(false);
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Invite sent successfully!',
          });
        }
      } catch (error) {
        setLoading(false);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Something went wrong, try again.",
        });
      }
    } else {
      setEmailError('Invalid email address');
    }
  };

  const handleLogout = () => {
    Cookies.remove('userToken');
    setUserToken(null);
    navigate('/');
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleClickDiscussion = (discussion) => {
    setSelectedDiscussion(discussion);
    setModalIsOpen(true);
  };

  useEffect(() => {
    const fetchUserDisscussions = () => {
      try {
        const endpoint = "userprofile/getUserDiscussion";
        const method = "POST";
        const body = {};
        const headers = {
          'Content-Type': 'application/json',
          'auth-token': userToken
        };
  
        if (userToken) {
          setLoading(true);
          fetchData(endpoint, method, body, headers)
            .then(result => {
              console.log("Raw API response:", result); // <--- log full result
              if (result && result.data) {
                return result.data;   
              } else {
                throw new Error("Invalid data format");
              }
            })
            .then((data) => {
              console.log("Parsed data:", data); // <--- log parsed data
              setLoading(false);
              setUserDisscussion(data.updatedDiscussions);
            })
            .catch(error => {
              setLoading(false);
              console.log(`Something went wrong: ${error.message}`);
            });
        }
      } catch (error) {
        console.log(error);
      }
    };
  
    if (userToken && user) {
      setIsLoggedIn(true);
      fetchUserDisscussions();
    }
  }, [user, userToken, fetchData]);
  
  console.log("user", user);
  

  const handleDeleteDiscussion = async (discussion) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        const endpoint = "discussion/deleteDiscussion";
        const method = "POST";
        const headers = {
          'Content-Type': 'application/json',
          'auth-token': userToken
        };
        const body = { discussionId: discussion.DiscussionID };

        const response = await fetchData(endpoint, method, body, headers);
        if (response && response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'The discussion has been deleted.',
          });

          setUserDisscussion(prevDiscussions =>
            prevDiscussions.filter(d => d.DiscussionID !== discussion.DiscussionID)
          );
        } else {
          throw new Error("Failed to delete the discussion.");
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Failed to delete the discussion: ${error.message}`,
        });
      }
    }
  };

  return (
    !isLoggedIn ? <h1>login?</h1> : loading ? <LoadPage /> :
      <div className="bg-DGXwhite p-2 md:p-8">
        {modalIsOpen && selectedDiscussion && (
          <DiscussionModal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            discussion={selectedDiscussion}
          />
        )}
        <div className="md:my-4 flex flex-col 2xl:flex-row space-y-4 2xl:space-y-0 2xl:space-x-4">
          <div className="w-full flex flex-col 2xl:w-1/3 sticky top-4 h-[calc(100vh-2rem)] overflow-y-auto">
            <UserAvatar 
              user={user} 
              handleImageChange={handleImageChange} 
              profileImage={profileImage}
            />
            
            <div className="my-4 flex flex-col 2xl:flex-row 2xl:space-y-0 2xl:space-x-4">
              <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                <div className="flex-1 bg-DGXwhite rounded-lg shadow-xl p-8 border border-DGXgreen">
                  <ul>
                    <div className={`flex items-center p-6 cursor-pointer ${activeTab === 'posts' ? 'bg-DGXgreen/40' : ''}`} onClick={() => setActiveTab('posts')}>
                      <GoCommentDiscussion className='mr-4 text-2xl' />
                      <li className={`text-lg ${activeTab === 'posts' ? 'text-DGXblue font-bold' : ''}`}>My Discussions</li>
                    </div>
                    <div className={`flex items-center p-6 cursor-pointer ${activeTab === 'events' ? 'bg-DGXgreen/40' : ''}`} onClick={() => setActiveTab('events')}>
                      <MdEventAvailable className='mr-4 text-2xl' />
                      <li className={`text-lg ${activeTab === 'events' ? 'text-DGXblue font-bold' : ''}`}>My Events</li>
                    </div>
                    <div className={`flex items-center p-6 cursor-pointer ${activeTab === 'blogs' ? 'bg-DGXgreen/40' : ''}`} onClick={() => setActiveTab('blogs')}>
                      <LiaBlogSolid className='mr-4 text-2xl' />
                      <li className={`text-lg ${activeTab === 'blogs' ? 'text-DGXblue font-bold' : ''}`}>My Blogs</li>
                    </div>
                    <div className={`flex items-center p-6 cursor-pointer ${activeTab === 'quiz' ? 'bg-DGXgreen/40' : ''}`} onClick={() => setActiveTab('quiz')}>
                      <FaPoll className='mr-4 text-2xl' />
                      <li className={`text-lg ${activeTab === 'quiz' ? 'text-DGXblue font-bold' : ''}`}>Quiz Dashboard</li>
                    </div>
                    <div className={`flex items-center p-6 cursor-pointer ${activeTab === 'password' ? 'bg-DGXgreen/40' : ''}`} onClick={() => setActiveTab('password')}>
                      <CgPassword className='mr-4 text-2xl' />
                      <li className={`text-lg ${activeTab === 'password' ? 'text-DGXblue font-bold' : ''}`}>Change Password</li>
                    </div>
                    <div className={`flex items-center p-6 cursor-pointer ${activeTab === 'logout' ? 'bg-DGXgreen/40' : ''}`} onClick={() => handleLogout()}>
                      <SlLogout className='mr-4 text-2xl' />
                      <li className={`text-lg ${activeTab === 'logout' ? 'text-DGXblue font-bold' : ''}`}>Logout</li>
                    </div>
                  </ul>
                </div>
                <div className="flex-1 bg-DGXwhite rounded-lg shadow-xl p-4 md:p-8 border border-DGXgreen">
                  <h4 className="text-md md:text-xl text-DGXblack font-bold">Personal Info</h4>
                  <ul className="mt-2 text-sm text-DGXgray">
                    {user.Name && <li className="flex justify-between border-y py-2">
                      <span className="font-bold w-24">Full name</span>
                      <span className="text-DGXgray">{user.Name}</span>
                    </li>}
                    {user.AddOnDt && <li className="flex justify-between border-b py-2">
                      <span className="font-bold w-24">Joined</span>
                      <span className="text-DGXgray">{user.AddOnDt.split('T')[0]}</span>
                    </li>}
                    {user.MobileNumber && <li className="flex justify-between border-b py-2">
                      <span className="font-bold w-24">Mobile</span>
                      <span className="text-DGXgray">{user.MobileNumber}</span>
                    </li>}
                    {user.EmailId && <li className="flex justify-between border-b py-2">
                      <span className="font-bold w-24">Email</span>
                      <span className="text-DGXgray">{user.EmailId}</span>
                    </li>}
                    {user.Designation && <li className="flex justify-between border-b py-2">
                      <span className="font-bold w-24">Designation</span>
                      <span className="text-DGXgray">{user.Designation}</span>
                    </li>}
                    {user.CollegeName && <li className="flex justify-between border-b py-2 flex-col lg:flex-row">
                      <span className="font-bold w-24">College Name</span>
                      <span className="text-DGXgray">{user.CollegeName}</span>
                    </li>}
                    {user.ReferalNumberCount != null && <li className="flex justify-between border-b py-2">
                      <span className="font-bold w-24">Refer Count Remaining</span>
                      <span className="text-DGXgray">{user.ReferalNumberCount}</span>
                    </li>}
                  </ul>
                  <button
                    className={`mt-4 px-4 py-2 bg-DGXgreen text-white rounded hover:bg-DGXdarkgreen ${user.ReferalNumberCount === 0 ? 'bg-DGXgreen opacity-75' : ''}`}
                    onClick={handleButtonClick}
                    disabled={user.ReferalNumberCount === 0}
                  >
                    Refer
                  </button>
                  {showEmailInput && (
                    <div className="mt-4 flex items-center">
                      <input
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        onBlur={handleEmailBlur}
                        className="p-2 border border-DGXgreen rounded w-full mr-2"
                        placeholder="Enter your email"
                      />
                      <button
                        className="px-4 py-2 bg-DGXgreen text-white rounded hover:bg-DGXdarkgreen"
                        onClick={handleEmailSubmit}
                      >
                        Submit
                      </button>
                    </div>
                  )}
                  {emailError && <p className="text-red-500 mt-2">{emailError}</p>}
                  {emailSubmitted && !emailError && <p className="text-green-500 mt-2">Refered successfully!</p>}
                </div>
              </div>
            </div>
          </div>
          
          <UserContentTabs 
            activeTab={activeTab}
            userDisscussions={userDisscussions}
            stripHtmlTags={stripHtmlTags}
            handleClickDiscussion={handleClickDiscussion}
            handleDeleteDiscussion={handleDeleteDiscussion}
            events={props.events}
            setEvents={props.setEvents}
            blogs={props.blogs}
            setBlogs={props.setBlogs}
            quiz={props.quiz}
            setQuiz={props.setQuiz}
          />
        </div>
      </div>
  );
};

export default UserProfile;