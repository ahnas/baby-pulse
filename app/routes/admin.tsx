// admin.tsx
import { json, LoaderFunction } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import prisma from "~/db/prisma";
import ImageModal from "~/components/ImageModal";
import type { MetaFunction } from "@remix-run/node";
import CreateProduct from "./admin/CreateProduct";
import ProductList from "./admin/ProductList";
import { put } from "@vercel/blob";


export const meta: MetaFunction = () => ([
    {
        title: "Admin Page",
        description: "Welcome to Remix!",
    },
]);

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
    const price = Number(formData.get("price"));
    const description = formData.get("description");


    const images = Array.from(formData.getAll("images")) as File[];
    const imageUrls = [];
    for (const image of images) {
        if (image instanceof File) {
            const blobPath = `products/${image.name}`;
            const response = await put(blobPath, image, { access: 'public' });
            imageUrls.push({ url: response.url });
        }
    }

    let addedProductId: number | undefined;
    if (title && description) {
        const newProduct = await prisma.product.create({
            data: {
                title,
                description,
                price,
                images: {
                    create: imageUrls,
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
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [images, setImages] = useState<File[]>([]);

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
            }
            if (actionData.deletedIds && actionData.deletedIds.length > 0) {
                setDeleteMessage(`Deleted products: ${actionData.deletedIds.join(", ")}`);
            }

            setTitle("");
            setPrice(0);
            setDescription("");
            setImages([]);

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
        setSelectedIds(checked ? (products as any).map((product: any) => product.id) : []);
    };

    return (
        <div className="flex max-w-6xl mx-auto mt-10 p-5 border rounded shadow">
            <CreateProduct
                title={title}
                setTitle={setTitle}
                price={price}
                setPrice={setPrice}
                description={description}
                setDescription={setDescription}
                addMessage={addMessage}
                setImages={setImages}
            />
            <ProductList
                products={products}
                deleteMessage={deleteMessage}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
                handleSelectAll={handleSelectAll}
                selectAll={selectAll}
                handleOpenModal={handleOpenModal}
                closeModal={closeModal}
                isModalOpen={isModalOpen}
                selectedImages={selectedImages}
            />
        </div>
    );
}
