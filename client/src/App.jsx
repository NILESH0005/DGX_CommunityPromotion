// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./container/Home.jsx";
import Navbar from "./component/Navbar.jsx";
import Footer from "./component/Footer.jsx";

function App() {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow ">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </>
  );
}

export default App;