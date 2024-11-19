// src/components/GetStarted.jsx

import React from 'react';
 
const GetStarted = ({ onGetStarted }) => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-600 to-purple-800 text-white">
            <div className="text-center p-10 max-w-2xl border border-white/20 rounded-xl bg-white/10 backdrop-blur-md shadow-lg relative">
                
                {/* Animated pulsing glow */}
                <div className="absolute inset-0 rounded-xl border border-white/30 animate-pulse opacity-50 z-0"></div>
                
                <h1 className="text-5xl font-extrabold py-10 tracking-wide text-transparent bg-clip-text bg-gradient-to-br from-blue-200 to-white z-10">
                    Welcome to Test Data Management
                </h1>
                
                <p className="text-lg mb-8 text-gray-200 z-10">
                    Simplify and streamline your data management process with our tools. Manage your repositories, 
                    tables, and spreadsheets all in one place for a seamless, modern workflow experience.
                </p>
                
                {/* Button above the background blur */}
                <button
                    onClick={onGetStarted}
                    className="relative px-8 py-3 text-blue-600 font-semibold bg-white rounded-full shadow-lg hover:bg-blue-100 hover:scale-105 transition-transform duration-300 ease-in-out z-20"
                >
                    Get Started
                </button>
                
                {/* Inner glow effect */}
                <div className="absolute inset-0 rounded-xl border border-white/20 opacity-20 blur-sm z-0"></div>
            </div>
        </div>
    );
};

export default GetStarted;
