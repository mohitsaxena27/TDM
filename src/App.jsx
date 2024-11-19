import React, { useState, useEffect } from 'react';
import Repository from './components/Repository';
import Toolbar from './components/Toolbar';
import Spreadsheet from './components/Spreadsheet';

const App = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    // Load initial states from localStorage
    const [selectedRepoId, setSelectedRepoId] = useState(() =>
        localStorage.getItem('selectedRepoId')
    );
    const [selectedTableId, setSelectedTableId] = useState(() =>
        localStorage.getItem('selectedTableId')
    );
    const [selectedTables, setSelectedTables] = useState(() => {
        const savedTables = localStorage.getItem('selectedTables');
        return savedTables ? JSON.parse(savedTables) : [];
    });

    // Trigger to reload Spreadsheet
    const [spreadsheetKey, setSpreadsheetKey] = useState(0);

    // Save `selectedTableId` to localStorage
    useEffect(() => {
        if (selectedTableId) {
            localStorage.setItem('selectedTableId', selectedTableId);
        } else {
            localStorage.removeItem('selectedTableId');
        }
    }, [selectedTableId]);

    // Save `selectedRepoId` to localStorage
    useEffect(() => {
        if (selectedRepoId) {
            localStorage.setItem('selectedRepoId', selectedRepoId);
        } else {
            localStorage.removeItem('selectedRepoId');
        }
    }, [selectedRepoId]);

    // Save `selectedTables` to localStorage
    useEffect(() => {
        localStorage.setItem('selectedTables', JSON.stringify(selectedTables));
    }, [selectedTables]);

    // Handle table selection
    const handleTableSelect = (tableId) => {
        setSelectedTableId(tableId);
    };

    // Handle repository selection
    const handleRepoSelect = (repoId, tables) => {
        setSelectedRepoId(repoId);
        setSelectedTables(tables);
        setSelectedTableId(null); // Reset table selection when switching repos
    };

    // Handle table deletion
    const handleTableDelete = (deletedTableId) => {
        setSelectedTables((prevTables) =>
            prevTables.filter((table) => table.table_id !== deletedTableId)
        );

        // If the deleted table is currently selected, clear it and reload Spreadsheet
        if (selectedTableId === deletedTableId) {
            setSelectedTableId(null);
        }

        // Reload Spreadsheet by updating its key
        setSpreadsheetKey((prevKey) => prevKey + 1);
    };

    return (
        <>
            {/* Header */}
            <div className="bg-gradient-to-l from-blue-900 to-purple-900 shadow-lg">
                <div className="container mx-auto">
                    <div className="flex justify-center items-center py-3 px-4">
                        <h1 className="text-3xl font-semibold text-white">TDM - TEST DATA MANAGEMENT</h1>
                    </div>
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex min-h-full pb-[2.5rem] overflow-hidden bg-blue-100 pt-4">
                {/* Sidebar */}
                <div className={`h-full bg-blue-100 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0'}`}>
                    {isSidebarOpen && (
                        <Repository
                            onRepoSelect={handleRepoSelect}
                            onTableSelect={handleTableSelect}
                            selectedRepoId={selectedRepoId}
                        />
                    )}
                </div>

                {/* Main Content */}
                <div className="flex-1 p-1">
                    {/* Toolbar */}
                    <Toolbar
                        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
                        repoData={selectedTables}
                        selectedRepoId={selectedRepoId}
                        onTableSelect={handleTableSelect}
                        onTableDelete={handleTableDelete}
                    />

                    {/* Spreadsheet or Placeholder */}
                    <div className="p-2 h-auto overflow-auto">
                        {selectedTableId ? (
                            <Spreadsheet key={spreadsheetKey} selectedTableId={selectedTableId} />
                        ) : (
                            <div className="p-6 text-center">
                                <p className="text-lg font-medium text-gray-600 mt-10">
                                    No table selected. Please select a table to view details.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default App;
