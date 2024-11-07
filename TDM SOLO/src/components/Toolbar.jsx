import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTable, faPlus, faEllipsisH, faTimes } from '@fortawesome/free-solid-svg-icons';
import CreateTableModal from './CreateTableModal';
import { ToastContainer } from 'react-toastify';
import showToast from '../items/ToastMessage/toastUtil'; // Import the utility function
import 'react-toastify/dist/ReactToastify.css';

const Toolbar = ({ toggleSidebar, repoData, selectedRepoId, onTableSelect }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tables, setTables] = useState(repoData); // State to store table data
    const [deleteTableId, setDeleteTableId] = useState(null);
    const scrollRef = React.useRef(null);

    // Fetch repo_id from local storage
    const repoId = localStorage.getItem('repo_id');
    const repoName = localStorage.getItem('repo_name');

    useEffect(() => {
        setTables(repoData); // Update tables when repoData changes
    }, [repoData]);

    const handleOpenModal = () => {
        if (repoId) setIsModalOpen(true);
        else console.warn('No repository selected.');
    };

    const handleCloseModal = () => setIsModalOpen(false);

    // Fetch the latest repository data after creating a table
    const refreshRepoData = async () => {
        try {
            const response = await fetch('http://10.154.0.207:5000/api/repositories');
            const data = await response.json();
            const updatedRepo = data.repositories.find(repo => repo.repo_id === Number(repoId));
            setTables(updatedRepo ? updatedRepo.tables : []);
        } catch (error) {
            console.error('Failed to refresh repositories:', error);
        }
    };

    const handleTableCreate = () => {
        console.log('Table created successfully');
        setIsModalOpen(false);
        refreshRepoData(); // Call the API to refresh the data
    };

    const confirmDeleteTable = (tableId) => setDeleteTableId(tableId);

    const deleteTable = async () => {
        if (!deleteTableId) return;
        try {
            const response = await fetch(`http://10.154.0.207:5000/table/${deleteTableId}`, { method: 'DELETE' });
            
            if (response.status === 200) {
                showToast("Table Deleted Successfully", 'success');
            } else {
                showToast("Table Deletion Failed", 'error');
            }
        } catch (error) {
            console.error('Error deleting table:', error);
        }
        setDeleteTableId(null); // Close confirmation modal after deleting
    };

    return (
        <div className="bg-gray-100 mt-2 mr-2 ml-2 rounded-md p-2 flex flex-col shadow-md">
            <div className="flex items-center justify-between">
                <button onClick={toggleSidebar} className="text-gray-900 text-sm p-2 focus:outline-none">
                    <FontAwesomeIcon icon={faBars} />
                </button>

                <h1 className='flex underline text-blue-600 font-bold'>
                    {repoName}
                </h1>
                {repoId ? (
                    <button onClick={handleOpenModal} className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-400">
                        <FontAwesomeIcon icon={faPlus} className="text-xs" /> Create Table
                    </button>
                ) : (
                    <button disabled className="bg-gray-300 text-gray-600 text-sm px-3 py-1 rounded cursor-not-allowed">
                        Please select a repository
                    </button>
                )}
            </div>

            <div className="flex items-center justify-between mt-2">
                <button onClick={() => scrollRef.current?.scrollBy({ left: -100, behavior: 'smooth' })} className="px-2">
                    <FontAwesomeIcon icon={faEllipsisH} />
                </button>

                <div
                    ref={scrollRef}
                    style={{
                        display: 'flex',
                        overflowX: 'hidden',
                        whiteSpace: 'nowrap',
                        padding: '4px 0',
                        width: '100%',
                        maxWidth: '1000px',
                        margin: '0 auto'
                    }}
                >
                    {tables && tables.length > 0 ? (
                        tables.map((table) => (
                            <div
                                key={table.table_id}
                                className="relative group"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginRight: '16px',
                                    padding: '4px 12px',
                                    borderRadius: '8px',
                                    backgroundColor: 'hsl(210, 10%, 80%)',
                                    color: 'black',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(210, 10%, 60%)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'hsl(210, 10%, 80%)'}
                                onClick={() => onTableSelect(table.table_id)}
                            >
                                <FontAwesomeIcon icon={faTable} style={{ marginRight: '4px' }} />
                                <span className="text-sm">{table.table_name}</span>

                                {/* Delete Icon */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); confirmDeleteTable(table.table_id); }}
                                    className="absolute -top-1 -right-1 rounded-full w-4 flex items-center justify-center bg-white border border-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    style={{ color: 'red' }}
                                >
                                    <FontAwesomeIcon icon={faTimes} size="sm" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <span className="text-gray-600">No tables available. Select a repository.</span>
                    )}
                </div>

                <button onClick={() => scrollRef.current?.scrollBy({ left: 100, behavior: 'smooth' })} className="px-2">
                    <FontAwesomeIcon icon={faEllipsisH} />
                </button>
            </div>

            {isModalOpen && (
                <CreateTableModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    repoId={repoId} // Use repoId from localStorage
                    onTableCreate={handleTableCreate} // Pass the create handler here
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteTableId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-md p-4 text-center">
                        <p>Are you sure you want to delete this table?</p>
                        <div className="mt-4 flex justify-center">
                            <button onClick={() => setDeleteTableId(null)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2">Cancel</button>
                            <button onClick={deleteTable} className="bg-red-500 text-white px-4 py-2 rounded">Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}
             <ToastContainer/>
        </div>
    );
};

export default Toolbar;
