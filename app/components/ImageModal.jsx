import React, { useState } from 'react';

const ImageModal = ({ isOpen, onClose, images, onUpload, currentTitle }) => {
    const [newImages, setNewImages] = useState([]);

    if (!isOpen) return null;

    const handleImageChange = (event) => {
        const files = Array.from(event.target.files);
        setNewImages((prev) => [...prev, ...files]); // Append new files to existing ones
    };

    const handleUpload = async () => {
        await onUpload(newImages);
        setNewImages([]); // Reset after upload
        onClose(); // Close modal after upload
    };

    const renderImagePreviews = () => {
        return newImages.map((file, index) => {
            const url = URL.createObjectURL(file); // Create a URL for the file
            return (
                <div key={index} className="relative">
                    <img
                        src={url}
                        alt=""
                        className="w-20 h-20 object-cover rounded"
                    />
                    <button
                        className="absolute top-0 right-0 bg-red-600 text-white rounded-full border border-white w-5 h-5 flex items-center justify-center"
                        onClick={() => setNewImages((prev) => prev.filter((_, i) => i !== index))}
                    >
                        &times;
                    </button>
                </div>
            );
        });
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="relative bg-white p-4 rounded shadow-lg max-w-lg w-full">
                <h2 className="text-lg font-bold mb-4">Images for: {currentTitle}</h2> {/* Display product title */}
                <button className="absolute top-2 right-2 text-gray-600" onClick={onClose}>
                    &times;
                </button>
                <div className="grid grid-cols-2 gap-2 mb-4">
                    {images.map((image) => (
                        <img
                            key={image.id}
                            src={image.url}
                            alt=""
                            className="w-full h-auto object-cover"
                        />
                    ))}
                </div>
                <input
                    type="file"
                    multiple
                    onChange={handleImageChange}
                    className="mt-4"
                />
                <div className="mt-2 grid grid-cols-2 gap-2">
                    {renderImagePreviews()} {/* Render previews for new images */}
                </div>
                <button
                    onClick={handleUpload}
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Upload Images
                </button>
            </div>
        </div>
    );
};

export default ImageModal;
