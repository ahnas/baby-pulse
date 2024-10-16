import { json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useState, useEffect } from "react";
import prisma from "~/db/prisma";

export const action = async ({ request }: { request: Request }) => {
    const formData = new URLSearchParams(await request.text());
    const title = formData.get("title");
    const content = formData.get("content");
    const done = formData.get("done") === "on";

    await prisma.product.create({
        data: { title, content, done } as any,
    });

    return json({ success: true });
};

export default function AdminPage() {
    interface ActionData {
        success?: boolean;
    }
    const actionData = useActionData<ActionData>();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [done, setDone] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        if (actionData?.success) {
            setSuccessMessage("Product added successfully!");
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

    return (
        <div className="max-w-lg mx-auto mt-10 p-5 border rounded shadow">
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
    );
}
