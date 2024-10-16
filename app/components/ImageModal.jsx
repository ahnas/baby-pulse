import React from 'react';

const ImageModal = ({ isOpen, onClose, images }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="relative bg-white p-4 rounded shadow-lg max-w-lg w-full">

                <h2 className="text-lg font-bold mb-4">Product Images</h2>
                <button className="absolute top-2 right-2 text-gray-600" onClick={onClose}>
                    &times;
                </button>
                <div className="grid grid-cols-2 gap-2">
                    {images.map((image) => (
                        <img
                            key={image.id}
                            src={image.url}
                            alt=""
                            className="w-full h-auto object-cover"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ImageModal;
