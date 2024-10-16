import { json, LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import prisma from "~/db/prisma";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Product" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader: LoaderFunction = async () => {
  const products = await prisma.product.findMany();
  return json(products);
};

export default function ProductsPage() {
  const products = useLoaderData<{ id: number; title: string; content: string; done: boolean }[]>();


  return (
    <div className="max-w-4xl mx-auto mt-10 p-5">
      <h1 className="text-2xl font-bold mb-4">Product List</h1>
      <Link to="/admin" className="text-blue-500 mb-4 inline-block">
        Add New Product
      </Link>
      <ul className="space-y-4">
        {products.map((product) => (
          <li key={product.id} className="p-4 border rounded shadow">
            <h2 className="text-lg font-bold">{product.title}</h2>
            <p>{product.content}</p>
            <p className="text-sm text-gray-600">
              {product.done ? "Status: Done" : "Status: Not Done"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
