import React, { useState } from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm }) => {
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: '30%', left: '40%' });

    const startDrag = (e) => {
        setIsDragging(true);
        setOffset({
            x: e.clientX - parseInt(modalPosition.left),
            y: e.clientY - parseInt(modalPosition.top),
        });
    };

    const onMouseMove = (e) => {
        if (isDragging) {
            setModalPosition({
                top: `${e.clientY - offset.y}px`,
                left: `${e.clientX - offset.x}px`,
            });
        }
    };

    const stopDrag = () => {
        setIsDragging(false);
    };

    React.useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', stopDrag);
        } else {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', stopDrag);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', stopDrag);
        };
    }, [isDragging]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div
                className="bg-white p-5 rounded-md shadow-lg"
                style={{ position: 'absolute', ...modalPosition }}
                onMouseDown={startDrag}
            >
                <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
                <p>Are you sure you want to delete this repository?</p>
                <div className="mt-4 flex justify-end">
                    <button onClick={onClose} className="mr-2 bg-gray-500 text-white px-4 py-2 rounded">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="bg-red-500 text-white px-4 py-2 rounded">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
