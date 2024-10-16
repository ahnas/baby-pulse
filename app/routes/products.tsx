import { json, LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import prisma from "~/db/prisma";
import type { MetaFunction } from "@remix-run/node";
import Navbar from "~/components/Navbar";

export const meta: MetaFunction = () => {
  return [
    { title: "Product" },
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


export default function ProductsPage() {
  const products = useLoaderData<{
    id: number;
    title: string;
    description: string;
    price: number;
    images: { id: number; url: string }[];
  }[]>();


  return (
    <><Navbar /><div className="p-5 bg-gray-100 text-center">
      <h1 className="text-2xl font-bold mb-6">Product List</h1>

      <div className="flex flex-wrap justify-center">
        {products.map((product) => (
          console.log(product),
          <div key={product.id} className="bg-white w-64 m-5 py-5 transition-shadow hover:shadow-lg border">




            {/* {product?.images?.map((image) => (
              <img
                key={image.id}
                src={image.url}
                alt={image.url}
                className="w-full transition scale-[95%] hover:scale-100 delay-300"
              />
            ))} */}

              <img src={product.images[0].url} alt="" />


            <h2 className="pt-4">{product.title}</h2>
            <h2 className="pt-4">{product.price}</h2>
            <p className="mt-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md transition-all hover:shadow-md scale-[95%] hover:scale-100">
                Add to Cart
              </button>
            </p>
          </div>
        ))}
      </div>
    </div></>

  );
}
