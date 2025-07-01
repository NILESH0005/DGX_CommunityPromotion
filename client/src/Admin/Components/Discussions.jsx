import { useState, useContext, useEffect, useMemo, useCallback } from "react";
import Swal from "sweetalert2";
import ApiContext from "../../context/ApiContext";
import LoadPage from "../../component/LoadPage";
import { FaTrash, FaSearch, FaTimes } from "react-icons/fa";
import { debounce } from "lodash";

const Discussions = () => {
  const { fetchData, userToken } = useContext(ApiContext);
  const [discussions, setDiscussions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const fetchDiscussions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchData(
        "discussion/getdiscussion",
        "POST",
        {},
        { "Content-Type": "application/json" }
      );

      if (result?.data?.updatedDiscussions) {
        setDiscussions(result.data.updatedDiscussions);
      }
    } catch (error) {
      setError(error.message);
      Swal.fire("Error", `Something went wrong: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  const stripHtmlTags = useCallback((html) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  }, []);

  const handleSearch = useCallback(
    debounce((term) => {
      setIsSearching(false);
    }, 300),
    []
  );

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsSearching(!!term.trim());
    handleSearch(term);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setIsSearching(false);
  };

  const filteredDiscussions = useMemo(() => {
    if (!searchTerm.trim()) return discussions;

    const term = searchTerm.toLowerCase();
    return discussions.filter((discussion) => {
      const title = (discussion.Title || "").toLowerCase();
      const userName = (discussion.UserName || "").toLowerCase();
      const content = stripHtmlTags(discussion.Content || "").toLowerCase();
      const likes = discussion.likeCount?.toString() || "";
      const comments = discussion.comment?.length?.toString() || "";

      return (
        title.includes(term) ||
        userName.includes(term) ||
        content.includes(term) ||
        likes.includes(searchTerm) ||
        comments.includes(searchTerm)
      );
    });
  }, [discussions, searchTerm, stripHtmlTags]);

  const handleDeleteDiscussion = async (discussionId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "OK",
    });

    if (result.isConfirmed) {
      try {
        const endpoint = "discussion/deleteDiscussion";
        const method = "POST";
        const headers = {
          "Content-Type": "application/json",
          "auth-token": userToken,
        };
        const body = { discussionId };

        const response = await fetchData(endpoint, method, body, headers);
        if (response && response.success) {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "The discussion has been deleted.",
          });
          fetchDiscussions(); // Refresh the discussions list
        } else {
          throw new Error("Failed to delete the discussion.");
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `Failed to delete the discussion: ${error.message}`,
        });
      }
    }
  };

  if (loading) return <LoadPage />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        {/* <input
          type="text"
          placeholder="Search by title, name, content, etc..."
          className="p-2 border rounded w-full md:w-1/2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        /> */}
      </div>

      {filteredDiscussions.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-gray-300">
          <div className="overflow-auto" style={{ maxHeight: "600px" }}>
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="bg-DGXgreen text-white">
                  <th className="p-2 border text-center w-12">#</th>
                  <th className="p-2 border text-center min-w-[150px]">
                    Title
                  </th>
                  <th className="p-2 border text-center min-w-[120px]">Name</th>
                  <th className="p-2 border text-center min-w-[200px]">
                    Content
                  </th>
                  <th className="p-2 border text-center min-w-[80px]">Likes</th>
                  <th className="p-2 border text-center min-w-[100px]">
                    Comments
                  </th>
                  <th className="p-2 border text-center min-w-[80px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDiscussions.map((discussion, index) => (
                  <tr
                    key={discussion.DiscussionID}
                    className="hover:bg-gray-50"
                  >
                    <td className="p-2 border text-center w-12">{index + 1}</td>
                    <td className="p-2 border text-center min-w-[150px]">
                      {discussion.Title}
                    </td>
                    <td className="p-2 border text-center min-w-[120px]">
                      {discussion.UserName}
                    </td>
                    <td className="p-2 border text-center min-w-[200px]">
                      {stripHtmlTags(discussion.Content.substring(0, 50))}...
                    </td>
                    <td className="p-2 border text-center min-w-[80px]">
                      {discussion.likeCount}
                    </td>
                    <td className="p-2 border text-center min-w-[100px]">
                      {discussion.comment.length}
                    </td>
                    <td className="p-2 border text-center min-w-[80px]">
                      {!discussion.approved && (
                        <button
                          onClick={() =>
                            handleDeleteDiscussion(discussion.DiscussionID)
                          }
                          className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
                          title="Delete"
                        >
                          <FaTrash className="inline-block" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">
          {searchTerm
            ? "No discussions match your search"
            : "No discussions found"}
        </p>
      )}
    </div>
  );
};

export default Discussions;