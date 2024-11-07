import React, { useState, useEffect } from 'react';
import { CSVLink } from 'react-csv';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCsv, faTrash, faPlus, faSave, faUpload } from '@fortawesome/free-solid-svg-icons';
import {config} from '../../config';
import { ToastContainer } from 'react-toastify';
import showToast from '../items/ToastMessage/toastUtil'; // Import the utility function
import 'react-toastify/dist/ReactToastify.css';
import Uploadfile from '../items/UploadFile/UploadData';

const Spreadsheet = ({ selectedTableId, onRefresh }) => {
    const [data, setData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [contextMenu, setContextMenu] = useState({ visible: false, rowIndex: null, mouseX: 0, mouseY: 0 });
    const [editableCell, setEditableCell] = useState({ row: null, col: null });
    const [newRows, setNewRows] = useState([]);

    const fetchTableData = async () => {
        if (!selectedTableId) return;

        setLoading(true);
        try {
            const response = await fetch(`${config.TDMIP}/api/tabledata/${selectedTableId}`);
            if (!response.ok) throw new Error('Failed to fetch data');

            const jsonData = await response.json();
            const tableData = jsonData.data || [];
            const tableHeader = jsonData.header.properties;

            const formattedHeaders = Object.keys(tableHeader);
            setHeaders(formattedHeaders);
            setData(tableData.map(item => ({ ...item.content, data_id: item.data_id })));
        } catch (error) {
            console.error('Error fetching table data:', error);
            showToast('Failed to fetch data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTableData();
    }, [selectedTableId]);

    const handleCellChange = (rowIndex, colIndex, value) => {
        const updatedData = [...data];
        updatedData[rowIndex][headers[colIndex]] = value;
        setData(updatedData);
    };

    const handleSaveCell = async (rowIndex, colIndex, value) => {
        const row = data[rowIndex];
        const dataId = row.data_id;
        if (dataId) {
            const column = headers[colIndex];
            const payload = { data: { [column]: value } };

            try {
                const response = await axios.put(`http://10.154.0.207:5000/updatedatarecord/${dataId}`, payload);
                if (response.status === 200) 
                    {
                    fetchTableData();
                    showToast("Updated successfully", 'success');
                } else {
                    showToast("Update failed", 'error');
                }
            } catch (error) {
                console.error(`Error updating data for row ${dataId}:`, error);
                showToast("Failed to update cell", 'error');
            }
        }
    };

    const handleDoubleClick = (rowIndex, colIndex) => {
        setEditableCell({ row: rowIndex, col: colIndex });
    };

    const handleBlur = async (rowIndex, colIndex) => {
        const value = data[rowIndex][headers[colIndex]];
        await handleSaveCell(rowIndex, colIndex, value);
        setEditableCell({ row: null, col: null });
    };

    const handleAddRow = () => {
        const newRow = {};
        headers.forEach(header => {
            newRow[header] = '';
        });
        setNewRows([...newRows, newRow]);
    };

    const handleSaveNewRows = async () => {
        if (!selectedTableId) {
            showToast("No table selected", 'error');
            return;
        }

        try {
            const savedRows = [];
            for (const row of newRows) {
                const formattedData = {};
                headers.forEach(header => {
                    formattedData[header] = row[header];
                });

                const payload = {
                    table_id: selectedTableId,
                    data: formattedData,
                };

                const response = await axios.post(`http://10.154.0.207:5000/data`, payload);
                savedRows.push(response.data); // Assuming response.data is the saved row with its new data_id
                fetchTableData();
            }
            setData([...data, ...savedRows]);
            setNewRows([]);
            showToast('All new rows saved successfully', 'success');
        } catch (error) {
            console.error('Error saving new rows:', error);
            showToast('Failed to save new rows. Please try again.', 'error');
        }
    };

    const handleDeleteRow = async (rowIndex) => {
        const rowToDelete = data[rowIndex];
        try {
            const response = await axios.delete(`http://10.154.0.207:5000/data/${rowToDelete.data_id}`);
            if (response.status === 200) {
                const updatedData = data.filter((_, index) => index !== rowIndex);
                setData(updatedData);
                fetchTableData();
                showToast('Row deleted successfully', 'success');
            } else {
                showToast('Failed to delete row. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error deleting row:', error);
            showToast('Failed to delete row. Please try again.', 'error');
        }
        setContextMenu({ visible: false, rowIndex: null });
    };

    const handleRightClick = (e, rowIndex) => {
        e.preventDefault();
        setContextMenu({ visible: true, rowIndex, mouseX: e.clientX, mouseY: e.clientY });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (contextMenu.visible && !event.target.closest('.context-menu')) {
                setContextMenu({ visible: false, rowIndex: null });
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [contextMenu.visible]);

    return (
        <div className="p-4 bg-gray-100 h-[31rem] flex flex-col rounded-lg">
            <ToastContainer /> {/* ToastContainer to display toasts */}
            {loading && <div className="text-center">Loading data...</div>}

            <div className="flex gap-2 mb-4">
                <button onClick={handleAddRow} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200" title='Add Row'>
                    <FontAwesomeIcon icon={faPlus} />
                </button>

                <button onClick={handleSaveNewRows} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200" title='Save'>
                    <FontAwesomeIcon icon={faSave} />
                </button>

                <CSVLink data={data} filename={"TestData.csv"} className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200" title='Download Table'>
                    <FontAwesomeIcon icon={faFileCsv} />
                </CSVLink>
                 {/* Upload button */}
                 <Uploadfile tableId={selectedTableId} fetchTableData={fetchTableData} />
            </div>

            {contextMenu.visible && (
                <div className="context-menu absolute bg-white border border-gray-300 rounded shadow-md" style={{ top: contextMenu.mouseY, left: contextMenu.mouseX }}>
                    <button
                        onClick={() => handleDeleteRow(contextMenu.rowIndex)}
                        className="block text-red-600 hover:bg-gray-100 px-4 py-2 w-full text-left rounded"
                    >
                        Delete Row
                    </button>
                </div>
            )}

            <div className="overflow-hidden flex-grow">
                <div className="max-h-[calc(100vh-250px)] overflow-auto border border-gray-300 rounded-lg shadow-sm">
                    <table className="min-w-full border border-collapse">
                        <thead className="bg-gray-200 top-0">
                            <tr>
                                {headers.map((header, index) => (
                                    <th key={index} className="border-b border-gray-400 text-left px-4 py-2">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, rowIndex) => (
                                <tr key={rowIndex} onContextMenu={(e) => handleRightClick(e, rowIndex)}>
                                    {headers.map((header, colIndex) => (
                                        <td key={colIndex} className="border-b border-gray-400 px-4 py-2">
                                            {editableCell.row === rowIndex && editableCell.col === colIndex ? (
                                                <input
                                                    type="text"
                                                    value={row[header] || ''}
                                                    onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                                    onBlur={() => handleBlur(rowIndex, colIndex)}
                                                    className="border border-gray-400 rounded w-full px-2 py-1 focus:outline-none focus:border-blue-500"
                                                    autoFocus
                                                />
                                            ) : (
                                                <span onDoubleClick={() => handleDoubleClick(rowIndex, colIndex)} title="Double click to edit">
                                                    {row[header] || ''}
                                                </span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {newRows.map((row, rowIndex) => (
                                <tr key={`new-${rowIndex}`}>
                                    {headers.map((header, colIndex) => (
                                        <td key={colIndex} className="border-b border-gray-400 px-4 py-2">
                                            <input
                                                type="text"
                                                value={row[header] || ''}
                                                onChange={(e) => {
                                                    const updatedNewRows = [...newRows];
                                                    updatedNewRows[rowIndex][header] = e.target.value;
                                                    setNewRows(updatedNewRows);
                                                }}
                                                className="border border-gray-400 rounded w-full px-2 py-1 focus:outline-none focus:border-blue-500"
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {data.length === 0 && newRows.length === 0 && (
                                <tr>
                                    <td colSpan={headers.length} className="text-center py-4">No data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Spreadsheet;
