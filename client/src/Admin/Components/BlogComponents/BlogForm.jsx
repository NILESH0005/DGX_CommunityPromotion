import React, { useState, useContext, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ApiContext from "../../../context/ApiContext";
import Swal from "sweetalert2";
import { compressImage } from "../../../utils/compressImage.js";

const BlogForm = (props) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [publishedDate, setPublishedDate] = useState("");
  const [Status, setStatus] = useState("");
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const { fetchData, userToken, user } = useContext(ApiContext);

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
          const sortedCategories = data.data.sort((a, b) =>
            a.ddValue.localeCompare(b.ddValue)
          );
          setCategories(sortedCategories);
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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];

    if (file) {
      const allowedFormats = ["image/jpeg", "image/png", "image/svg+xml"];
      const maxSize = 50 * 1024; // 50KB

      if (!allowedFormats.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          image: "Only JPEG, PNG, and SVG files are allowed.",
        }));
        return;
      }
      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          image: "Image size should be less than 50KB.",
        }));
        return;
      }

      try {
        const compressedFile = await compressImage(file);
        setSelectedImage(compressedFile);
        setErrors((prev) => ({ ...prev, image: null })); // Clear error
      } catch (error) {
        Swal.fire("Error", "Failed to compress image.", "error");
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!title.trim()) errors.title = "Blog title is required.";
    if (!author.trim()) errors.author = "Author name is required.";
    if (!category) errors.category = "Please select a category.";
    if (!publishedDate) errors.publishedDate = "Published date is required.";
    if (!content.trim()) errors.content = "Blog content is required.";
    if (!selectedImage) errors.image = "Please upload an image.";

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Selected Category:", category);
    if (validateForm()) {
      Swal.fire({
        title: "Confirm Submission",
        text: "Are you sure you want to submit this blog post?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          handleConfirmSubmit();
        }
      });
    }
  };

  const handleConfirmSubmit = async () => {
    setLoading(true);

    const blogStatus = user.role === "admin" ? "approved" : "pending";

    const endpoint = "blog/blogpost";
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };
    const body = {
      title,
      content,
      image: selectedImage,
      author,
      category,
      Status: blogStatus,
      publishedDate,
      UserName: user.Name, // Add userName here
    };

    try {
      const data = await fetchData(endpoint, method, body, headers);
      setLoading(false);

      if (data.success) {
        if (typeof props.setBlogs === "function") {
          props.setBlogs((prevBlogs) => [
            {
              BlogId: data.data.postId,
              title,
              content,
              category,
              image: selectedImage,
              author,
              publishedDate,
              Status: blogStatus,
              UserID: user.UserID,
              UserName: user.Name,
            },
            ...prevBlogs,
          ]);
        } else {
          console.warn("updateBlogs is not a function!");
        }
        Swal.fire("Success", "Blog Posted Successfully", "success");
        resetForm();
      } else {
        Swal.fire("Error", `Error: ${data.message}`, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
      Swal.fire("Error", "Something went wrong, please try again.", "error");
    }
  };

  const resetForm = () => {
    setTitle("");
    setAuthor("");
    setCategory("");
    setPublishedDate("");
    setContent("");
    setSelectedImage(null);
    setErrors({});
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="mx-auto mt-4 bg-white p-6 rounded shadow border-2"
      >
        <div className="mb-4">
          <label>Blog Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border w-full p-2"
          />
          {errors.title && <p className="text-red-500">{errors.title}</p>}
        </div>

        <div className="mb-4">
          <label>Author</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="border w-full p-2"
          />
          {errors.author && <p className="text-red-500">{errors.author}</p>}
        </div>

        <div className="mb-4">
          <label>Published Date</label>
          <input
            type="date"
            value={publishedDate}
            onChange={(e) => setPublishedDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]} // Restricts future dates
            className="border w-full p-2"
          />
          {errors.publishedDate && (
            <p className="text-red-500">{errors.publishedDate}</p>
          )}
        </div>

        <div className="mb-4">
          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border w-full p-2"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.idCode} value={cat.ddValue}>
                {cat.ddValue}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-red-500">{errors.category}</p>}
        </div>

        <div className="mb-4">
          <label>Blog Content</label>
          <ReactQuill
            value={content}
            onChange={(value) => setContent(value)}
            className="h-48"
          />
          {errors.content && <p className="text-red-500">{errors.content}</p>}
        </div>

        <div className="mb-4 relative pt-10">
          <label className="block text-sm font-medium">Upload Image</label>
          <div className=" top-0 left-0 text-xs text-DGXblue  ">
            <span>Max size: 50KB | Formats: .jpeg, .png</span>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="border w-full p-2"
          />
          {errors.image && (
            <p className="text-red-500 text-sm">{errors.image}</p>
          )}
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </>
  );
};

export default BlogForm;
