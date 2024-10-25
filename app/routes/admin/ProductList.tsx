// ProductList.tsx
import { Form } from "@remix-run/react";
import ImageModal from "~/components/ImageModal";

export interface ProductListProps {
    products: {
        id: number;
        title: string;
        description: string;
        price: number;
        images: { id: number; url: string }[];
    }[];
    deleteMessage: string;
    selectedIds: number[];
    setSelectedIds: (ids: any) => void;
    handleSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
    selectAll: boolean;
    handleOpenModal: (images: any, title: string) => void;
    closeModal: () => void;
    isModalOpen: boolean;
    selectedImages: any[];
    onUpload: (images: File[]) => Promise<void>;
    currentTitle: string;
}


const ProductList: React.FC<ProductListProps> = ({
    products,
    deleteMessage,
    selectedIds,
    setSelectedIds,
    handleSelectAll,
    selectAll,
    handleOpenModal,
    closeModal,
    isModalOpen,
    selectedImages,
    onUpload,
    currentTitle,
}) => (
    <div className="w-2/3 pl-4">
        <h2 className="text-xl font-bold mt-6">Product List</h2>
        <div className="mt-4 h-64 overflow-y-auto">
            {deleteMessage && (
                <div className="mb-4 p-3 text-white bg-red-600 rounded">
                    {deleteMessage}
                </div>
            )}
            <Form method="post" className="mt-4">
                <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 p-2">
                                <input
                                    type="checkbox"
                                    checked={selectAll}
                                    onChange={handleSelectAll}
                                    className="cursor-pointer"
                                />
                            </th>
                            <th className="border border-gray-300 p-2">Title</th>
                            <th className="border border-gray-300 p-2">Price</th>
                            <th className="border border-gray-300 p-2">Description</th>
                            <th className="border border-gray-300 p-2">Images</th>
                            <th className="border border-gray-300 p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-100">
                                <td className="border border-gray-300 p-2">
                                    <input
                                        type="checkbox"
                                        name="deleteId"
                                        value={product.id}
                                        checked={selectedIds.includes(product.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedIds((prevIds: any) => [...prevIds, product.id]);
                                            } else {
                                                setSelectedIds((prev: number[]) => prev.filter((id) => id !== product.id));
                                            }
                                        }}
                                        className="cursor-pointer"
                                    />
                                </td>
                                <td className="border border-gray-300 p-2">{product.title}</td>
                                <td className="border border-gray-300 p-2">{product.price}</td>
                                <td className="border border-gray-300 p-2">{product.description}</td>
                                <td className="border border-gray-300 p-2 flex flex-row flex-nowrap justify-between">
                                    <img src={product.images[0]?.url} alt="" className="w-10 h-10 object-cover" />
                                    {product.images.length > 1 && (
                                        <button
                                            className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
                                            onClick={() => handleOpenModal(product.images, product.title)}
                                        >
                                            More Photos
                                        </button>
                                    )}

                                    <button onClick={() => handleOpenModal(product.images, product.title)} className="bg-blue-600 text-white px-1 py-1 rounded-md transition-all hover:shadow-md">
                                        Add
                                    </button>
                                    <ImageModal
                                        isOpen={isModalOpen}
                                        onClose={closeModal}
                                        onUpload={onUpload}
                                        images={selectedImages}
                                        currentTitle={currentTitle}
                                    />
                                </td>
                                <td className="border border-gray-300 p-2">
                                    <button
                                        type="submit"
                                        name="singleDeleteId"
                                        value={product.id}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button
                    type="submit"
                    className="mt-4 w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
                >
                    Delete Selected
                </button>
            </Form>

        </div>
    </div>
);

export default ProductList;
