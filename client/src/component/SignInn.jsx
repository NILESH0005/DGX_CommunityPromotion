import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import images from '../../public/images.js';
import { FaEye } from "react-icons/fa";
import { FaEyeLowVision } from "react-icons/fa6";
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
import ApiContext from '../context/ApiContext.jsx';
import LoadPage from './LoadPage.jsx';
import { validateRequired } from '../utils/formValidation.js';

const SignIn = () => {
  const { fetchData, logIn, userToken  } = useContext(ApiContext);
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [userID, setUserID] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (event) => {
    const { id, value } = event.target;
    if (id === 'username') setUserID(value);
    if (id === 'password') setPassword(value);
  };

  const validateForm = (elements) => {
    const inputAndSelectElements = elements.filter(element =>
      element.tagName === 'INPUT' || element.tagName === 'SELECT'
    );
    inputAndSelectElements.forEach((formElement) => {
      validateRequired(formElement.id);
    });
    return document.querySelector('.is-invalid') === null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formElements = Array.from(event.target.elements);
    const isValid = validateForm(formElements);
    if (!isValid) {
      return;
    }
    const endpoint = "user/login";
    const method = "POST";
    const body = {
      "email": userID,
      "password": password,
    };
    setLoading(true);
    try {
      const data = await fetchData(endpoint, method, body);
      if (!data.success) {
        setLoading(false);
        Swal.fire({
          icon: 'error',
          title: 'Login',
          text: `${data.message}`,
          confirmButtonColor: '#3085d6',
        });
      } else {
        logIn(data.data.authtoken);
        setLoading(false);
        if (data.data.flag === 0) {
          navigate('/ChangePassword');
        } else if (data.data.isAdmin) {
          navigate('/AdminDashboard');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      setLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong. Please try again later.',
        confirmButtonColor: '#3085d6',
      });
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  useEffect(() => {
    // Redirect if already logged in
    if (userToken) {
      navigate('/');
    }
  }, [userToken, navigate]);

  return (
    loading ? <LoadPage /> :
      <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-gray-100">
        <div className="lg:w-3/4 xl:w-4/5 2xl:w- hidden lg:flex justify-start items-center p-4 lg:pl-40">
          <img
            src={images.secure}
            alt="Background"
            className="max-w-full max-h-full object-cover"
          />
        </div>
        <div className="w-full xl:w-6/12 2xl:w-6/12 lg:w-6/12 lg:rounded-l-full h-screen flex justify-center items-center bg-DGXblue">
          <div className="w-full max-w-sm lg:max-w-md p-6 bg-DGXwhite rounded-lg shadow-lg border border-DGXgreen">
            <div className='text-center text-3xl mb-4 text-DGXgreen font-bold'>Sign In</div>
            <div className="flex justify-center items-center mb-4">
              <img src={images.robot} alt="Logo" className="logo-image" />
            </div>
            <h1 className="text-center text-xl mb-4">Welcome to <span className="text-DGXgreen font-bold">DGX Community</span></h1>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="relative">
                <label htmlFor="username" className="block text-DGXgreen font-bold mb-1">Email address</label>
                <input
                  id="username"
                  type="text"
                  className="w-full px-4 py-2 border border-DGXgreen rounded-md focus:outline-none focus:border-DGXgreen"
                  onChange={handleInputChange}
                  value={userID}
                />
                <div id="usernameVerify" className="invalid-feedback"></div>
              </div>
              <div className="relative">
                <label htmlFor="password" className="block text-DGXgreen font-bold mb-1">Password</label>
                <input
                  id="password"
                  type={passwordVisible ? "text" : "password"}
                  className="w-full px-4 py-2 border border-DGXgreen rounded-md focus:outline-none focus:border-DGXgreen"
                  onChange={handleInputChange}
                  value={password}
                />
                <div id="passwordVerify" className="invalid-feedback"></div>
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 pt-6 right-0 flex items-center px-4 text-DGXgreen focus:outline-none"
                >
                  {passwordVisible ? <FaEye /> : <FaEyeLowVision />}
                </button>
              </div>
              <div className="text-right mb-4">
                <Link to="/ForgotPassword" className="text-DGXgreen font-bold">Forgot Password?</Link>
              </div>
              <button type="submit" className="w-full py-2 bg-DGXgreen text-DGXwhite rounded-md text-lg focus:outline-none hover:bg-DGXblue">Sign in</button>
            </form>
            <div className="text-center mt-4 py-4">
              Signing in for the first time? <Link to="/VerifyEmail" className="text-DGXgreen font-semibold">Verify here</Link>
            </div>
          </div>
        </div>
      </div>
  );
};

export default SignIn;