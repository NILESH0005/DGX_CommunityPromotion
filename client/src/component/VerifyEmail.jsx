import React, { useState, useEffect, useContext } from "react";
import { images } from "../../public/index.js";
import { IoRefreshCircleSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import generateCaptcha from '../utils/generateCaptcha.js';
import ApiContext from '../context/ApiContext.jsx';
import LoadPage from "./LoadPage.jsx";
import Swal from 'sweetalert2';

const VerifyEmail = () => {
  const { fetchData } = useContext(ApiContext);
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState('');
  const [userCaptcha, setUserCaptcha] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const refreshCaptcha = async () => {
    const newCaptcha = await generateCaptcha(6);
    setCaptcha(newCaptcha);
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const handleChangeEmail = (e) => {
    setEmail(e.target.value);
  };

  function isValidEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userCaptcha !== captcha) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Captcha',
        text: 'Please enter the correct captcha.',
        confirmButtonText: 'OK',
      });
      return;
    }

    if (!isValidEmail(email)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Email',
        text: 'Please enter a valid email address.',
        confirmButtonText: 'OK',
      });
      return;
    }

    const endpoint = "user/verify";
    const method = "POST";
    const headers = { "Content-Type": "application/json" };
    const body = { email: email };
    console.log("bosy is ", body);
    // setLoading(true);

    try {
      const data = await fetchData(endpoint, method, body, headers);
      if (!data.success) {
        refreshCaptcha();
        setLoading(false);
        Swal.fire({
          icon: 'error',
          title: 'Invalid Email Address',
          text: 'The provided email address is not registered in our database. Please check and try again.',
          confirmButtonText: 'OK',
        });
        
      } else if (data.success) {
        refreshCaptcha();
        setLoading(false);
        Swal.fire({
          icon: 'success',
          title: 'Email Sent Successfully',
          text: 'Please check your email for further instructions.',
          confirmButtonText: 'OK',
        }).then(() => {
          navigate('/SignInn');
        });
      }
    } catch (error) {
      refreshCaptcha();
      setLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'Something Went Wrong',
        text: 'Please try again.',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    loading ? < LoadPage /> : (
      <div>
        <section className="h-screen">
          <div className="h-full">
            <div className="flex h-full flex-wrap md:w-250 items-center justify-center lg:justify-between">
              <div className="shrink-1 hidden lg:block ml:10 mb-12 grow-0 basis-auto md:mb-0 md:w-5/12 sm:w-6/12 md:shrink-0 lg:w-4/12 xl:w-4/12">
                <img
                  src={images.verifyImg}
                  className="w-full"
                  alt="Sample image"
                />
              </div>
              <div className="w-full lg:w-6/12 lg:rounded-l-full h-screen flex justify-center items-center bg-DGXblue">
                <div className="mb-12 md:mb-0 w-full md:w-8/12 lg:w-5/12 xl:w-5/12 border border-DGXgreen rounded-lg bg-DGXwhite">
                  <form className="mb-12 w:50 pr-5 pl-5" onSubmit={handleSubmit}>
                    <div className="flex flex-row items-center justify-center xl:justify-start mt-5 align-item-center">
                      <p className="mb-5 me-4 text-xl md:font-bold">
                        Verify Email
                      </p>
                    </div>

                    <div className="relative mb-4">
                      <label htmlFor="email" className="block text-neutral-600 mb-1">Email address</label>
                      <input
                        type="email"
                        className="peer block w-full rounded border border-DGXgreen bg-transparent px-3 py-2 leading-5 outline-none transition-all duration-200 ease-linear focus:placeholder-opacity-100"
                        id="email"
                        value={email}
                        onChange={handleChangeEmail}
                        required
                      />
                    </div>

                    <div className="relative mb-4">
                      <label htmlFor="userCaptcha" className="block text-neutral-600 mb-1">Enter Captcha</label>

                      <input
                        type="text"
                        className="block w-full rounded border border-DGXgreen bg-transparent px-3 py-2 leading-5 outline-none transition-all duration-200 ease-linear"
                        id="userCaptcha"
                        value={userCaptcha}
                        onChange={(e) => setUserCaptcha(e.target.value)}
                        required
                      />
                    </div>

                    <div className="relative mb-4 flex justify-center items-center">
                      <div
                        className="block w-full rounded border border-DGXgreen bg-transparent px-3 py-2 leading-5 outline-none transition-all duration-200 ease-linear select-none font-extrabold tracking-widest"
                        id="captchaDisplay"
                      >
                        {captcha}
                      </div>
                      <button
                        type="button"
                        className="text-white hover:text-DGXgreen hover:border-DGXgreen border-DGXblue border-2 bg-DGXgreen ml-3 rounded-md hover:bg-white "
                        onClick={refreshCaptcha}
                      >
                        <IoRefreshCircleSharp className="text-4xl" />
                      </button>
                    </div>

                    <div className="text-center lg:text-left">
                      <button
                        type="submit"
                        className="mt-5 inline-block w-full rounded bg-DGXgreen px-7 pb-2 pt-3 text-sm font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 hover:bg-DGXblue "
                      >
                        Verify
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  );
};

export default VerifyEmail;