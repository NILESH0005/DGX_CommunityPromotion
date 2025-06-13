import React, { useState, useEffect, useContext, useMemo } from "react";
import ApiContext from "../../../context/ApiContext";
import Swal from "sweetalert2";
import LoadPage from "../../../component/LoadPage";
import ViewQuizModal from "./ViewQuizModal";
import EditQuizModal from "./EditQuizModal";
import { FaEye, FaEdit, FaTrash, FaFilter, FaTimes } from "react-icons/fa";

const QuizTable = () => {
  const { fetchData, userToken } = useContext(ApiContext);
  const [quizzes, setQuizzes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [quizLevels, setQuizLevels] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    quizCategory: true,
    quizName: true,
    duration: true,
    startDateTime: true,
    endDateTime: true,
    questions: true,
    participants: true,
    attempts: true,
    totalMarks: true,
    passingPercentage: true,
    actions: true,
    // Hidden by default
    level: false,
    negativeMarking: false,
    visibility: false
  });

  // Column definitions for better organization
  const columnDefinitions = [
    { key: 'quizCategory', label: 'Quiz Category' },
    { key: 'quizName', label: 'Quiz Name' },
    { key: 'level', label: 'Level' },
    { key: 'duration', label: 'Duration' },
    { key: 'negativeMarking', label: 'Negative Marking' },
    { key: 'startDateTime', label: 'Start Date & Time' },
    { key: 'endDateTime', label: 'End Date & Time' },
    { key: 'visibility', label: 'Visibility' },
    { key: 'questions', label: 'Questions' },
    { key: 'participants', label: 'Participants' },
    { key: 'attempts', label: 'Attempts' },
    { key: 'totalMarks', label: 'Total Marks' },
    { key: 'passingPercentage', label: 'Passing Percentage' },
    { key: 'actions', label: 'Actions' }
  ];

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
      console.log("token is ", userToken);
      const endpoint = "quiz/getQuizzes";
      const method = "POST";
      const body = {};
      const headers = {
        'Content-Type': 'application/json',
        'auth-token': userToken
      };
      console.log("finding token", headers)

      const result = await fetchData(endpoint, method, body,  headers);
      console.log("checking result", result);

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
          (quiz.NegativeMarking ? "yes" : "no").includes(searchLower) ||
          (quiz.PassingPercentage?.toString().includes(searchTerm))
        );
      } catch (e) {
        console.error("Filter error:", e);
        return false;
      }
    });
  }, [searchTerm, quizzes, categories, quizLevels]);

  const handleDelete = async (quizId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const endpoint = `quiz/deleteQuiz/${quizId}`;
        const method = "DELETE";
        const headers = {
          'Content-Type': 'application/json',
          'auth-token': userToken
        };
        const body = {}

        const response = await fetchData(endpoint, method, body, headers);
        if (response.success) {
          Swal.fire(
            'Deleted!',
            'Quiz has been deleted.',
            'success'
          );
          setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz.QuizID !== quizId));
        } else {
          throw new Error(response.message || "Failed to delete quiz");
        }
      } catch (error) {
        console.error("Error deleting quiz:", error);
        Swal.fire(
          'Error!',
          error.message || 'Failed to delete quiz',
          'error'
        );
      }
    }
  };

  // Action handlers
  const handleView = (quiz) => {
    setSelectedQuiz(quiz);
    setShowViewModal(true);
  };

  const handleEdit = (quiz) => {
    setSelectedQuiz(quiz);
    setShowEditModal(true);
  };

  const handleCloseModal = (updatedQuiz) => {
    setShowViewModal(false);
    setShowEditModal(false);

    if (updatedQuiz) {
      // Update the quizzes state with the updated quiz
      setQuizzes(prevQuizzes =>
        prevQuizzes.map(quiz =>
          quiz.QuizID === updatedQuiz.QuizID ? updatedQuiz : quiz
        )
      );
    }

    setSelectedQuiz(null);
  };

  const toggleColumnVisibility = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const toggleAllColumns = (value) => {
    const newVisibility = {};
    columnDefinitions.forEach(col => {
      newVisibility[col.key] = value;
    });
    setVisibleColumns(newVisibility);
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
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded transition"
          >
            {showFilters ? <FaTimes /> : <FaFilter />}
            {showFilters ? "Close" : "Columns"}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-lg">Visible Columns</h3>
            <div className="flex gap-2">
              <button
                onClick={() => toggleAllColumns(true)}
                className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
              >
                Show All
              </button>
              <button
                onClick={() => toggleAllColumns(false)}
                className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
              >
                Hide All
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {columnDefinitions.map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={visibleColumns[key]}
                  onChange={() => toggleColumnVisibility(key)}
                  className="rounded border-gray-300 text-DGXgreen focus:ring-DGXgreen"
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {filteredQuizzes.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-gray-300">
          <div className="overflow-auto" style={{ maxHeight: "600px" }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-DGXgreen text-white">
                    <th className="p-2 border text-center w-12 sticky left-0 bg-DGXgreen">#</th>
                    {columnDefinitions.map(({ key, label }) => (
                      visibleColumns[key] && (
                        <th key={key} className="p-2 border text-center min-w-[100px]">
                          {label}
                        </th>
                      )
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredQuizzes.map((quiz, index) => (
                    <tr key={quiz.QuizID} className="hover:bg-gray-50">
                      <td className="p-2 border text-center w-12 sticky left-0 bg-white">
                        {index + 1}
                      </td>

                      {visibleColumns.quizCategory && (
                        <td className="p-2 border text-center">
                          {getCategoryName(quiz.QuizCategory)}
                        </td>
                      )}

                      {visibleColumns.quizName && (
                        <td className="p-2 border text-center">
                          {quiz.QuizName}
                        </td>
                      )}

                      {visibleColumns.level && (
                        <td className="p-2 border text-center">
                          {getLevelName(quiz.QuizLevel)}
                        </td>
                      )}

                      {visibleColumns.duration && (
                        <td className="p-2 border text-center">
                          {quiz.QuizDuration} mins
                        </td>
                      )}

                      {visibleColumns.negativeMarking && (
                        <td className="p-2 border text-center">
                          {quiz.NegativeMarking ? "Yes" : "No"}
                        </td>
                      )}

                      {visibleColumns.startDateTime && (
                        <td className="p-2 border text-center">
                          {formatDateTime(quiz.StartDateAndTime)}
                        </td>
                      )}

                      {visibleColumns.endDateTime && (
                        <td className="p-2 border text-center">
                          {formatDateTime(quiz.EndDateTime)}
                        </td>
                      )}

                      {visibleColumns.visibility && (
                        <td className="p-2 border text-center">
                          {quiz.QuizVisibility}
                        </td>
                      )}

                      {visibleColumns.questions && (
                        <td className="p-2 border text-center">
                          {quiz.QuestionMappedCount || 0}
                        </td>
                      )}

                      {visibleColumns.participants && (
                        <td className="p-2 border text-center">
                          {quiz.UniqueParticipants || 0}
                        </td>
                      )}

                      {visibleColumns.attempts && (
                        <td className="p-2 border text-center">
                          {quiz.totalMaxAttempts || 0}
                        </td>
                      )}

                      {visibleColumns.totalMarks && (
                        <td className="p-2 border text-center">
                          {quiz.TotalMarksPerQuiz || 0}
                        </td>
                      )}

                      {visibleColumns.passingPercentage && (
                        <td className="p-2 border text-center">
                          {quiz.PassingPercentage || 0}%
                        </td>
                      )}

                      {visibleColumns.actions && (
                        <td className="p-2 border text-center">
                          <div className="flex justify-center items-center gap-2 whitespace-nowrap">
                            <button
                              onClick={() => handleView(quiz)}
                              className="bg-DGXblue text-white p-2 rounded hover:bg-blue-600 transition flex items-center justify-center"
                              title="View"
                              aria-label="View"
                            >
                              <FaEye className="text-sm" />
                            </button>
                            <button
                              onClick={() => handleEdit(quiz)}
                              className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition flex items-center justify-center"
                              title="Edit"
                              aria-label="Edit"
                            >
                              <FaEdit className="text-sm" />
                            </button>
                            <button
                              onClick={() => handleDelete(quiz.QuizID)}
                              className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition flex items-center justify-center"
                              title="Delete"
                              aria-label="Delete"
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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