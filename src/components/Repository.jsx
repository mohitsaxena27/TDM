import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderPlus, faFolder, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import {config} from '../../config';
import ConfirmModal from './ConfirmModal';
import { ToastContainer } from 'react-toastify';
import showToast from '../items/ToastMessage/toastUtil'; // Import the utility function
import 'react-toastify/dist/ReactToastify.css';

const Repository = ({ onRepoSelect, onTableSelect, selectedRepoId }) => {
    const [repositories, setRepositories] = useState([]);
    const [newRepoName, setNewRepoName] = useState('');
    const [showInput, setShowInput] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [hoveredRepoId, setHoveredRepoId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [repoToDelete, setRepoToDelete] = useState(null);
    const inputRef = useRef(null);

    useEffect(() => {
        fetchRepositories();
    }, []);

    const fetchRepositories = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${config.TDMIP}/api/repositories`);
            setRepositories(response.data.repositories || []);
            
            if (selectedRepoId) {
                const selectedRepo = response.data.repositories.find(repo => repo.repo_id === selectedRepoId);
                if (selectedRepo) {
                    handleRepoClick(selectedRepo);
                    fetchRepositories();
                }
            }
        } catch (error) {
            console.error('Error fetching repositories:', error);
            setError('Failed to load repositories.');
        } finally {
            setLoading(false);
        }
    };

    const handleRepoClick = (repo) => {
        localStorage.setItem('repo_id', repo.repo_id);
        onRepoSelect(repo.repo_id, repo.tables);
        onTableSelect(null);
    };

    const addRepo = async () => {
        if (!newRepoName.trim()) {
            setError('Repository name cannot be empty.');
            return;
        }

        if (repositories.some(repo => repo.repo_name.toLowerCase() === newRepoName.toLowerCase())) {
            setError('Repository name already exists.');
            return;
        }

        try {
            const response = await axios.post(`${config.TDMIP}/repository`, { name: newRepoName });
            setNewRepoName('');
            setShowInput(false);
            setError('');
            if (response.status === 200) {
                showToast("Repository created", 'success');
            } else {
                showToast("fail to create", 'error');
            }
            fetchRepositories();
        } 
        catch (error) {
            console.error('Error:', error);
            setError('Failed to add repository.');
        }
    };

    const deleteRepo = async (repoId) => {
        try {
            const response = await axios.delete(`${config.TDMIP}/repository/${repoId}`);
            setIsModalOpen(false);
            if (response.status === 200) {
                showToast("Deleted successfully", 'success');
            } else {
                showToast("Deletion failed", 'error');
            }
            fetchRepositories();
        } catch (error) {
            console.error('Error deleting repository:', error);
            setError('Failed to delete repository.');
        }
    };

    const confirmDelete = (repoId) => {
        setRepoToDelete(repoId);
        setIsModalOpen(true);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (inputRef.current && !inputRef.current.contains(event.target)) {
                setShowInput(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (loading) {
        return <div className="text-center text-gray-500">Loading repositories...</div>;
    }

    return (
        <div className="flex justify-center  pt-3 m-2">
            <div className="bg-white text-gray-800 w-64 p-2 rounded-lg shadow-md h-full">
                <h1 className='text-center text-xl font-semibold mb-4 tracking-wide flex justify-between items-center'>
                    Repo Manager
                    <button
                        onClick={() => setShowInput(true)}
                        className="text-blue-500 hover:text-blue-700"
                    >
                        <FontAwesomeIcon icon={faFolderPlus} size="lg" />
                    </button>
                </h1>

                {showInput && (
                    <div className="flex items-center mb-4" ref={inputRef}>
                        <FontAwesomeIcon icon={faFolder} className="text-yellow-500 mr-2" />
                        <input
                            type="text"
                            value={newRepoName}
                            onChange={(e) => setNewRepoName(e.target.value)}
                            placeholder="Enter repo name"
                            className="border border-gray-300 rounded-lg pl-2  focus:outline-none w-full"
                        />
                        <button onClick={addRepo} className="bg-blue-500 text-white rounded-md px-3">
                            Save
                        </button>
                    </div>
                )}

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <ul className="mt-4 space-y-2 overflow-y-auto h-[calc(100vh-200px)]">
                    {repositories.map((repo) => (
                        <li
                            key={repo.repo_id}
                            className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-all duration-200 
                                ${selectedRepoId === repo.repo_id ? 'bg-blue-100 font-semibold' : 'hover:bg-gray-100'}
                            `}
                            onMouseEnter={() => setHoveredRepoId(repo.repo_id)}
                            onMouseLeave={() => setHoveredRepoId(null)}
                            onClick={() => handleRepoClick(repo)}
                        >
                            <div className="flex items-center space-x-2">
                                <FontAwesomeIcon icon={faFolder} className="text-yellow-500" />
                                <span className="truncate">{repo.repo_name}</span>
                            </div>
                            {hoveredRepoId === repo.repo_id && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        confirmDelete(repo.repo_id);
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            <ConfirmModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onConfirm={() => deleteRepo(repoToDelete)} 
            />
        </div>
    );
};

export default Repository;
