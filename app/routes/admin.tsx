import { json, LoaderFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import prisma from "~/db/prisma";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
    return [
        { title: "Admin Page" },
        { name: "description", content: "Welcome to Remix!" },
    ];
};

export const loader: LoaderFunction = async () => {
    const products = await prisma.product.findMany();
    return json(products);
};

export const action = async ({ request }: { request: Request }) => {
    const formData = new URLSearchParams(await request.text());
    const title = formData.get("title");
    const content = formData.get("content");
    const done = formData.get("done") === "on";

    let addedProductId: number | undefined;
    if (title && content) {
        const newProduct = await prisma.product.create({
            data: { title, content, done } as any,
        });
        addedProductId = newProduct.id;
    }

    const deleteIds = formData.getAll("deleteId").map(Number);
    if (deleteIds.length > 0) {
        await Promise.all(deleteIds.map(id =>
            prisma.product.delete({ where: { id } })
        ));
    }

    const singleDeleteId = formData.get("singleDeleteId");
    if (singleDeleteId) {
        await prisma.product.delete({ where: { id: Number(singleDeleteId) } });
    }

    return json({
        success: true,
        deletedIds: deleteIds,
        singleDeletedId: singleDeleteId,
        addedProductId
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
    const products = useLoaderData<{ id: number; title: string; content: string; done: boolean }[]>();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [done, setDone] = useState(false);
    const [addMessage, setAddMessage] = useState("");
    const [deleteMessage, setDeleteMessage] = useState("");
    const [deletedProducts, setDeletedProducts] = useState<number[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [selectAll, setSelectAll] = useState(false);

    useEffect(() => {
        if (actionData?.success) {
            // Handle product addition message
            if (actionData.addedProductId) {
                setAddMessage(`Product ${actionData.addedProductId} added successfully!`);
            }

            // Handle deletion messages
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
            setContent("");
            setDone(false);

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

    return (
        <div className="flex max-w-6xl mx-auto mt-10 p-5 border rounded shadow">
            <div className="w-1/2 pr-4">
                <h1 className="text-2xl font-bold mb-4">Create Product</h1>
                {addMessage && (
                    <div className="mb-4 p-3 text-green-800 bg-green-200 rounded">
                        {addMessage}
                    </div>
                )}
                <Form method="post" className="space-y-4">
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
                        <label htmlFor="content" className="block text-sm font-medium">
                            Content:
                        </label>
                        <textarea
                            id="content"
                            name="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="mt-1 block w-full p-2 border rounded"
                        ></textarea>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="done"
                            name="done"
                            checked={done}
                            onChange={(e) => setDone(e.target.checked)}
                            className="mr-2"
                        />
                        <label htmlFor="done" className="text-sm font-medium">
                            Done
                        </label>
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
            <div className="w-1/2 pl-4">
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
                                    <th className="border border-gray-300 p-2">Content</th>
                                    <th className="border border-gray-300 p-2">Status</th>
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
                                        <td className="border border-gray-300 p-2">{product.content}</td>
                                        <td className="border border-gray-300 p-2">
                                            {product.done ? "Done" : "Not Done"}
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
        </div>
    );
}
