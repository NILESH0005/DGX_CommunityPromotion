            import React, { useContext, useEffect, useState } from "react";
            import { TbUserSquareRounded } from "react-icons/tb";
            import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
            import { faXmark } from '@fortawesome/free-solid-svg-icons';
            import BlogImage from "../component/BlogImage";
            import blogData from "../json/blogsData.json"
            import ApiContext from "../context/ApiContext";
            import BlogModal from "../component/BlogModal";



            const BlogPage = () => {
                const { fetchData, userToken } = useContext(ApiContext);
                const [blogs, setBlogs] = useState([]);
                const [loading, setLoading] = useState(true);
                const [currentPage, setCurrentPage] = useState(1);
                const [selectedCategory, setSelectedCategory] = useState(null);
                const [pageSize, setPageSize] = useState(10);
                const [showAll, setShowAll] = useState(false);
                const [selectedBlog, setSelectedBlog] = useState(null);
                const [isModalOpen, setIsModalOpen] = useState(false);
                const [categories, setCategories] = useState([]);

                useEffect(() => {
                    try {
                        const fetchBlogs = () => {
                            try {
                                const endpoint = "blog/getBlog";
                                const method = "POST";
                                const headers = {
                                    'Content-Type': 'application/json',
                                };

                                setLoading(true);
                                fetchData(endpoint, method, headers)
                                    .then(result => {
                                        if (result && result.data) {
                                            return result.data;
                                        } else {
                                            throw new Error("Invalid data format");
                                        }
                                    })
                                    .then((data) => {
                                        console.log(data);
                                        setBlogs(data)
                                    })
                                    .catch(error => {
                                        setLoading(false);
                                        console.error(`Something went wrong: ${error.message}`);
                                    });
                            } catch (error) {
                                console.log(error)
                            }
                        };
                        fetchBlogs()
                    } catch (error) {
                        console.log(error)
                    }

                }, [fetchData]);

                // const allCategories = [...new Set(blogs.map(blog => blog.category))];
                // console.log("Categories", allCategories);

                const handleCategorySelect = (category) => {
                    setSelectedCategory(category);
                    setCurrentPage(1);
                };

                const openModal = (blog) => {
                    setSelectedBlog(blog);
                    setIsModalOpen(true);
                };

                const closeModal = () => {
                    setIsModalOpen(false);
                    setSelectedBlog(null);
                };


                useEffect(() => {
                    const fetchCategories = async () => {
                        const endpoint = `dropdown/getDropdownValues?category=blogCategory`;
                        const method = "GET";
                        const headers = {
                            "Content-Type": "application/json",
                            "auth-token": userToken, 
                        };

                        try {
                            const data = await fetchData(endpoint, method, headers);
                            console.log("Fetched blog categories:", data);
                            if (data.success) {
                                setCategories(data.data); 
                            } else {
                                Swal.fire("Error", "Failed to fetch categories.", "error");
                            }
                        } catch (error) {
                            console.error("Error fetching blog categories:", error);
                            Swal.fire("Error", "Error fetching categories.", "error");
                        }
                    };

                    fetchCategories();
                }, []);


                const Blog = ({ blog }) => {
                    const { title, image, author, publishedDate } = blog || {};
                    return (
                        <div
                            className="shadow-lg shadow-gray-400 bg-white rounded-lg overflow-hidden transition-transform transform hover:scale-105 cursor-pointer"
                            onClick={() => openModal(blog)}
                        >
                            {/* Image Container */}
                            <div className="w-full h-64 bg-gray-200">
                                <img
                                    className="w-full h-full object-cover"
                                    src={image}
                                    alt={title}
                                />
                            </div>

                            {/* Content Container */}
                            <div className="p-5">
                                <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors">
                                    {title}
                                </h3>

                                {/* Author Section */}
                                <p className="mt-2 flex items-center gap-2 text-gray-500">
                                    <TbUserSquareRounded className="text-gray-700 text-xl" />
                                    <span className="text-sm">{author}</span>
                                </p>

                                {/* Publish Date */}
                                <p className="text-xs text-gray-500 mt-1">
                                    Published: {new Date(publishedDate).toLocaleString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        // hour: "2-digit",
                                        // minute: "2-digit",
                                        // hour12: true,
                                    })}
                                </p>
                            </div>
                        </div>

                    );
                };

                return (
                    <div>
                        <BlogImage />
                        <div className="flex justify-center items-center flex-wrap gap-3">
                            <div className=" flex items-center justify-center flex-wrap p-4 space-x-2 space-y-2" >

                                {categories.map((category, index) => (
                                    <button
                                        key={index}
                                        className={`flex items-center justify-center px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 h-8 text-sm font-semibold ${selectedCategory === category.ddValue ? 'bg-DGXgreen text-black' : 'bg-DGXblue text-white'} rounded-full transition-colors duration-300 ease-in-out hover:bg-DGXgreen hover:text-white`}
                                        onClick={() => handleCategorySelect(category.ddValue)}
                                    >
                                        {category.ddValue}
                                    </button>
                                ))}
                            </div>


                            {/* Blogs List */}
                            <div className="max-w-7xl mx-auto mb-10 px-4 md:px-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-10 transition-all duration-200">
                                    {blogs.filter(blog => selectedCategory === null || blog.category === selectedCategory).slice(0, pageSize).map((blog) => <Blog key={blog.BlogID} blog={blog}></Blog>)}
                                </div>

                                {/* Show More Button */}
                                {blogs.filter(blog => selectedCategory === null || blog.category === selectedCategory).length > pageSize && !showAll && (
                                    <div className="flex justify-center my-10">
                                        <button
                                            onClick={() => {
                                                const filteredBlogs = blogs.filter(blog => selectedCategory === null || blog.category === selectedCategory);
                                                if (pageSize + 5 >= filteredBlogs.length) {
                                                    setShowAll(true);
                                                }
                                                setPageSize(pageSize + 5);
                                            }}
                                            className="px-6 py-2 md:px-8 md:py-4 text-sm md:text-lg bg-DGXblue text-white rounded-lg hover:bg-DGXgreen"
                                        >
                                            Show More
                                        </button>
                                    </div>
                                )}
                            </div>
                            {isModalOpen && selectedBlog && <BlogModal blog={selectedBlog} closeModal={closeModal} />}
                        </div>
                    </div>
                );
            };


            export default BlogPage;
