import React, { useState, useEffect } from 'react';
import Repository from './components/Repository';
import Toolbar from './components/Toolbar';
import Spreadsheet from './components/Spreadsheet';

const App = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const [selectedRepoId, setSelectedRepoId] = useState(() => {
        return localStorage.getItem('repo_id') || null;
    });
    const [selectedTables, setSelectedTables] = useState(() => {
        const storedTables = localStorage.getItem('selected_tables');
        return storedTables ? JSON.parse(storedTables) : [];
    });
    const [selectedTableId, setSelectedTableId] = useState(() => {
        return localStorage.getItem('selected_table_id') || null;
    });
    const [refreshData, setRefreshData] = useState(false); // State to trigger refresh

    // Persist state in localStorage
    useEffect(() => {
        if (selectedRepoId) {
            localStorage.setItem('repo_id', selectedRepoId);
            
        }
    }, [selectedRepoId]);

    useEffect(() => {
        localStorage.setItem('selected_tables', JSON.stringify(selectedTables));
    }, [selectedTables]);

    useEffect(() => {
        if (selectedTableId) {
            localStorage.setItem('selected_table_id', selectedTableId);
        } else {
            localStorage.removeItem('selected_table_id');
        }
    }, [selectedTableId]);

    const handleTableSelect = (tableId) => {
        setSelectedTableId(tableId);
    };

    const handleRepoSelect = (repoId, tables) => {
        setSelectedRepoId(repoId);
        setSelectedTables(tables);
        setSelectedTableId(null); // Reset the selected table ID
    };

    const triggerRefresh = () => {
        setRefreshData(prev => !prev); // Toggle refresh state
    };

    return (
      <>
       <div class="bg-gradient-to-l from-blue-900 to-purple-900 shadow-lg">
    <div class="container mx-auto">
        <div class="flex justify-center items-center py-3 px-4">
            <h1 class="text-3xl font-semibold text-white">TDM - TEST DATA MANAGEMENT</h1>
        </div>
    </div>
</div>

<div className='flex min-h-full pb-[2.5rem] overflow-hidden bg-blue-100 pt-4'>
    <div className={`h-full bg-blue-100 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0'}`}>
        {isSidebarOpen && (
            <Repository
                onRepoSelect={handleRepoSelect}
                onTableSelect={handleTableSelect}
                selectedRepoId={selectedRepoId}
            />
        )}
    </div>

    <div className='flex-1 p-1'>
        {selectedRepoId ? (
            <>
                <Toolbar
                    toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
                    repoData={selectedTables}
                    selectedRepoId={selectedRepoId}
                    onTableSelect={handleTableSelect}
                />
                <div className='p-2 h-auto overflow-auto'>
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
    );
};

export default App;
