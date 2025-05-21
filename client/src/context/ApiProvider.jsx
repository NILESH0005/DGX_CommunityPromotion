import ApiContext from "./ApiContext.jsx";
import apiRequest from "../api/api.jsx";
import PropTypes from "prop-types";
import { useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const ApiProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const navigate = useNavigate();

  // Enhanced fetchData function
  const fetchData = useCallback(async (endpoint, method = 'GET', body = null, headers = {}) => {
    try {
      const finalHeaders = {
        'Content-Type': 'application/json',
        ...headers,
        'auth-token': userToken || headers['auth-token'] || ''
      };

      const result = await apiRequest(
        endpoint,
        method,
        method !== 'GET' ? body : null,
        finalHeaders
      );

      // Handle token expiration
      if (result?.message?.includes('expired') || result?.message?.includes('invalid')) {
        logOut();
        throw new Error('Session expired. Please login again.');
      }

      return result;
    } catch (error) {
      console.error("API error:", error);
      throw error;
    }
  }, [userToken]);

  // Specialized upload function for file uploads
  const uploadFile = useCallback(async (endpoint, formData, token = userToken) => {
    try {
      const response = await fetch(`http://localhost:8000/${endpoint}`, {
        method: 'POST',
        body: formData,
        headers: {
          'auth-token': token
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      return data;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }, [userToken]);

  // Authentication functions
  const logOut = useCallback(() => {
    setUser(null);
    setUserToken(null);
    Cookies.remove("userToken");
    navigate("/login");
  }, [navigate]);

  const getUserData = useCallback(async (token) => {
    try {
      const data = await fetchData("user/getuser", "POST", {}, {
        'auth-token': token
      });
      
      if (!data.success) throw new Error(data.message);
      return data;
    } catch (error) {
      console.error("Failed to fetch user:", error);
      throw error;
    }
  }, [fetchData]);

  const logIn = useCallback(async (token) => {
    try {
      const userData = await getUserData(token);
      setUser(userData.data);
      setUserToken(token);
      Cookies.set("userToken", token, {
        expires: 7,
        secure: true,
        sameSite: 'strict'
      });
      return userData;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }, [getUserData]);

  // Initialize user from token
  useEffect(() => {
    const token = Cookies.get("userToken");
    if (token) {
      try {
        const parsedToken = JSON.parse(token);
        setUserToken(parsedToken);
        getUserData(parsedToken)
          .then(data => setUser(data.data))
          .catch(error => {
            console.error("Token invalid or expired:", error.message);
            if (error.message.includes('expired') || error.message.includes('invalid')) {
              logOut();
            }
          });
      } catch (e) {
        console.error("Token handling error:", e);
      }
    }
  }, [getUserData, logOut]);

  return (
    <ApiContext.Provider value={{
      fetchData,
      uploadFile,
      logIn,
      logOut,
      user,
      userToken,
      setUserToken
    }}>
      {children}
    </ApiContext.Provider>
  );
};

export default ApiProvider;

ApiProvider.propTypes = {
  children: PropTypes.node.isRequired,
};