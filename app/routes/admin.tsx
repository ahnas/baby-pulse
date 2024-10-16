import { json, LoaderFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import prisma from "~/db/prisma";
import type { MetaFunction } from "@remix-run/node";
import ImageModal from "~/components/ImageModal";

export const meta: MetaFunction = () => {
    return [
        { title: "Admin Page" },
        { name: "description", content: "Welcome to Remix!" },
    ];
};

export const loader: LoaderFunction = async () => {
    const products = await prisma.product.findMany({
        include: {
            images: true,
        },
    } as any);
    return json(products);
};


export const action = async ({ request }: { request: Request }) => {
    const formData = await request.formData();
    const title = formData.get("title");
    const price = Number(formData.get("price")); // Convert price to a number
    const description = formData.get("description");

    let addedProductId: number | undefined;
    if (title && description) {
        const newProduct = await prisma.product.create({
            data: {
                title,
                description,
                price,
                images: {
                    create: [
                    ],
                },
            },
        } as any);
        addedProductId = newProduct.id;
    }

    const deleteIds = formData.getAll("deleteId").map(Number);
    if (deleteIds.length > 0) {
        await Promise.all(deleteIds.map(async (id) => {
            await (prisma as any).image.deleteMany({ where: { productId: id } });
            await prisma.product.delete({ where: { id } });
        }));
    }

    const singleDeleteId = formData.get("singleDeleteId");
    if (singleDeleteId) {
        await (prisma as any).image.deleteMany({ where: { productId: Number(singleDeleteId) } });
        await prisma.product.delete({ where: { id: Number(singleDeleteId) } });
    }
    return json({
        success: true,
        deletedIds: deleteIds,
        singleDeletedId: singleDeleteId,
        addedProductId,
    });
};

export default function AdminPage() {
    interface ActionData {
        success?: boolean;
        deletedIds?: number[];
        singleDeletedId?: number;
        addedProductId?: number;
    }

    const actionData = useActionData<ActionData>();
    const products = useLoaderData<{
        id: number;
        title: string;
        description: string;
        price: number;
        images: { id: number; url: string }[];
    }[]>();
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState("");
    const [addMessage, setAddMessage] = useState("");
    const [deleteMessage, setDeleteMessage] = useState("");
    const [deletedProducts, setDeletedProducts] = useState<number[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);

    const handleOpenModal = (images: any) => {
        setSelectedImages(images);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedImages([]);
    };

    useEffect(() => {
        if (actionData?.success) {
            if (actionData.addedProductId) {
                setAddMessage(`Product ${actionData.addedProductId} added successfully!`);
            }

            if (actionData.singleDeletedId) {
                setDeleteMessage(`Product ${actionData.singleDeletedId} deleted successfully!`);
                setDeletedProducts((prev) => [...prev, actionData.singleDeletedId ?? 0]);
            }

            if (actionData.deletedIds && actionData.deletedIds.length > 0) {
                setDeleteMessage(`Deleted products: ${actionData.deletedIds.join(", ")}`);
                setDeletedProducts((prev) => [...prev, ...(actionData.deletedIds ?? [])]);
            }

            // Reset form fields
            setTitle("");
            setPrice(0);
            setDescription("");

            const timer = setTimeout(() => {
                setAddMessage("");
                setDeleteMessage("");
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [actionData]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setSelectAll(checked);
        setSelectedIds(checked ? products.map(product => product.id) : []);
    };

    const handleIndividualSelect = (e: React.ChangeEvent<HTMLInputElement>, productId: number) => {
        if (e.target.checked) {
            setSelectedIds(prev => [...prev, productId]);
        } else {
            setSelectedIds(prev => prev.filter(id => id !== productId));
        }

        // Update "Select All" state
        if (selectedIds.length === products.length - 1) {
            setSelectAll(true);
        } else {
            setSelectAll(false);
        }
    };

    console.log(products);

    return (
        <div className="flex max-w-6xl mx-auto mt-10 p-5 border rounded shadow">
            <div className="w-1/3 pr-4">
                <h1 className="text-2xl font-bold mb-4">Create Product</h1>
                {addMessage && (
                    <div className="mb-4 p-3 text-green-800 bg-green-200 rounded">
                        {addMessage}
                    </div>
                )}
                <Form method="post" className="space-y-4" encType="multipart/form-data"> {/* Add encType for file uploads */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium">
                            Title:
                        </label>
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
                        <label htmlFor="price" className="block text-sm font-medium">
                            Price:
                        </label>
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
                        <label htmlFor="description" className="block text-sm font-medium">
                            Description:
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1 block w-full p-2 border rounded"
                        ></textarea>
                    </div>


                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
                    >
                        Submit
                    </button>
                </Form>
            </div>

            {/* Right Side: Product List as a Table */}
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
                                                onChange={(e) => handleIndividualSelect(e, product.id)}
                                                className="cursor-pointer"
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-2">{product.title}</td>
                                        <td className="border border-gray-300 p-2">{product.price}</td>
                                        <td className="border border-gray-300 p-2">{product?.description}</td>
                                        <td className="border border-gray-300 p-2 flex flex-row flex-nowrap justify-between">
                                            <img src={product?.images[0]?.url} alt="" className="w-10 h-10 object-cover" />
                                            {product.images.length > 1 && (
                                                <button
                                                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
                                                    onClick={() => handleOpenModal(product.images)} // Open modal on click
                                                >
                                                    More Photos
                                                </button>
                                            )}
                                        </td>


                                        <ImageModal
                                            isOpen={isModalOpen}
                                            onClose={() => setIsModalOpen(false)}
                                            images={selectedImages}
                                        />


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
        </div>
    );
}
