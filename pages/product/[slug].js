import ProductDetailCarousel from '@/components/ProductDetailCarousel';
import RelatedProducts from '@/components/RelatedProducts';
import Wrapper from '@/components/Wrapper';
import { addToCart } from '@/store/cartSlice';
import { fetchDataFromApi } from '@/utils/api';
import { getDiscountedPricePercentage } from '@/utils/helper';
import React, { useState } from 'react';
import { IoMdHeartEmpty } from 'react-icons/io';
import ReactMarkdown from 'react-markdown';
import { useSelector, useDispatch } from 'react-redux';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductDetails = ({ product, products, setWishlishState, wishlishState }) => {
    const [selectedSize, setSelectedSize] = useState();
    const [showError, setShowError] = useState(true);
    const dispatch = useDispatch();
    const p = product?.data?.[0]?.attributes;

    const notify = (msg) => {
        toast.success(msg, {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
        });
    };

    function addToWishList() {
        notify("Added to Wishlist!")
    }

    return (
        <div className="w-full md:py-20">
            <ToastContainer />
            <Wrapper>
                <div className="flex flex-col lg:flex-row md:px-10 gap-[50px] lg:gap-[100px]">
                    {/*left column start*/}
                    <div className="w-full md:w-auto flex-[1.5] max-w-[500px] lg:max-w-full mx-auto lg:mx-0">
                        <ProductDetailCarousel images={p.image?.data} />
                    </div>
                    {/*left column end*/}

                    {/*right column* start*/}
                    <div className="flex-[1] py-3">
                        {/*PRoduct title */}
                        <div className="text-[34px] font-semibold leading-tight">
                            {p.name}
                        </div>

                        {/* Products Subtitle */}
                        <div className="text-lg font-semibold">
                            {p.subtitle}
                        </div>

                        {/* PRoducts PRize */}
                        <div className="flex items-center">
                            <p className="mr-2 text-lg font-semibbold">
                                MRP : &#8377;{p.price}
                            </p>
                            {p.original_price && (
                                <>
                                    <p className="text-base font-medium line-through">
                                        &#8377;{p.original_price}
                                    </p>
                                    <p className="ml-auto text-base font-medium text-green-500">
                                        {getDiscountedPricePercentage(
                                            p.original_price,
                                            p.price
                                        )}
                                        % off
                                    </p>
                                </>
                            )}
                        </div>
                        <div className="text-md font-medium text-black/[0.5]">
                            incl. of taxes
                        </div>
                        <div className="text-md font-medium text-black/[0.5] mb-20">
                            {`(Also includes all applicable duties)`}
                        </div>

                        {/* Product Size range start */}
                        <div className="mb-10">
                            {/* Heading START */}
                            <div className="flex justify-between mb-2">
                                <div className="text-md font-semibold">
                                    Select Size
                                </div>
                                <div className="text-md font-medium text-black/[0.5] cursor-pointer">
                                    Select Guide
                                </div>
                            </div>
                            {/* Heading END */}

                            {/* SIZE START */}
                            <div id="sizeGrid" className="grid grid-cols-3 gap-2">
                                {p.size.data.map((item, i) => (
                                    <div
                                        key={i}
                                        className={`border rounded-md text-center py-3 font-medium ${
                                            item.enabled
                                                ? "hover:border-black cursor-pointer"
                                                : "cursor-not-allowed bg-black/[0.1] opacity-50"
                                        } ${
                                            selectedSize === item.size
                                                ? "border-black"
                                                : ""
                                        }`}
                                        onClick={() => {
                                            setSelectedSize(item.size);
                                            setShowError(false);
                                        }}
                                    >
                                        {item.size}
                                    </div>
                                ))}
                            </div>
                            {/* SIZE END */}
                            {/* SIZE ERROR STARTS */}
                            {showError && (
                                <div className="text-red-600 mt-1">
                                    Size Selection is required
                                </div>
                            )}
                            {/* SIZE ERROR ENDS */}
                        </div>
                        {/* Product Size range end */}

                        {/* ADD TO CART BUTTON START */}
                        <button
                            className="w-full py-4 rounded-full bg-black text-white text-lg
                font-medium transition-transform active:scale-95 mb-3 hover:opacity-75"
                            onClick={() => {
                                if (!selectedSize) {
                                    setShowError(true);
                                    document
                                        .getElementById("sizeGrid")
                                        .scrollIntoView({
                                            block: "center",
                                            behavior: "smooth",
                                        });
                                } else {
                                    dispatch(
                                        addToCart({
                                            ...product?.data?.[0],
                                            selectedSize,
                                            oneQuantityPrice: p.price,
                                        })
                                    );
                                    notify("Success. Check your cart");
                                }
                            }}
                        >
                            ADD TO CART
                        </button>
                        {/* ADD TO CART BUTTON END */}
                        {/* WISHLIST START  */}
                        <button
                            className="w-full py-4 rounded-full border border-black text-lg
                font-medium transition-transform active:scale-95 flex items-center 
                justify-center gap-2 hover:opacity-75 mb-10"
                            onClick={addToWishList}
                        >
                            WISHLIST
                            <IoMdHeartEmpty size={20} />
                        </button>
                        {/* WISHLIST END */}

                        <div>
                            <div className="text-lg font-bold mb-5">
                                Product Details
                            </div>
                            <div className="text-md mb-5 py-10">
                                <ReactMarkdown>
                                    {p.description}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                    {/*right column end*/}
                </div>
                <RelatedProducts products={products} />
            </Wrapper>
        </div>
    );
};

export default ProductDetails;

export async function getStaticPaths() {
    const products = await fetchDataFromApi("/api/products?populate=*");
    const paths = products?.data?.map((p) => ({
        params: {
            slug: p.attributes.slug,
        },
    }));

    return {
        paths,
        fallback: false,
    };
}

export async function getStaticProps({ params: { slug } }) {
    const product = await fetchDataFromApi(
        `/api/products?populate=*&filters[slug][$eq]=${slug}`
    );

    const products = await fetchDataFromApi(
        `/api/products?populate=*&[filters][slug][$ne]=${slug}`
    );

    return {
        props: {
            product,
            products,
        },
    };
}
