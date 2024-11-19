import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTable, faPlus, faEllipsisH, faTimes } from '@fortawesome/free-solid-svg-icons';
import CreateTableModal from './CreateTableModal';
import { ToastContainer } from 'react-toastify';
import showToast from '../items/ToastMessage/toastUtil';
import 'react-toastify/dist/ReactToastify.css';
import { config } from '../../config';

const Toolbar = ({
    toggleSidebar,
    repoData,
    selectedRepoId,
    onTableSelect,
    onTableDelete
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tables, setTables] = useState(repoData || []); // Initialize with repoData
    const [deleteTableId, setDeleteTableId] = useState(null);
    const [selectedTableId, setSelectedTableId] = useState(null); // State for selected table
    const scrollRef = useRef(null);

    // Update tables whenever repoData changes
    useEffect(() => {
        if (repoData) {
            setTables(repoData);
        }
    }, [repoData]);

    const handleOpenModal = () => {
        if (selectedRepoId) setIsModalOpen(true);
        else console.warn('No repository selected.');
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleTableCreate = () => {
        console.log('Table created successfully');
        setIsModalOpen(false);
        refreshTables(); // Refresh the table list after creating a table
    };

    const refreshTables = async () => {
        try {
            const response = await fetch(`${config.TDMIP}/api/repositories`);
            const data = await response.json();
            const updatedRepo = data.repositories.find(
                (repo) => repo.repo_id === Number(selectedRepoId)
            );
            setTables(updatedRepo ? updatedRepo.tables : []);
            showToast("Table list updated successfully", 'success');
        } catch (error) {
            console.error('Failed to refresh tables:', error);
        }
    };

    const confirmDeleteTable = (tableId) => setDeleteTableId(tableId);

    const deleteTable = async () => {
        if (!deleteTableId) return;

        try {
            const response = await fetch(`${config.TDMIP}/table/${deleteTableId}`, {
                method: 'DELETE'
            });
            if (response.status === 200) {
                showToast("Table Deleted Successfully", 'success');
                onTableDelete(deleteTableId); // Notify parent about table deletion
                setTables((prevTables) =>
                    prevTables.filter((table) => table.table_id !== deleteTableId)
                ); // Remove table from the local state
                if (deleteTableId === selectedTableId) {
                    setSelectedTableId(null); // Reset selection if the deleted table was selected
                }
            } else {
                showToast("Table Deletion Failed", 'error');
            }
        } catch (error) {
            console.error('Error deleting table:', error);
        }

        setDeleteTableId(null); // Close confirmation modal
    };

    const handleTableSelect = (tableId) => {
        setSelectedTableId(tableId);
        onTableSelect(tableId); // Notify parent about table selection
    };

    return (
        <div className="bg-gray-100 mt-2 mr-2 ml-2 rounded-md p-2 flex flex-col">
            <div className="flex items-center justify-between">
                <button onClick={toggleSidebar} className="text-gray-900 text-sm p-2 focus:outline-none">
                    <FontAwesomeIcon icon={faBars} />
                </button>

                {selectedRepoId ? (
                    <button
                        onClick={handleOpenModal}
                        className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-400"
                    >
                        <FontAwesomeIcon icon={faPlus} className="text-xs" /> Create Table
                    </button>
                ) : (
                    <button
                        disabled
                        className="bg-gray-300 text-gray-600 text-sm px-3 py-1 rounded cursor-not-allowed"
                    >
                        Please select a repository
                    </button>
                )}
            </div>

            <div className="flex items-center justify-between mt-2">
                <button
                    onClick={() => scrollRef.current?.scrollBy({ left: -100, behavior: 'smooth' })}
                    className="px-2"
                >
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
                                className={`relative group ${
                                    selectedTableId === table.table_id ? 'border border-red-500 ' : ''
                                }`}
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
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.backgroundColor = 'hsl(210, 10%, 60%)')
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.backgroundColor = 'hsl(210, 10%, 80%)')
                                }
                                onClick={() => handleTableSelect(table.table_id)}
                            >
                                <FontAwesomeIcon icon={faTable} style={{ marginRight: '4px' }} />
                                <span className="text-sm">{table.table_name}</span>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        confirmDeleteTable(table.table_id);
                                    }}
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

                <button
                    onClick={() => scrollRef.current?.scrollBy({ left: 100, behavior: 'smooth' })}
                    className="px-2"
                >
                    <FontAwesomeIcon icon={faEllipsisH} />
                </button>
            </div>

            {isModalOpen && (
                <CreateTableModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    repoId={selectedRepoId}
                    onTableCreate={handleTableCreate}
                />
            )}

            {deleteTableId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-md p-4 text-center">
                        <p>Are you sure you want to delete this table?</p>
                        <div className="mt-4 flex justify-center">
                            <button
                                onClick={() => setDeleteTableId(null)}
                                className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={deleteTable}
                                className="bg-red-500 text-white px-4 py-2 rounded"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer />
        </div>
    );
};

export default Toolbar;
