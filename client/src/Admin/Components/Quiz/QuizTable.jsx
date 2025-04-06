import React, { useState, useEffect, useContext } from "react";
import ApiContext from "../../../context/ApiContext";
import Swal from "sweetalert2";
import LoadPage from "../../../component/LoadPage";
import ViewQuizModal from "./ViewQuizModal";
import EditQuizModal from "./EditQuizModal";

const QuizTable = () => {
  const { fetchData, userToken } = useContext(ApiContext);
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [quizLevels, setQuizLevels] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [quizStats, setQuizStats] = useState({});
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchQuizLevels = async () => {
    const endpoint = `dropdown/getDropdownValues?category=quizLevel`;
    const method = "GET";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    try {
      const data = await fetchData(endpoint, method, headers);
      if (data.success) {
        setQuizLevels(data.data);
      } else {
        Swal.fire("Error", "Failed to fetch quiz levels.", "error");
      }
    } catch (error) {
      console.error("Error fetching quiz levels:", error);
      Swal.fire("Error", "Error fetching quiz levels.", "error");
    }
  };

  const fetchQuizCategories = async () => {
    const endpoint = `dropdown/getQuizGroupDropdown`;
    const method = "GET";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    try {
      const data = await fetchData(endpoint, method, headers);
      if (data.success) {
        const sortedCategories = data.data.sort((a, b) =>
          a.group_name.localeCompare(b.group_name)
        );
        setCategories(sortedCategories);
      } else {
        Swal.fire("Error", "Failed to fetch quiz categories.", "error");
      }
    } catch (error) {
      console.error("Error fetching quiz categories:", error);
      Swal.fire("Error", "Error fetching quiz categories.", "error");
    }
  };

  const fetchQuizStatistics = async () => {
    try {
      const endpoint = "quiz/getQuizStatistics";
      const method = "GET";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };

      const data = await fetchData(endpoint, method, headers);
      if (data.success) {
        setQuizStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching quiz statistics:", error);
    }
  };

  const fetchQuizzes = async () => {
    setLoading(true);
    const endpoint = "quiz/getQuizzes";
    const method = "GET";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };
    const body = {};

    try {
      const data = await fetchData(endpoint, method, body, headers);
      if (data.success) {
        setQuizzes(data.data.quizzes);
        setFilteredQuizzes(data.data.quizzes);
      } else {
        setError(data.message || "Failed to fetch quizzes");
      }
    } catch (err) {
      setError("Something went wrong, please try again.");
      console.error("Error fetching quizzes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const results = quizzes.filter((quiz) => {
      return (
        quiz.QuizName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCategoryName(quiz.QuizCategory)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        getLevelName(quiz.QuizLevel)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        quiz.QuizVisibility.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.QuizDuration.toString().includes(searchTerm) ||
        (quiz.NegativeMarking ? "yes" : "no").includes(searchTerm.toLowerCase())
      );
    });
    setFilteredQuizzes(results);
  }, [searchTerm, quizzes, categories, quizLevels]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const adjustedDate = new Date(
      date.getTime() - 5 * 60 * 60 * 1000 - 30 * 60 * 1000
    );
    const options = {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    return adjustedDate.toLocaleString("en-US", options).replace(" at ", " ");
  };

  const handleCopy = (quiz) => {
    const textToCopy = `Quiz Name: ${quiz.QuizName}\n` +
      `Category: ${getCategoryName(quiz.QuizCategory)}\n` +
      `Level: ${getLevelName(quiz.QuizLevel)}\n` +
      `Duration: ${quiz.QuizDuration} mins\n` +
      `Negative Marking: ${quiz.NegativeMarking ? "Yes" : "No"}\n` +
      `Start Date: ${formatDateTime(quiz.StartDateAndTime)}\n` +
      `End Date: ${formatDateTime(quiz.EndDateTime)}\n` +
      `Visibility: ${quiz.QuizVisibility}`;
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Copied!',
          text: 'Quiz details copied to clipboard',
          timer: 1500,
          showConfirmButton: false
        });
      })
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to copy quiz details',
          timer: 1500,
          showConfirmButton: false
        });
      });
  };

  const handleDelete = async (quizId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "OK",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const endpoint = "quiz/deleteQuiz";
          const method = "POST";
          const headers = {
            "Content-Type": "application/json",
            "auth-token": userToken,
          };
          const body = { QuizID: quizId };

          const data = await fetchData(endpoint, method, body, headers);
          if (data.success) {
            setQuizzes((prev) => prev.filter((quiz) => quiz.QuizID !== quizId));
            setFilteredQuizzes((prev) =>
              prev.filter((quiz) => quiz.QuizID !== quizId)
            );
            Swal.fire("Deleted!", "The quiz has been deleted.", "success");
          } else {
            Swal.fire(
              "Error",
              data.message || "Failed to delete the quiz.",
              "error"
            );
          }
        } catch (error) {
          console.error("Error deleting quiz:", error);
          Swal.fire(
            "Error",
            "Something went wrong, please try again.",
            "error"
          );
        }
      }
    });
  };

  const handleView = (quiz) => {
    setSelectedQuiz(quiz);
    setShowViewModal(true);
  };

  const handleEdit = (quiz) => {
    setSelectedQuiz(quiz);
    setShowEditModal(true);
  };

  const handleCloseModal = (isUpdated, updatedQuizData) => {
    setShowViewModal(false);
    setShowEditModal(false);
    setSelectedQuiz(null);

    if (isUpdated && updatedQuizData) {
      setQuizzes((prevQuizzes) =>
        prevQuizzes.map((quiz) =>
          quiz.QuizID === updatedQuizData.QuizID
            ? {
                ...quiz,
                ...updatedQuizData,
                QuizCategoryName: getCategoryName(updatedQuizData.QuizCategory),
                QuizLevelName: getLevelName(updatedQuizData.QuizLevel),
              }
            : quiz
        )
      );

      setFilteredQuizzes((prevFilteredQuizzes) =>
        prevFilteredQuizzes.map((quiz) =>
          quiz.QuizID === updatedQuizData.QuizID
            ? {
                ...quiz,
                ...updatedQuizData,
                QuizCategoryName: getCategoryName(updatedQuizData.QuizCategory),
                QuizLevelName: getLevelName(updatedQuizData.QuizLevel),
              }
            : quiz
        )
      );
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchQuizzes(),
          fetchQuizCategories(),
          fetchQuizLevels(),
          fetchQuizStatistics(),
        ]);
        setIsDataLoaded(true);
      } catch (error) {
        setError("Failed to fetch data. Please try again.");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const getLevelName = (levelId) => {
    if (!quizLevels.length) return "Loading...";
    const levelIdNumber =
      typeof levelId === "string" ? parseInt(levelId, 10) : levelId;
    const level = quizLevels.find((lvl) => lvl.idCode === levelIdNumber);
    return level ? level.ddValue : "N/A";
  };

  const getCategoryName = (groupId) => {
    if (!categories.length) return "Loading...";
    const groupIdNumber =
      typeof groupId === "string" ? parseInt(groupId, 10) : groupId;
    const category = categories.find((cat) => cat.group_id === groupIdNumber);
    return category ? category.group_name : "N/A";
  };

  const getQuizStats = (quizId) => {
    const stats = quizStats[quizId] || {
      uniqueParticipants: 0,
      totalAttempts: 0,
      totalMarks: 0,
      questionMappedCount: 0,
    };
    return stats;
  };

  if (loading) {
    return <LoadPage />;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!isDataLoaded) {
    return <LoadPage />;
  }

  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by name, category, level, etc..."
          className="p-2 border rounded w-1/2"
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
                    Question Mapped Count
                  </th>
                  <th className="p-2 border text-center min-w-[120px]">
                    Unique Participants
                  </th>
                  <th className="p-2 border text-center min-w-[80px]">
                    Attempts
                  </th>
                  <th className="p-2 border text-center min-w-[100px]">
                    Total Marks
                  </th>
                  <th className="p-2 border text-center min-w-[180px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredQuizzes.map((quiz, index) => {
                  const stats = getQuizStats(quiz.QuizID);
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
                        {stats.questionMappedCount || 0}
                      </td>
                      <td className="p-2 border text-center min-w-[120px]">
                        {stats.uniqueParticipants}
                      </td>
                      <td className="p-2 border text-center min-w-[80px]">
                        {stats.totalAttempts}
                      </td>
                      <td className="p-2 border text-center min-w-[100px]">
                        {stats.totalMarks}
                      </td>
                      <td className="p-2 border text-center min-w-[180px] space-x-1">
                        <button
                          onClick={() => handleView(quiz)}
                          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(quiz)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(quiz.QuizID)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition text-sm"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleCopy(quiz)}
                          className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 transition text-sm"
                        >
                          Copy
                        </button>
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