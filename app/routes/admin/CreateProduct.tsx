// CreateProduct.tsx
import { Form } from "@remix-run/react";
import { useState } from "react";

interface CreateProductProps {
    title: string;
    setTitle: (title: string) => void;
    price: number;
    setPrice: (price: number) => void;
    description: string;
    setDescription: (description: string) => void;
    addMessage: string;
    setImages: (images: File[]) => void; // New prop to handle image uploads
}

const CreateProduct: React.FC<CreateProductProps> = ({
    title,
    setTitle,
    price,
    setPrice,
    description,
    setDescription,
    addMessage,
    setImages,
}) => {
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            setImages(Array.from(files)); 
        }
    };

    return (
        <div className="w-1/3 pr-4">
            <h1 className="text-2xl font-bold mb-4">Create Product</h1>
            {addMessage && (
                <div className="mb-4 p-3 text-green-800 bg-green-200 rounded">
                    {addMessage}
                </div>
            )}
            <Form method="post" className="space-y-4" encType="multipart/form-data">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium">Title:</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="mt-1 block w-full p-2 border rounded"
                    />
                </div>
                <div>
                    <label htmlFor="price" className="block text-sm font-medium">Price:</label>
                    <input
                        type="text"
                        id="price"
                        name="price"
                        value={price}
                        onChange={(e) => setPrice(+e.target.value)}
                        required
                        className="mt-1 block w-full p-2 border rounded"
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium">Description:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 block w-full p-2 border rounded"
                    ></textarea>
                </div>
                <div>
                    <label htmlFor="images" className="block text-sm font-medium">Upload Images:</label>
                    <input
                        type="file"
                        id="images"
                        name="images"
                        onChange={handleFileChange}
                        multiple
                        className="mt-1 block w-full p-2 border rounded"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
                >
                    Submit
                </button>
            </Form>
        </div>
    );
};

export default CreateProduct;
