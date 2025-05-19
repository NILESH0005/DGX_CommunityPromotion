import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { images } from '../../public/index.js';
import { AiOutlineMenu } from "react-icons/ai";
import { IoMdCloseCircleOutline } from "react-icons/io";
import clsx from 'clsx';
import ApiContext from '../context/ApiContext.jsx';
import Cookies from 'js-cookie';
import { 
  faHome, 
  faComments, 
  faCalendar, 
  faBlog, 
  faEnvelope, 
  faBook, 
  faSearch,
  faUser,
  faCog,
  faSignOutAlt,
  faChalkboardTeacher
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaBrain } from 'react-icons/fa';

const Navbar = () => {
    const [isSideMenuOpen, setMenu] = useState(false);
    const { user, userToken, setUserToken, logOut } = useContext(ApiContext);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (userToken && user) {
            
            setIsLoggedIn(true);
        } else {
            console.log("User not found");
            setIsLoggedIn(false);
        }
    }, [user, userToken]);

    const [isDropdownOpen, setDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setDropdownOpen(!isDropdownOpen);
    };

    const handleLogout = () => {
        toggleDropdown();
        Cookies.remove('userToken');
        setUserToken(null);
        navigate('/');
    };

    const navLinks = [
        { label: 'Home', to: "/", icon: faHome },
        { label: 'Discussions', to: '/Discussion', icon: faComments },
        { label: 'Event and Workshop', to: '/EventWorkshopPage', icon: faCalendar },
        { label: 'Blog', to: '/Blog', icon: faBlog },
        { label: 'Quiz', to: '/QuizInterface', icon: FaBrain },
        { label: 'Contact Us', to: '/ContactUs', icon: faEnvelope },
        { label: 'Community Guidelines', to: '/CommunityGuidelines', icon: faBook },
        { label: 'OUR LEARN HUB', to: '/Lms', icon: faChalkboardTeacher }
    ];

    const mobileMenuLinks = [
        { label: 'Home', to: "/", icon: faHome },
        { label: 'Discussions', to: '/Discussion', icon: faComments },
        { label: 'Events', to: '/EventWorkshopPage', icon: faCalendar },
        { label: 'Blog', to: '/Blog', icon: faBlog },
        { label: 'Quiz', to: '/QuizInterface', icon: FaBrain },
        { label: 'Contact', to: '/ContactUs', icon: faEnvelope },
        { label: 'Guidelines', to: '/CommunityGuidelines', icon: faBook },
        { label: 'Learn Hub', to: '/Lms', icon: faChalkboardTeacher }
    ];

    const getProfileImage = () => {
        if (user?.ProfilePicture) {
            // Add timestamp to prevent caching
            const timestamp = new Date().getTime();
            if (user.ProfilePicture.startsWith('data:image') || 
                user.ProfilePicture.startsWith('http') || 
                user.ProfilePicture.startsWith('/')) {
                return `${user.ProfilePicture}?${timestamp}`;
            }
        }
        return `${images.defaultProfile}?${new Date().getTime()}`;
    };

    return (
        <main>
            <nav className='flex flex-wrap justify-between items-center py-2 px-4 md:px-6 lg:px-8 bg-DGXblue/10 shadow-lg'>
                {/* Left section - Logo and mobile menu */}
                <section className='flex items-center'>
                    <AiOutlineMenu 
                        onClick={() => setMenu(true)} 
                        className='text-3xl cursor-pointer md:hidden mr-2 text-DGXblue' 
                    />
                    <Link to="/" className="flex items-center">
                        <img 
                            src={images.nvidiaPP} 
                            className="h-10 md:h-10 lg:h-12 xl:h-14" 
                            alt="NVIDIA Preferred Partner Logo" 
                        />
                    </Link>
                </section>

                {/* Center section - Navigation links */}
                <div className="hidden md:flex items-center justify-center font-bold space-x-2 lg:space-x-4 xl:space-x-6">
                    {navLinks.map((d, i) => (
                        <Link
                            key={i}
                            className={clsx(
                                'text-DGXblue text-sm transition-all duration-300 ease-in-out relative after:content-[""] after:absolute after:left-0 after:-bottom-1 after:h-1 after:w-full after:bg-DGXblue after:scale-x-0 after:transition-transform after:duration-300',
                                'md:text-[13px] lg:text-base xl:text-lg',
                                'px-1 lg:px-2',
                                location.pathname === d.to && 'after:scale-x-100',
                                'hover:text-DGXgreen hover:font-black'
                            )}
                            to={d.to}
                        >
                            {d.label}
                        </Link>
                    ))}
                </div>

                {/* Right section - Login/User profile */}
                <section className='flex items-center justify-center gap-2 md:gap-4 lg:gap-6'>
                    {!isLoggedIn ? (
                        <Link to="/SignInn">
                            <button
                                type="button"
                                className="text-white bg-DGXgreen focus:ring-4 flex items-center justify-center focus:outline-none focus:ring-DGXgreen font-medium rounded-md text-sm md:text-base px-3 py-1 md:px-4 md:py-2 lg:px-6 lg:py-2 hover:bg-DGXblue transition duration-300"
                            >
                                Login
                            </button>
                        </Link>
                    ) : (
                        <div className='relative flex items-center gap-2'>
                            {<h1 className='hidden sm:inline text-sm font-medium'>{user.Name}</h1>}
                            <img
                                src={getProfileImage()}
                                alt="User"
                                className='h-8 w-8 md:h-10 md:w-10 rounded-full border-2 cursor-pointer border-DGXgreen object-cover'
                                onClick={toggleDropdown}
                                onError={(e) => {
                                    e.target.src = `${images.defaultProfile}?${new Date().getTime()}`;
                                }}
                                key={user?.ProfilePicture} // Add key to force re-render when image changes
                            />
                            {isDropdownOpen && (
                                <div className="relative">
                                    <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-DGXblue transform transition-all duration-300 ease-in-out origin-top-right'>
                                        <Link 
                                            to="/UserProfile" 
                                            className='block px-4 py-2 text-gray-800 hover:bg-DGXblue/10 hover:text-DGXgreen transition-all duration-200 ease-in-out transform hover:translate-x-1' 
                                            onClick={toggleDropdown}
                                        >
                                            <FontAwesomeIcon icon={faUser} className="mr-2" />
                                            Profile
                                        </Link>
                                        {(user.isAdmin == '1') && (
                                            <Link 
                                                to="/AdminDashboard" 
                                                className='block px-4 py-2 text-gray-800 hover:bg-DGXblue/10 hover:text-DGXgreen transition-all duration-200 ease-in-out transform hover:translate-x-1' 
                                                onClick={toggleDropdown}
                                            >
                                                <FontAwesomeIcon icon={faCog} className="mr-2" />
                                                Admin
                                            </Link>
                                        )}
                                        <button 
                                            onClick={handleLogout} 
                                            className='block w-full text-left px-4 py-2 text-gray-800 hover:bg-DGXblue/10 hover:text-DGXgreen transition-all duration-200 ease-in-out transform hover:translate-x-1'
                                        >
                                            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                                            Logout
                                        </button>
                                    </div>  
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* Mobile side menu */}
                <div className={clsx(
                    'fixed h-full w-screen lg:hidden bg-black/70 backdrop-blur-sm top-0 right-0 -translate-x-full transition-all z-50',
                    isSideMenuOpen && 'translate-x-0'
                )}>
                    <section className="text-white bg-DGXblue flex flex-col absolute left-0 top-0 h-screen p-6 gap-6 z-50 w-3/4 sm:w-64">
                        <div className='flex justify-between items-center'>
                            <IoMdCloseCircleOutline
                                onClick={() => setMenu(false)}
                                className="text-2xl cursor-pointer hover:text-DGXgreen transition-colors"
                            />
                            {isLoggedIn && (
                                <div className='flex items-center gap-2'>
                                    <span className='text-sm truncate max-w-[100px]'>{user.Name}</span>
                                    <img
                                        src={getProfileImage()}
                                        alt="User"
                                        className='h-8 w-8 rounded-full border-2 border-white object-cover'
                                        onError={(e) => {
                                            e.target.src = `${images.defaultProfile}?${new Date().getTime()}`;
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-1 overflow-y-auto">
                            {mobileMenuLinks.map((d, i) => (
                                <Link
                                    key={i}
                                    className={clsx(
                                        'flex items-center gap-4 py-3 px-2 rounded-md transition duration-200',
                                        location.pathname === d.to ? 'bg-DGXblue/80 text-DGXgreen' : 'hover:bg-DGXblue/80 hover:text-DGXgreen'
                                    )}
                                    to={d.to}
                                    onClick={() => setMenu(false)}
                                >
                                    {typeof d.icon === 'function' ? (
                                        <d.icon className="text-xl" />
                                    ) : (
                                        <FontAwesomeIcon icon={d.icon} className="text-xl" />
                                    )}
                                    <span className="text-sm font-medium">{d.label}</span>
                                </Link>
                            ))}
                        </div>
                        
                        {/* Mobile menu login/logout */}
                        {!isLoggedIn ? (
                            <Link 
                                to="/SignInn" 
                                className='mt-4 bg-DGXgreen text-white px-4 py-3 rounded-md text-center hover:bg-DGXblue transition duration-300 flex items-center justify-center gap-2'
                                onClick={() => setMenu(false)}
                            >
                                <FontAwesomeIcon icon={faUser} />
                                <span>Login</span>
                            </Link>
                        ) : (
                            <div className='mt-auto'>
                                <button 
                                    onClick={handleLogout} 
                                    className='w-full bg-DGXgreen text-white px-4 py-3 rounded-md text-center hover:bg-DGXblue transition duration-300 flex items-center justify-center gap-2'
                                >
                                    <FontAwesomeIcon icon={faSignOutAlt} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </nav>
            <hr className='border-b-4 border-DGXblue' />
        </main>
    );
};

export default Navbar;