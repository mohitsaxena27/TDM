import React, { useState } from 'react';
import {config} from '../../config';
import { ToastContainer } from 'react-toastify';
import showToast from '../items/ToastMessage/toastUtil'; // Import the utility function
import 'react-toastify/dist/ReactToastify.css';

const CreateTableModal = ({ isOpen, onClose, repoId, onTableCreate }) => {
    const [tableName, setTableName] = useState('');
    const [columns, setColumns] = useState(['']);
    const [error, setError] = useState('');

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
    
            if (response.status === 200) {
                showToast("Table Created Successfully", 'success');
            } else {
                showToast("Table Creation Failed", 'error');
            }
    
            const createdTable = await response.json();
    
            const dataPayload = {
                table_id: createdTable.table_id,
                data: {}
            };
    
            columns.forEach(column => {
                dataPayload.data[column] = '';
            });
    
            console.log('Updating table data with payload:', dataPayload);
    
            // Update the table list after successfully creating the table
            onTableCreate();
            onClose();
        } catch (err) {
            console.error('Error:', err);
            setError(`Error creating table: ${err.message}`);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center">
            <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-lg">
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

                    <button
                        onClick={handleAddColumn}
                        className="bg-blue-500 text-white px-3 py-1 rounded"
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
            <ToastContainer/>
        </div>
    );
};

export default CreateTableModal;
