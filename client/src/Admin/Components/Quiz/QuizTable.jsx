import React, { useState, useEffect, useContext, useMemo } from "react";
import ApiContext from "../../../context/ApiContext";
import Swal from "sweetalert2";
import LoadPage from "../../../component/LoadPage";
import ViewQuizModal from "./ViewQuizModal";
import EditQuizModal from "./EditQuizModal";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const QuizTable = () => {
  const { fetchData, userToken } = useContext(ApiContext);
  const [quizzes, setQuizzes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [quizLevels, setQuizLevels] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Initialize empty stats object to prevent undefined errors
  const defaultStats = {
    questionMappedCount: 0,
    uniqueParticipants: 0,
    totalAttempts: 0,
    totalMarks: 0
  };

  const fetchQuizLevels = async () => {
    try {
      const endpoint = `dropdown/getDropdownValues?category=quizLevel`;
      const method = "GET";
      const headers = {
        'Content-Type': 'application/json',
        'auth-token': userToken
      };

      const result = await fetchData(endpoint, method, headers);
      if (result?.success) {
        setQuizLevels(result.data || []);
      } else {
        throw new Error(result?.message || "Failed to fetch quiz levels");
      }
    } catch (error) {
      console.error(`Error fetching quiz levels: ${error.message}`);
      setQuizLevels([]);
      throw error;
    }
  };

  const fetchQuizCategories = async () => {
    try {
      const endpoint = `dropdown/getQuizGroupDropdown`;
      const method = "GET";
      const headers = {
        'Content-Type': 'application/json',
        'auth-token': userToken
      };

      const result = await fetchData(endpoint, method, headers);
      if (result?.success) {
        const sortedCategories = (result.data || []).sort((a, b) =>
          a.group_name.localeCompare(b.group_name)
        );
        setCategories(sortedCategories);
      } else {
        throw new Error(result?.message || "Failed to fetch quiz categories");
      }
    } catch (error) {
      console.error(`Error fetching quiz categories: ${error.message}`);
      setCategories([]);
      throw error;
    }
  };

  const fetchQuizzes = async () => {
    try {
      const endpoint = "quiz/getQuizzes";
      const method = "GET";
      const headers = {
        'Content-Type': 'application/json',
        'auth-token': userToken
      };

      const result = await fetchData(endpoint, method, headers);
      if (result?.success) {
        setQuizzes(result.data?.quizzes || []);
        return result.data?.quizzes || [];
      } else {
        throw new Error(result?.message || "Failed to fetch quizzes");
      }
    } catch (error) {
      console.error(`Error fetching quizzes: ${error.message}`);
      setQuizzes([]);
      throw error;
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      try {
        console.log('Starting data loading...');
        setLoading(true);

        // Run all fetches in parallel
        const results = await Promise.all([
          fetchQuizzes().then(r => { console.log('Quizzes loaded'); return r }),
          fetchQuizCategories().then(r => { console.log('Categories loaded'); return r }),
          fetchQuizLevels().then(r => { console.log('Levels loaded'); return r })
        ]);

        console.log('All data loaded successfully', results);
      } catch (error) {
        console.error('Error in loadAllData:', error);
        setError(error.message);
        Swal.fire({
          icon: 'error',
          title: 'Loading Error',
          text: 'Failed to load quiz data. Please try again later.'
        });
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const adjustedDate = new Date(date.getTime() - 5 * 60 * 60 * 1000 - 30 * 60 * 1000);
      return adjustedDate.toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).replace(" at ", " ");
    } catch (e) {
      console.error("Date formatting error:", e);
      return "Invalid Date";
    }
  };

  const getLevelName = (levelId) => {
    if (!quizLevels.length) return "Loading...";
    try {
      const level = quizLevels.find(lvl => lvl.idCode === (typeof levelId === "string" ? parseInt(levelId, 10) : levelId));
      return level ? level.ddValue : "N/A";
    } catch (e) {
      console.error("Level name error:", e);
      return "N/A";
    }
  };

  const getCategoryName = (groupId) => {
    if (!categories.length) return "Loading...";
    try {
      const category = categories.find(cat => cat.group_id === (typeof groupId === "string" ? parseInt(groupId, 10) : groupId));
      return category ? category.group_name : "N/A";
    } catch (e) {
      console.error("Category name error:", e);
      return "N/A";
    }
  };

  // Memoized filtered quizzes
  const filteredQuizzes = useMemo(() => {
    if (!searchTerm) return quizzes;
    const searchLower = searchTerm.toLowerCase();
    return quizzes.filter(quiz => {
      try {
        return (
          quiz.QuizName?.toLowerCase().includes(searchLower) ||
          getCategoryName(quiz.QuizCategory)?.toLowerCase().includes(searchLower) ||
          getLevelName(quiz.QuizLevel)?.toLowerCase().includes(searchLower) ||
          quiz.QuizVisibility?.toLowerCase().includes(searchLower) ||
          quiz.QuizDuration?.toString().includes(searchTerm) ||
          (quiz.NegativeMarking ? "yes" : "no").includes(searchLower)
        );
      } catch (e) {
        console.error("Filter error:", e);
        return false;
      }
    });
  }, [searchTerm, quizzes, categories, quizLevels]);

  // Action handlers
  const handleView = (quiz) => {
    setSelectedQuiz(quiz);
    setShowViewModal(true);
  };

  const handleEdit = (quiz) => {
    setSelectedQuiz(quiz);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setSelectedQuiz(null);
  };

  if (loading) {
    return <LoadPage />;
  }

  if (error) {
    return (
      <div className="mt-6 p-4 bg-white rounded-lg shadow">
        <p className="text-red-500 text-center">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded mx-auto block"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <input
          type="text"
          placeholder="Search by name, category, level, etc..."
          className="p-2 border rounded w-full md:w-1/2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {filteredQuizzes.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-gray-300">
          <div className="overflow-auto" style={{ maxHeight: "600px" }}>
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="bg-DGXgreen">
                  <th className="p-2 border text-center w-12">#</th>
                  <th className="p-2 border text-center min-w-[150px]">
                    Quiz Category
                  </th>
                  <th className="p-2 border text-center min-w-[150px]">
                    Quiz Name
                  </th>
                  <th className="p-2 border text-center min-w-[100px]">
                    Level
                  </th>
                  <th className="p-2 border text-center min-w-[80px]">
                    Duration
                  </th>
                  <th className="p-2 border text-center min-w-[120px]">
                    Negative Marking
                  </th>
                  <th className="p-2 border text-center min-w-[180px]">
                    Start Date & Time
                  </th>
                  <th className="p-2 border text-center min-w-[180px]">
                    End Date & Time
                  </th>
                  <th className="p-2 border text-center min-w-[100px]">
                    Visibility
                  </th>
                  <th className="p-2 border text-center min-w-[80px]">
                    Questions
                  </th>
                  <th className="p-2 border text-center min-w-[120px]">
                    Participants
                  </th>
                  <th className="p-2 border text-center min-w-[80px]">
                    Attempts
                  </th>
                  <th className="p-2 border text-center min-w-[100px]">
                    Total Marks
                  </th>
                  <th className="p-2 border text-center min-w-[120px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredQuizzes.map((quiz, index) => {
                  return (
                    <tr key={quiz.QuizID} className="hover:bg-gray-50">
                      <td className="p-2 border text-center w-12">
                        {index + 1}
                      </td>
                      <td className="p-2 border text-center min-w-[150px]">
                        {getCategoryName(quiz.QuizCategory)}
                      </td>
                      <td className="p-2 border text-center min-w-[150px]">
                        {quiz.QuizName}
                      </td>
                      <td className="p-2 border text-center min-w-[100px]">
                        {getLevelName(quiz.QuizLevel)}
                      </td>
                      <td className="p-2 border text-center min-w-[80px]">
                        {quiz.QuizDuration} mins
                      </td>
                      <td className="p-2 border text-center min-w-[120px]">
                        {quiz.NegativeMarking ? "Yes" : "No"}
                      </td>
                      <td className="p-2 border text-center min-w-[180px]">
                        {formatDateTime(quiz.StartDateAndTime)}
                      </td>
                      <td className="p-2 border text-center min-w-[180px]">
                        {formatDateTime(quiz.EndDateTime)}
                      </td>
                      <td className="p-2 border text-center min-w-[100px]">
                        {quiz.QuizVisibility}
                      </td>
                      <td className="p-2 border text-center min-w-[100px]">
                        {quiz.QuestionMappedCount || 0}
                      </td>
                      <td className="p-2 border text-center min-w-[120px]">
                        {quiz.UniqueParticipants || 0}
                      </td>
                      <td className="p-2 border text-center min-w-[80px]">
                        {quiz.totalMaxAttempts || 0}
                      </td>
                      <td className="p-2 border text-center min-w-[100px]">
                        {quiz.TotalMarksPerQuiz || 0}
                      </td>
                      <td className="p-2 border text-center min-w-[120px]">
                        <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                          <button
                            onClick={() => handleView(quiz)}
                            className="bg-DGXblue text-white p-1 sm:p-2 rounded hover:bg-blue-600 transition"
                            title="View"
                            aria-label="View"
                          >
                            <FaEye className="text-xs sm:text-sm" />
                          </button>
                          <button
                            onClick={() => handleEdit(quiz)}
                            className="bg-yellow-500 text-white p-1 sm:p-2 rounded hover:bg-yellow-600 transition"
                            title="Edit"
                            aria-label="Edit"
                          >
                            <FaEdit className="text-xs sm:text-sm" />
                          </button>
                          <button
                            onClick={() => handleDelete(quiz.QuizID)}
                            className="bg-red-500 text-white p-1 sm:p-2 rounded hover:bg-red-600 transition"
                            title="Delete"
                            aria-label="Delete"
                          >
                            <FaTrash className="text-xs sm:text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">
          {searchTerm ? "No quizzes match your search" : "No quizzes found"}
        </p>
      )}

      {showViewModal && selectedQuiz && (
        <ViewQuizModal
          quiz={selectedQuiz}
          onClose={handleCloseModal}
          getCategoryName={getCategoryName}
          getLevelName={getLevelName}
          formatDateTime={formatDateTime}
        />
      )}
      {showEditModal && selectedQuiz && (
        <EditQuizModal
          quiz={selectedQuiz}
          onClose={handleCloseModal}
          categories={categories}
          quizLevels={quizLevels}
        />
      )}
    </div>
  );
};

export default QuizTable;