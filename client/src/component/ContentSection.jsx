import React, { useState, useContext, useEffect } from "react";
import ApiContext from "../context/ApiContext";
import Skeleton from "react-loading-skeleton";
import Swal from "sweetalert2";

const ContentSection = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchData } = useContext(ApiContext);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetchData(
          "home/getContent", 
          "GET", 
          {}, 
          {"Content-Type": "application/json"}
        );

        if (response?.success && response.data?.length > 0) {
          setContent({
            title: response.data[0].Title,
            text: response.data[0].Content,
            image: response.data[0].Image
          });
        } else {
          setError("No content available");
        }
      } catch (err) {
        setError(err.message || "Failed to load content");
        Swal.fire("Error", "Content loading failed", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-2/3">
            <Skeleton height={40} className="mb-6" />
            <Skeleton count={4} />
          </div>
          <div className="md:w-1/3">
            <Skeleton height={300} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-DGXblue text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex flex-col md:flex-row gap-8 p-6">
          <div className="md:w-2/3">
            <h2 className="text-3xl font-bold text-DGXblue mb-6">
              {content.title}
            </h2>
            <div className="prose">
              {content.text.split('\n').map((para, i) => (
                <p key={i} className="mb-4">{para}</p>
              ))}
            </div>
          </div>
          
          <div className="md:w-1/3 flex justify-center">
            {content.image ? (
              <img
                src={content.image}
                alt="Content visual"
                className="max-h-80 object-contain rounded-lg"
                onError={(e) => e.target.style.display = 'none'}
              />
            ) : (
              <div className="h-80 w-full bg-gray-100 flex items-center justify-center rounded-lg">
                <span className="text-gray-500">No image</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentSection;