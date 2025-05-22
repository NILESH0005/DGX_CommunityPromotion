import React, { useContext, useEffect, useState } from "react";
import { TbUserSquareRounded, TbClock, TbSearch } from "react-icons/tb";
import BlogImage from "../component/BlogImage";
import ApiContext from "../context/ApiContext";
import BlogModal from "../component/BlogModal";
import Swal from "sweetalert2";

const BlogPage = () => {
  const { fetchData, userToken } = useContext(ApiContext);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [pageSize, setPageSize] = useState(6);
  const [showAll, setShowAll] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Dummy categories data
  const dummyCategories = [
    { ddValue: "Technology", ddId: "1" },
    { ddValue: "Business", ddId: "2" },
    { ddValue: "Health", ddId: "3" },
    { ddValue: "Science", ddId: "4" },
    { ddValue: "Travel", ddId: "5" },
    { ddValue: "Food", ddId: "6" },
  ];

  // Comprehensive dummy blogs data
  const fetchCategories = () => {
    setCategories(dummyCategories);
  };

  useEffect(() => {
    try {
      const fetchBlogs = () => {
        try {
          const endpoint = "blog/getBlog";
          const method = "POST";
          const headers = {
            'Content-Type': 'application/json',
            'auth-token': userToken
          };
          console.log("toookkkeeenn:", userToken)

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

    fetchCategories();
  }, [fetchData, userToken]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category === selectedCategory ? null : category);
    setPageSize(6);
    setShowAll(false);
  };

  const openModal = (blog) => {
    setSelectedBlog(blog);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBlog(null);
  };

  const BlogCard = ({ blog }) => {
    if (!blog) return null;

    const { title, image, author, publishedDate, category, readTime } = blog;
    const fallbackImage = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60";

    return (
      <div
        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer h-full flex flex-col"
        onClick={() => openModal(blog)}
      >
        <div className="relative h-48 w-full overflow-hidden">
          <img
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            src={image || fallbackImage}
            alt={title}
            onError={(e) => e.target.src = fallbackImage}
          />
          {category && (
            <span className="absolute top-3 left-3 bg-white text-DGXblue px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
              {category}
            </span>
          )}
        </div>

        <div className="p-5 flex-grow flex flex-col">
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <span>{new Date(publishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            {readTime && (
              <>
                <span className="mx-2">•</span>
                <span className="flex items-center">
                  <TbClock className="mr-1" size={14} />
                  {readTime} min read
                </span>
              </>
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
            {title}
          </h3>

          <div className="mt-auto flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <TbUserSquareRounded className="text-gray-700" size={18} />
            </div>
            <span className="text-sm text-gray-600">{author || 'Unknown author'}</span>
          </div>
        </div>
      </div>
    );
  };

  const filteredBlogs = blogs.filter(blog =>
    (!selectedCategory || blog.category === selectedCategory) &&
    (!searchQuery || blog.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <BlogImage />

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Search and Filter Section */}
        <div className="mb-12">
          <div className="relative max-w-2xl mx-auto mb-8">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <TbSearch className="text-gray-400" size={20} />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-DGXblue focus:border-transparent transition-all"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!selectedCategory
                ? 'bg-DGXgreen text-black shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              onClick={() => handleCategorySelect(null)}
            >
              All
            </button>

            {categories.map((category) => (
              <button
                key={category.ddValue}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category.ddValue
                  ? 'bg-DGXgreen text-black shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                onClick={() => handleCategorySelect(category.ddValue)}
              >
                {category.ddValue}
              </button>
            ))}
          </div>
        </div>

        {/* Blog List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-DGXblue"></div>
            <p className="mt-4 text-gray-600">Loading articles...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {blogs.length === 0
                ? 'No articles available yet'
                : 'No articles match your search'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {blogs.length === 0
                ? 'Check back later for new content.'
                : 'Try adjusting your search or filter criteria.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.slice(0, pageSize).map((blog) => (
                <BlogCard key={blog.BlogID} blog={blog} />
              ))}
            </div>

            {!showAll && filteredBlogs.length > pageSize && (
              <div className="mt-12 text-center">
                <button
                  onClick={() => {
                    if (pageSize + 6 >= filteredBlogs.length) {
                      setShowAll(true);
                    }
                    setPageSize(prev => prev + 6);
                  }}
                  className="px-8 py-3 bg-DGXblue text-white rounded-lg hover:bg-DGXgreen transition-colors shadow-md hover:shadow-lg font-medium"
                >
                  Show More Articles
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Blog Modal */}
      {isModalOpen && selectedBlog && (
        <BlogModal blog={selectedBlog} closeModal={closeModal} />
      )}
    </div>
  );
};

export default BlogPage;