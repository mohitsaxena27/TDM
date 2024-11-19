import React, { useState, useRef, useEffect } from 'react';
import { config } from '../../config';
import { ToastContainer } from 'react-toastify';
import showToast from '../items/ToastMessage/toastUtil'; // Import the utility function
import 'react-toastify/dist/ReactToastify.css';

const CreateTableModal = ({ isOpen, onClose, repoId, onTableCreate }) => {
    const [tableName, setTableName] = useState('');
    const [columns, setColumns] = useState(['']);
    const [error, setError] = useState('');
    const scrollContainerRef = useRef(null); // Ref for the scrollable container

    const handleAddColumn = () => {
        setColumns([...columns, '']);
    };

    const handleColumnChange = (index, value) => {
        const newColumns = [...columns];
        newColumns[index] = value;
        setColumns(newColumns);
    };

    const handleRemoveColumn = (index) => {
        setColumns(columns.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!tableName || columns.some(col => !col)) {
            setError('Table name and all column fields are required.');
            return;
        }

        const createTablePayload = {
            repo_id: repoId,
            table_name: tableName,
            columns: columns.join(",")
        };

        console.log('Creating table with payload:', createTablePayload);

        try {
            const response = await fetch(`${config.TDMIP}/createtable`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(createTablePayload)
            });

            const responseBody = await response.json();

            if(response.status===200 && responseBody.message){
                showToast("Table already exists", 'error');
                console.log(response.message);
            }
        

            else if (responseBody.created &&response.status === 200) {
                showToast("Table Created Successfully", 'success');
                onTableCreate();
                onClose();
            } else {
                showToast("Table Creation Failed", 'error');
            }

        } catch (err) {
            console.error('Error:', err);
            showToast(`Error creating table: ${err.message}`, 'error');
            setError(`Error creating table: ${err.message}`);
        }
    };

    // Scroll to the bottom of the column container when columns are added
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [columns]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center ">
            <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-lg " style={{ width: '40rem' }}>
                <h2 className="text-lg font-semibold mb-4">Create New Table</h2>

                {error && <p className="text-red-500">{error}</p>}

                <div className="mb-4">
                    <label className="block font-semibold mb-1">Table Name</label>
                    <input
                        type="text"
                        value={tableName}
                        onChange={(e) => setTableName(e.target.value)}
                        className="border p-2 w-full rounded"
                    />
                </div>

                <div>
                    <label className="block font-semibold mb-2">Columns</label>
                    {/* Container with fixed height, scrolling, and ref */}
                    <div ref={scrollContainerRef} className="max-h-48 overflow-y-auto">
                        {columns.map((column, index) => (
                            <div key={index} className="flex items-center mb-2">
                                <input
                                    type="text"
                                    placeholder="Column Name"
                                    value={column}
                                    onChange={(e) => handleColumnChange(index, e.target.value)}
                                    className="border p-2 rounded mr-2 w-3/4"
                                />
                                <button
                                    onClick={() => handleRemoveColumn(index)}
                                    className="text-red-500 font-semibold"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={handleAddColumn}
                        className="bg-blue-500 text-white px-3 py-1 rounded mt-2"
                    >
                        + Add Column
                    </button>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                    >
                        Create Table
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-400 text-white px-4 py-2 rounded"
                    >
                        Cancel
                    </button>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default CreateTableModal;
