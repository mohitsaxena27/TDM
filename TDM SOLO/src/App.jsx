// src/App.jsx

import React, { useState, useEffect } from 'react';
import Repository from './components/Repository';
import Toolbar from './components/Toolbar';
import Spreadsheet from './components/Spreadsheet';
import GetStarted from './page/GetStarted';

const App = () => {
    // Check sessionStorage for 'showWelcomePage' key to persist the state across refreshes
    const [showWelcomePage, setShowWelcomePage] = useState(() => {
        // Check if the user has already clicked "Get Started"
        return sessionStorage.getItem('hasSeenWelcomePage') === null;
    });
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [selectedRepoId, setSelectedRepoId] = useState(() => {
        return sessionStorage.getItem('repo_id') || null;
    });
    const [selectedTables, setSelectedTables] = useState(() => {
        const storedTables = sessionStorage.getItem('selected_tables');
        return storedTables ? JSON.parse(storedTables) : [];
    });
    const [selectedTableId, setSelectedTableId] = useState(() => {
        return sessionStorage.getItem('selected_table_id') || null;
    });
    const [refreshData, setRefreshData] = useState(false); // State to trigger refresh

    // Persist state in sessionStorage
    useEffect(() => {
        if (selectedRepoId) {
            sessionStorage.setItem('repo_id', selectedRepoId);
        }
    }, [selectedRepoId]);

    useEffect(() => {
        sessionStorage.setItem('selected_tables', JSON.stringify(selectedTables));
    }, [selectedTables]);

    useEffect(() => {
        if (selectedTableId) {
            sessionStorage.setItem('selected_table_id', selectedTableId);
        } else {
            sessionStorage.removeItem('selected_table_id');
        }
    }, [selectedTableId]);

    // Handle table selection
    const handleTableSelect = (tableId) => {
        setSelectedTableId(tableId);
    };

    // Handle repository selection
    const handleRepoSelect = (repoId, tables) => {
        setSelectedRepoId(repoId);
        setSelectedTables(tables);
        setSelectedTableId(null); // Reset the selected table ID
    };

    // Trigger data refresh
    const triggerRefresh = () => {
        setRefreshData(prev => !prev); // Toggle refresh state
    };

    // Handle "Get Started" button click
    const handleGetStarted = () => {
        // Set sessionStorage to remember that the user has seen the welcome page
        sessionStorage.setItem('hasSeenWelcomePage', 'true');
        setShowWelcomePage(false); // Hide the Get Started page
    };

    return (
        <>
            {showWelcomePage ? (
                <GetStarted onGetStarted={handleGetStarted} />
            ) : (
                <>
                    <div className="bg-gradient-to-l from-blue-900 to-purple-900 shadow-lg">
                        <div className="container mx-auto">
                            <div className="flex justify-center items-center py-3 px-4">
                                <h1 className="text-3xl font-semibold text-white">TDM - TEST DATA MANAGEMENT</h1>
                            </div>
                        </div>
                    </div>

                    <div className="flex min-h-full pb-[2.5rem] overflow-hidden bg-blue-100 pt-4">
                        <div className={`h-full bg-blue-100 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0'}`}>
                            {isSidebarOpen && (
                                <Repository
                                    onRepoSelect={handleRepoSelect}
                                    onTableSelect={handleTableSelect}
                                    selectedRepoId={selectedRepoId}
                                />
                            )}
                        </div>

                        <div className="flex-1 p-1">
                            {selectedRepoId ? (
                                <>
                                    <Toolbar
                                        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
                                        repoData={selectedTables}
                                        selectedRepoId={selectedRepoId}
                                        onTableSelect={handleTableSelect}
                                    />
                                    <div className="p-2 h-auto overflow-auto">
                                        {selectedTableId && (
                                            <Spreadsheet
                                                selectedTableId={selectedTableId}
                                                refreshData={refreshData} // Pass down refreshData state
                                                onRefresh={triggerRefresh} // Function to trigger refresh
                                            />
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="p-6 text-center">
                                    <p className="text-lg font-medium text-gray-600 mt-10">
                                        No repo selected. Please <span className="text-blue-600 cursor-pointer">select an existing repo</span> or <span className="text-blue-600 cursor-pointer">add a new repo</span> to view details.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default App;
