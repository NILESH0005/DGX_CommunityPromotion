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
  const dummyBlogs = [
    {
      BlogID: "1",
      title: "The Future of Artificial Intelligence in Everyday Life",
      image: "https://images.unsplash.com/photo-1677442135136-760c813a743d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      author: "Sarah Johnson",
      publishedDate: "2023-05-15T10:30:00Z",
      category: "Technology",
      readTime: 8,
      content: "Artificial Intelligence is transforming how we live, work, and interact. From smart assistants to predictive healthcare, AI applications are becoming ubiquitous. This article explores the current state of AI and its potential future impacts on our daily routines."
    },
    {
      BlogID: "2",
      title: "Sustainable Business Practices for the Modern Enterprise",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      author: "Michael Chen",
      publishedDate: "2023-06-22T14:15:00Z",
      category: "Business",
      readTime: 6,
      content: "Sustainability is no longer optional for businesses. Consumers demand eco-friendly practices, and regulations are tightening. Learn how leading companies are implementing green initiatives while maintaining profitability and competitive edge."
    },
    {
      BlogID: "3",
      title: "Mindfulness Meditation: A Path to Better Mental Health",
      image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      author: "Dr. Emily Wilson",
      publishedDate: "2023-07-10T08:45:00Z",
      category: "Health",
      readTime: 10,
      content: "Clinical studies continue to demonstrate the benefits of mindfulness meditation for stress reduction, focus improvement, and emotional regulation. This comprehensive guide provides practical techniques and scientific backing for incorporating mindfulness into your daily routine."
    },
    {
      BlogID: "4",
      title: "Breakthroughs in Quantum Computing Research",
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      author: "David Rodriguez",
      publishedDate: "2023-08-05T16:20:00Z",
      category: "Science",
      readTime: 12,
      content: "Recent advancements in quantum computing are solving problems previously thought impossible. This article examines the latest developments from leading research institutions and what they mean for cryptography, drug discovery, and materials science."
    },
    {
      BlogID: "5",
      title: "Hidden Gems: Unexplored Destinations for 2023",
      image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      author: "Lisa Thompson",
      publishedDate: "2023-04-18T11:10:00Z",
      category: "Travel",
      readTime: 7,
      content: "Skip the tourist traps this year and discover these breathtaking, less-visited destinations around the globe. From secluded beaches to mountain retreats, we've curated a list of places that offer authentic experiences without the crowds."
    },
    {
      BlogID: "6",
      title: "Plant-Based Diets: Health Benefits and Simple Recipes",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      author: "Chef Marco Bianchi",
      publishedDate: "2023-09-30T09:00:00Z",
      category: "Food",
      readTime: 9,
      content: "Transitioning to a plant-based diet can seem daunting, but the health benefits are substantial. This article breaks down the science behind plant-based nutrition and provides easy, delicious recipes to get you started on your journey."
    },
    {
      BlogID: "7",
      title: "The Evolution of Cybersecurity in the Cloud Era",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      author: "Alex Turner",
      publishedDate: "2023-10-12T13:25:00Z",
      category: "Technology",
      readTime: 11,
      content: "As businesses migrate to cloud platforms, security strategies must evolve. This analysis covers the latest threats, defense mechanisms, and best practices for protecting sensitive data in distributed computing environments."
    },
    {
      BlogID: "8",
      title: "Remote Work Culture: Building Team Connection Virtually",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      author: "Priya Patel",
      publishedDate: "2023-11-08T15:40:00Z",
      category: "Business",
      readTime: 8,
      content: "Maintaining company culture with distributed teams presents unique challenges. Learn from successful organizations that have fostered engagement, collaboration, and belonging among remote employees through innovative practices and tools."
    },
    {
      BlogID: "9",
      title: "The Science of Sleep: Optimizing Your Rest for Peak Performance",
      image: "https://images.unsplash.com/photo-1548286978-f218023f8d18?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      author: "Dr. James Peterson",
      publishedDate: "2023-12-01T07:15:00Z",
      category: "Health",
      readTime: 10,
      content: "Quality sleep is foundational to health and productivity. Neuroscientists explain the sleep cycles, the impact of technology on rest, and evidence-based strategies for improving sleep duration and quality in our modern, always-connected world."
    },
    {
      BlogID: "10",
      title: "The Rise of Vertical Farming in Urban Environments",
      image: "https://images.unsplash.com/photo-1592595896616-cfc5929e5d8a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      author: "Nina Garcia",
      publishedDate: "2023-01-25T12:00:00Z",
      category: "Science",
      readTime: 7,
      content: "Vertical farming is revolutionizing agriculture in cities worldwide. This innovative approach uses 90% less water than traditional farming while producing higher yields. Explore how these high-tech farms are making fresh produce more accessible in urban areas."
    },
    {
      BlogID: "11",
      title: "Culinary Adventures: Street Food Tours Around the World",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      author: "Tom Reynolds",
      publishedDate: "2023-02-14T18:30:00Z",
      category: "Food",
      readTime: 9,
      content: "Street food offers the most authentic taste of local culture. Join us on a global tour of must-try street eats, from Bangkok's pad thai to Mexico City's tacos al pastor, with tips on finding the best vendors and eating safely while traveling."
    },
    {
      BlogID: "12",
      title: "Solo Travel: Tips for Safe and Rewarding Adventures",
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      author: "Sophie Martin",
      publishedDate: "2023-03-09T10:05:00Z",
      category: "Travel",
      readTime: 6,
      content: "Traveling alone can be one of life's most enriching experiences. This guide provides practical safety advice, packing tips, and strategies for meeting people while maintaining your independence on solo journeys near and far."
    }
  ];

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
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedCategory 
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
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.ddValue
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