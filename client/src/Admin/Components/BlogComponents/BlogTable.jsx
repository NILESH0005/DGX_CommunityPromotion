import React, { useState, useContext } from 'react';
import BlogModal from '../../../component/BlogModal';
import moment from 'moment';
import ApiContext from '../../../context/ApiContext';
import { FaEye } from 'react-icons/fa';

const BlogTable = ({ blogs, userToken }) => {
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [blogData, setBlogData] = useState(blogs); 
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useContext(ApiContext);

  const updateBlogState = (blogId, newStatus) => {
    if (newStatus === "delete") {
      setBlogData((prevBlogs) =>
        prevBlogs.filter((blog) => blog.BlogID !== blogId)
      );
    } else {
      setBlogData((prevBlogs) =>
        prevBlogs.map((blog) =>
          blog.BlogID === blogId ? { ...blog, Status: newStatus } : blog
        )
      );
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-200 text-green-800"; 
      case "Rejected":
        return "bg-red-200 text-red-800"; 
      case "Pending":
        return "bg-yellow-200 text-yellow-800"; 
      default:
        return "bg-gray-200 text-gray-800";
    }
  };
  
  const openModal = (blog) => {
    setSelectedBlog(blog);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBlog(null);
  };

  const filteredBlogs = blogData.filter((blog) => {
    const matchesStatus = statusFilter === "" || blog.Status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesCategory = categoryFilter === "" || blog.category?.toLowerCase() === categoryFilter.toLowerCase();
    const matchesSearch = blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.UserName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.Status?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <label className="mr-2 text-sm font-medium">Filter by Status:</label>
            <select
              className="border px-3 py-2 rounded-lg text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
        <input
          type="text"
          placeholder="Search by title, category, name, etc..."
          className="p-2 border rounded text-sm w-1/2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredBlogs.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-gray-300">
          <div className="overflow-auto" style={{ maxHeight: "600px" }}>
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="bg-DGXgreen text-white">
                  <th className="p-2 border text-center w-12">#</th>
                  <th className="p-2 border text-center min-w-[150px]">Title</th>
                  <th className="p-2 border text-center min-w-[120px]">Category</th>
                  <th className="p-2 border text-center min-w-[150px]">Name</th>
                  <th className="p-2 border text-center min-w-[180px]">Published Date</th>
                  <th className="p-2 border text-center min-w-[120px]">Status</th>
                  <th className="p-2 border text-center min-w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlogs.map((blog, index) => (
                  <tr key={index} className={`hover:bg-gray-50 ${getStatusClass(blog.Status)}`}>
                    <td className="p-2 border text-center w-12">{index + 1}</td>
                    <td className="p-2 border text-center min-w-[150px]">{blog.title}</td>
                    <td className="p-2 border text-center min-w-[120px]">{blog.category}</td>
                    <td className="p-2 border text-center min-w-[150px]">{blog.UserName}</td>
                    <td className="p-2 border text-center min-w-[180px]">
                      {moment.utc(blog.publishedDate).format("MMMM D, YYYY ")}
                    </td>
                    <td className="p-2 border text-center min-w-[120px]">
                      {blog.Status || "Pending"}
                    </td>
                    <td className="p-2 border text-center min-w-[120px]">
                      <button
                        className="bg-DGXblue text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
                        onClick={() => openModal(blog)}
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-4">
          {searchTerm || statusFilter || categoryFilter 
            ? "No blogs match your search/filters" 
            : "No blogs found"}
        </p>
      )}

      {isModalOpen && selectedBlog && (
        <BlogModal
          blog={selectedBlog}
          closeModal={closeModal}
          updateBlogState={updateBlogState}
          userToken={userToken}
        />
      )}
    </div>
  );
};

export default BlogTable;