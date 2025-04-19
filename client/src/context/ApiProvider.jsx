// src/context/ApiProvider.js
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
  const logOut = () => {
    setUser(null);
    setUserToken(null);
    Cookies.remove("userToken");
    navigate("/login"); // or your login route
  };

  const fetchData = useCallback(async (endpoint, method, body, headers = {}) => {
    try {
      const finalHeaders = {
        ...headers,
        'auth-token': userToken || headers['auth-token'] || '',
        'Content-Type': 'application/json'
      };

      console.log("API call:", { endpoint, method, body, headers: finalHeaders });
      const result = await apiRequest(endpoint, method, body, finalHeaders);
      if (result?.message?.includes('expired') || result?.message?.includes('invalid')) {
        logOut();
        throw new Error('Session expired. Please login again.');
      }
      return result;
    } catch (error) {
      console.error("API error:", error);
      throw error;
    }
  }, [userToken, logOut]);

  const _fetchWithToken = async (endpoint, method, body, token, headers = {}) => {
    return fetchData(endpoint, method, body, {
      ...headers,
      'auth-token': token
    });
  };

  const getUserData = async (token) => {
    try {
      const data = await _fetchWithToken("user/getuser", "POST", {}, token);
      if (!data.success) throw new Error(data.message);
      return data;
    } catch (error) {
      console.error("Failed to fetch user:", error);
      throw error;
    }
  };

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
            logOut(); // Safer way to clean up state
          });
      } catch (e) {
        console.error("Invalid token format:", e);
        logOut();
      }
    }
  }, []);


  const logIn = async (token) => {
    try {
      const userData = await getUserData(token);
      setUser(userData.data);
      setUserToken(token);
      Cookies.set("userToken", JSON.stringify(token), { expires: 7 });
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  return (
    <ApiContext.Provider value={{
      fetchData,
      logIn,
      logOut, // Add logout to context
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