// App.jsx
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/login";
import ChatApp from "./components/ChatApp";

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
                <Route
                    path="/chat"
                    element={isLoggedIn ? <ChatApp /> : <Navigate to="/" />}
                />
            </Routes>
        </Router>
    );
}
