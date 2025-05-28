// src/context/ApiContext.js
// import { createContext } from 'react';

// const ApiContext = createContext();

// export default ApiContext;

// src/context/ApiContext.js
import { createContext, useState } from 'react';

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);
  
  const fetchData = async (endpoint, method = 'GET', body = {}, headers = {}) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: method !== 'GET' ? JSON.stringify(body) : null
      });
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  return (
    <ApiContext.Provider value={{ 
      userToken, 
      setUserToken, 
      user, 
      setUser, 
      fetchData 
    }}>
      {children}
    </ApiContext.Provider>
  );
};

export default ApiContext;