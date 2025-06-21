import React, { useState, useContext, useEffect } from 'react';
import { FaSearch, FaComment, FaTrophy } from 'react-icons/fa';
import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
import ApiContext from '../context/ApiContext.jsx';
import DiscussionModal from '../component/discussion/DiscussionModal';
import { AiFillLike, AiOutlineLike, AiOutlineComment } from "react-icons/ai";
import { useCallback } from 'react';
import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';
import { Tooltip } from 'react-tooltip';
import AddDiscussion from '../component/discussion/AddDiscussion.jsx';
import Swal from 'sweetalert2';


const Discussion = () => {
  const { fetchData, userToken, user } = useContext(ApiContext);
  const [demoDiscussions, setDemoDiscussions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [discussions, setDiscussions] = useState([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [communityHighlights, setCommunityHighlights] = useState([])
  const [topUsers, setTopUsers] = useState([])
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsLoading(false);
    };
    loadEvents();
  }, []);

  const getCommunityHighlights = (discussions) => {
    const sortedDiscussions = discussions.sort((a, b) => b.comment.length - a.comment.length);
    return sortedDiscussions.slice(0, 5);
  }

  const getTopUsersByDiscussions = (discussions) => {
    const userDiscussionCount = {};

    discussions.forEach(discussion => {
      const { UserID, UserName } = discussion;

      if (userDiscussionCount[UserID]) {
        userDiscussionCount[UserID].count++;
      } else {
        userDiscussionCount[UserID] = { userName: UserName, count: 1 };
      }
    });

    const usersArray = Object.keys(userDiscussionCount).map(UserID => ({
      userID: UserID,
      userName: userDiscussionCount[UserID].userName,
      count: userDiscussionCount[UserID].count
    }));

    return usersArray.sort((a, b) => b.count - a.count).slice(0, 5);
  };
  const fetchDiscussionData = (userEmail) => {
    try {
      const body = userEmail ? { user: userEmail } : { user: null };
      const endpoint = "discussion/getdiscussion";
      const method = "POST";
      const headers = {
        'Content-Type': 'application/json',
      };

      setLoading(true);
      fetchData(endpoint, method, body, headers)
        .then(result => {
          console.log("result is", result)
          if (result && result.data) {
            return result.data;
          } else {
            // return
            // throw new Error("Invalid data format");
          }
        })
        .then(data => {
          if (data && data.updatedDiscussions) {
            setDemoDiscussions(data.updatedDiscussions);
            const highlights = getCommunityHighlights(data.updatedDiscussions);
            setCommunityHighlights(highlights)
            const users = getTopUsersByDiscussions(data.updatedDiscussions);
            setTopUsers(users)
          } else {
            throw new Error("Missing updatedDiscussions in response data");
          }
          setLoading(false);
        })
        .catch(error => {
          setLoading(false);
          console.error(`Something went wrong: ${error.message}`);
        });
    } catch (error) {
      console.log(error)
    }
  };
  useEffect(() => {
    if (userToken && user) {
      setIsLoggedIn(true);
      fetchDiscussionData(user.EmailId);
    } else {
      setIsLoggedIn(false);
      fetchDiscussionData(null);
    }
  }, [user, userToken, fetchData]);


  const searchDiscussion = useCallback(async (searchTerm, userId) => {
    try {
      const body = { searchTerm, userId }; // Match the backend expected structure
      const endpoint = "discussion/searchdiscussion";
      const method = "POST";
      const headers = {
        'Content-Type': 'application/json',
      };

      setLoading(true);
      const result = await fetchData(endpoint, method, body, headers);
      console.log("API Response:", result);
      if (result && result.data && result.data.updatedDiscussions) {
        setDemoDiscussions(result.data.updatedDiscussions);
      } else {
        console.error("No discussions found.");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(`Something went wrong: ${error.message}`);
    }
  }, [fetchData]);

  const checkAuthAndNavigate = () => {
    if (!userToken) {
      Swal.fire({
        title: 'Login Required',
        text: 'You need to login to perform this action',
        icon: 'warning',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('./SignInn');
        }
      });
      return false;
    }
    return true;
  };

  const handleAddLike = async (id, userLike) => {
    // console.log(id, userLike)
    if (!checkAuthAndNavigate()) return;

    const endpoint = "discussion/discussionpost";
    const method = "POST";
    const headers = {
      'Content-Type': 'application/json',
      'auth-token': userToken
    };
    const like = userLike == 1 ? 0 : 1
    const body = {
      "reference": id,
      "likes": like
    };
    console.log(body)
    try {
      const data = await fetchData(endpoint, method, body, headers)
      if (!data.success) {
        // console.log(data)
        console.log("Error occured while liking the post")
      } else if (data.success) {
        // console.log(data);
        const updatedData = demoDiscussions.map((item) =>
          item.DiscussionID === id ? { ...item, userLike: like, likeCount: like === 1 ? item.likeCount + 1 : item.likeCount - 1 } : item
        );
        setDemoDiscussions(updatedData)
        console.log(updatedData)
        console.log(demoDiscussions)
      }
    } catch (error) {
      console.log(error);
    }

  };
  const toggleNav = () => setIsNavOpen(!isNavOpen);
  const handleLike = () => setLikeCount(likeCount + 1);
  const handleComment = (discussion) => {
    if (!checkAuthAndNavigate()) return;

    setCommentCount(prevCount => prevCount + 1);
    openModal(discussion);
  };
  const openModal = (discussion) => {
    setSelectedDiscussion(discussion);
    setModalIsOpen(true);
  };
  const closeModal = () => {
    setModalIsOpen(false);
    setIsFormOpen(false);
  };
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    searchDiscussion(e.target.value); // Dynamic search on every keydown
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      searchDiscussion(searchQuery);
    }
  };

  return (
    <div>
      <header className="flex flex-wrap sm:justify-start sm:flex-nowrap w-full bg-DGXblue text-sm py-4">
        <nav className="max-w-[85rem] w-full mx-auto px-4 flex flex-wrap basis-full items-center justify-between " aria-label="Global">
          <div className="sm:order-4 flex items-center w-full sm:w-auto mt-0 sm:mt-0 sm:ml-4 ">
            {isLoading ? (
              <Skeleton
                height="2.16rem"
                width={250}
                className="w-full sm:w-1/2 bg-gray-500 rounded-lg mb-1"
              />
            ) : (
              <div className="relative w-full sm:w-64 mb-2">
                <input
                  type="text"
                  className="w-full py-2 pl-10 pr-4 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-800 focus:border-DGXgreen focus:ring-DGXgreen"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  data-tooltip-id="search-tooltip"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <FaSearch className="text-gray-400" />
                </div>
                <Tooltip id="search-tooltip" place="top" effect="solid">
                  Press Enter to Search
                </Tooltip>
              </div>
            )}
          </div>

          <div id="navbar-alignment" className={`${isNavOpen ? 'block' : 'hidden'} hs-collapse overflow-hidden transition-all duration-300 basis-full grow sm:grow-0 sm:basis-auto sm:block sm:order-2`}>
          </div>
          {isLoading ? (
            <Skeleton
              height={35}
              width={150}
              className="w-full xs:w-full sm:w-64 bg-lime-500 rounded-lg mb-1 sm:mt-4"
            />
          )
            :
            (
              user ? (
                <button
                  type="button"
                  className="py-2 xs:w-full px-3 gap-x-2 text-sm font-bold rounded-lg bg-DGXgreen text-DGXwhite shadow-sm hover:bg-DGXblue hover:border-DGXgreen border border-DGXblue disabled:opacity-50 disabled:pointer-events-none"
                  onClick={() => { setIsFormOpen(true) }}
                >
                  Start a New Topic +
                </button>
              ) :
                (

                  <a href="/SignInn" className="font-semibold text-DGXwhite bd">
                    <button
                      type="button"
                      className="py-2 xs:w-full px-3 gap-x-2 text-sm font-bold rounded-lg bg-DGXgreen text-DGXwhite shadow-sm hover:bg-DGXblue hover:border-DGXgreen border border-DGXblue disabled:opacity-50 disabled:pointer-events-none"
                    >
                      Start a New Topic +
                    </button>
                  </a>

                )
            )}


        </nav>
      </header>
      {modalIsOpen && selectedDiscussion && (
        <DiscussionModal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          discussion={selectedDiscussion}
          setDiscussions={setDiscussions}
          discussions={discussions}
        />
      )}
      <div className="flex flex-col lg:flex-row w-full mx-auto bg-white rounded-md border border-gray-200 shadow-md mt-4 mb-4 p-4">


        <aside className="hidden lg:block lg:w-1/4 px-4">

          <div className="mb-8">
            <h2 className="sm:text-sm md:text-base lg:text-lg font-bold mb-4">
              <AiOutlineComment className="inline-block mr-2" />Community Highlights
            </h2>

            <div className="space-y-4">
              {isLoading ? (

                Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    height="8.5rem"
                    className="w-full bg-gray-300 rounded-lg mb-4"
                  />
                ))
              ) : (
                communityHighlights.map((topic) => (
                  <div
                    key={topic.DiscussionID}
                    className="rounded-lg shadow-lg p-4 border hover:bg-DGXgreen/50 border-DGXblack transition-transform transform hover:scale-105 hover:shadow-xl"
                    onClick={() => openModal(topic)}
                  >
                    <h3 className="text-xl font-semibold">
                      <a href={topic.link} className="text-DGXblack hover:underline">
                        {topic.Title}
                      </a>
                    </h3>
                    <p
                      className="text-DGXblack mt-2 overflow-hidden"
                      dangerouslySetInnerHTML={{
                        __html: topic.Content.substring(0, 150),
                      }}
                    />

                  </div>
                ))
              )}
            </div>

          </div>

          <div>
            <h2 className="sm:text-sm md:text-base lg:text-lg font-bold mb-4">
              <FaTrophy className="inline-block mr-2" />Top Contributors
            </h2>
            <div className="space-y-2">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    height="2.5rem"
                    className="w-full bg-gray-300 rounded-lg mb-4"
                  />
                ))
              ) : (
                topUsers.map((user, index) => (
                  <div
                    key={user.userID}
                    className="flex justify-between items-center bg-DGXblue border border-gray-200 rounded-lg shadow-sm p-3 hover:shadow-xl hover:scale-105 transition-colors"
                  >
                    <span className="font-medium text-white">{user.userName}</span>
                    <span className="text-white">{user.count} Post(s)</span>
                  </div>
                ))
              )}

            </div>
          </div>
        </aside>


        <section className="w-full lg:w-2/3 px-4">
          {/* All Discussions */}
          <h2 className="sm:text-sm md:text-base lg:text-lg font-bold mb-4">{selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)} Discussions</h2>
          <div className="flex flex-col space-y-4">
            {isFormOpen && <AddDiscussion closeModal={closeModal} demoDiscussions={demoDiscussions} setDemoDiscussions={setDemoDiscussions} />}

            <div className="two-h-screen scrollbar scrollbar-thin  overflow-y-auto px-6">
              {isLoading ? (
                // Display a skeleton for each item based on the length of demoDiscussions
                demoDiscussions.map((_, index) => (
                  <div
                    key={index}
                    className="relative shadow my-4 border border-gray-300 rounded-lg p-4 w-full max-w-screen-sm sm:max-w-screen-md md:max-w-screen-lg lg:max-w-screen-xl xl:max-w-screen-2xl bg-gray-200 animate-pulse"
                  >
                    <div className="h-10 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-24 bg-gray-300 rounded w-full mb-2"></div>
                    <div className="h-40 w-60 bg-gray-300 rounded mb-2"></div>
                    <div className="flex gap-2">
                      {Array.from({ length: 3 }).map((_, tagIndex) => (
                        <span key={tagIndex} className="h-8 w-20 bg-gray-300 rounded" ></span>
                      ))}
                    </div>
                    <div className="mt-4 h-5 bg-gray-300 rounded w-1/2"></div>
                    <div className="mt-4 h-8 bg-gray-300 rounded w-52"></div>
                  </div>
                ))
              ) : (
                demoDiscussions.map((discussion, i) => (
                  <div key={i}
                    className="relative shadow my-4 border border-gray-300 rounded-lg p-4 w-full max-w-screen-sm sm:max-w-screen-md md:max-w-screen-lg lg:max-w-screen-xl xl:max-w-screen-2xl transition-transform transform hover:scale-105 hover:shadow-lg hover:bg-gray-100 cursor-pointer focus-within:z-10 hover:z-10">
                    <div>
                      <h3 className="text-lg font-bold md:text-lg lg:text-xl xl:text-2xl">
                        {discussion.Title}
                      </h3>
                      <p className="text-gray-600 text-sm md:text-base lg:text-lg xl:text-xl xs:overflow-hidden">
                        {discussion.Content.length > 500 ? (
                          <>
                            <span
                              dangerouslySetInnerHTML={{
                                __html: discussion.Content.substring(0, 497),
                              }}
                            />
                            <span
                              className="text-blue-700 cursor-pointer"
                              onClick={() => openModal(discussion)}
                            >
                              ...see more
                            </span>
                          </>
                        ) : (
                          <span
                            dangerouslySetInnerHTML={{
                              __html: discussion.Content,
                            }}
                          />
                        )}

                      </p>
                    </div>
                    {discussion.Image && (
                      <div className="mt-2" onClick={() => openModal(discussion)}>
                        <img src={discussion.Image} alt="Discussion" className="max-h-40 w-auto object-cover" />
                      </div>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2" onClick={() => openModal(discussion)}>
                      {discussion.Tag.split(',').filter(tag => tag).map((tag, tagIndex) => (
                        <span key={tagIndex} className="bg-DGXgreen text-white rounded-full px-3 py-1 text-xs md:text-sm lg:text-base">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2" onClick={() => openModal(discussion)}>
                      {discussion.ResourceUrl.split(',').map((link, linkIndex) => (
                        <a key={linkIndex} href={link} className="text-DGXgreen hover:underline text-xs md:text-sm lg:text-base">
                          {link}
                        </a>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center space-x-4">
                      <button className="flex items-center text-sm md:text-base lg:text-lg" onClick={() => { handleAddLike(discussion.DiscussionID, discussion.userLike) }}>
                        {discussion.userLike == 1 ? <AiFillLike /> : <AiOutlineLike />} {discussion.likeCount} Likes
                      </button>
                      <button
                        className="flex items-center text-DGXgreen text-sm md:text-base lg:text-lg"
                        onClick={() => handleComment(discussion)}
                      >
                        <FaComment className="mr-2" /> {discussion.comment.length} Comments
                      </button>

                    </div>
                  </div>
                ))
              )}

            </div>

          </div>
        </section>
        {isLoading ? (
          <Skeleton
            height="2.5rem"
            className="w-full bg-gray-300 rounded-lg mb-4"
          />
        ) : (
          <div className="lg:hidden mt-8">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-DGXblue text-white py-2 px-4 rounded-lg w-full"
            >
              {isDropdownOpen ? 'Hide' : 'Show'} Community Highlights and Top Contributors
            </button>
            {isDropdownOpen && (
              <aside className="mt-4 px-4">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">Community Highlights</h2>
                  <div className="space-y-4">
                    {communityHighlights.map((topic) => (
                      <div
                        key={topic.DiscussionID}
                        className="rounded-lg shadow-lg p-4 border hover:bg-DGXgreen/50 border-DGXblack transition-transform transform hover:scale-105 hover:shadow-xl"
                        onClick={() => openModal(topic)}
                      >
                        <h3 className="text-xl font-semibold">
                          <a href={topic.link} className="text-DGXblack hover:underline">
                            {topic.Title}
                          </a>
                        </h3>
                        <p
                          className="text-DGXblack mt-2 overflow-hidden"
                          dangerouslySetInnerHTML={{
                            __html: topic.Content.substring(0, 150),
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">Top Contributors</h2>
                  <div className="space-y-2">
                    {topUsers.map((user, index) => (
                      <div
                        key={user.userID}
                        className="flex justify-between items-center bg-DGXblue border border-gray-200 rounded-lg shadow-sm p-3 hover:shadow-xl hover:scale-105 transition-colors"
                      >
                        <span className="font-medium text-white">{user.userName}</span>
                        <span className="text-white">{user.count} Post(s)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Discussion;
