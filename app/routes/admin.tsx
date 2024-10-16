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

    if (title && content) {
        await prisma.product.create({
            data: { title, content, done } as any,
        });
    }

    const deleteIds = formData.getAll("deleteId");
    if (deleteIds.length > 0) {
        await Promise.all(deleteIds.map(id =>
            prisma.product.delete({ where: { id: Number(id) } })
        ));
    }

    return json({ success: true, deletedIds: deleteIds });
};

export default function AdminPage() {
    interface ActionData {
        success?: boolean;
        deletedIds?: string[];
    }
    const actionData = useActionData<ActionData>();
    const products = useLoaderData<{ id: number; title: string; content: string; done: boolean }[]>();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [done, setDone] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [deletedProducts, setDeletedProducts] = useState<number[]>([]);
    const [selectAll, setSelectAll] = useState(false);

    useEffect(() => {
        if (actionData?.success) {
            // Only set success message when adding a product
            if (actionData.deletedIds?.length === 0) {
                setSuccessMessage("Product added successfully!");
            }
            setDeletedProducts(actionData.deletedIds?.map(Number) || []);

            // Reset form fields
            setTitle("");
            setContent("");
            setDone(false);

            const timer = setTimeout(() => {
                setSuccessMessage("");
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [actionData]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectAll(e.target.checked);
    };

    return (
        <div className="flex max-w-6xl mx-auto mt-10 p-5 border rounded shadow">
            <div className="w-1/2 pr-4">
                <h1 className="text-2xl font-bold mb-4">Create Product</h1>
                {successMessage && (
                    <div className="mb-4 p-3 text-green-800 bg-green-200 rounded">
                        {successMessage}
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
                    {deletedProducts.length > 0 && (
                        <div className="mb-4 p-3 text-white bg-red-600 rounded">
                            Deleted Products: {deletedProducts.join(", ")}
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
                                                checked={selectAll}
                                                onChange={(e) => {
                                                    // Allow individual selection logic if needed
                                                }}
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
