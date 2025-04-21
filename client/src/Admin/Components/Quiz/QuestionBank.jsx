import React, { useState, useEffect, useContext } from "react";
import ApiContext from "../../../context/ApiContext";
import QuizQuestions from "./QuizQuestions";
import Swal from "sweetalert2";
import LoadPage from "../../../component/LoadPage";
import EditQuestionModal from "./EditQuestionModal";
import { FaEdit, FaTrash } from "react-icons/fa";

const QuizBank = () => {
  const { fetchData, userToken } = useContext(ApiContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [showQuizQuestions, setShowQuizQuestions] = useState(false);
  const [questionMap, setFinalQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [questionLevels, setQuestionLevels] = useState([]);

  const fetchCategories = async () => {
    const endpoint = `dropdown/getQuestionGroupDropdown`;
    const method = "GET";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    try {
      const data = await fetchData(endpoint, method, {}, headers);
      if (data?.success) {
        setCategories(
          data.data?.sort((a, b) => a.group_name.localeCompare(b.group_name)) ||
          []
        );
        return data.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching quiz categories:", error);
      return [];
    }
  };

  const fetchQuestionLevels = async () => {
    const endpoint = `dropdown/getDropdownValues?category=questionLevel`;
    const method = "GET";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    try {
      const data = await fetchData(endpoint, method, {}, headers);
      if (data?.success) {
        setQuestionLevels(data.data || []);
        return data.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching question levels:", error);
      return [];
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    const endpoint = "quiz/getQuestion";
    const method = "GET";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    try {
      const [questionsData] = await Promise.all([
        fetchData(endpoint, method, {}, headers),
        fetchCategories(),
        fetchQuestionLevels(),
      ]);
      if (questionsData.success) {
        const questionMap = new Map();

        questionsData.data.quizzes.forEach((quiz) => {
          const questionKey = `${quiz.question_text}_${quiz.id}`;
          const existingQuestion = questionMap.get(questionKey);
          console.log("chuuhhhh", questionsData);

          if (existingQuestion) {
            questionMap.set(questionKey, {
              ...existingQuestion,
              options: [
                ...(existingQuestion.options || []),
                {
                  option_text: quiz.option_text,
                  is_correct: quiz.is_correct === 1,
                  image: quiz.image_url || null,
                },
              ],
              correctAnswer:
                quiz.is_correct === 1
                  ? [
                      ...(Array.isArray(existingQuestion.correctAnswer)
                        ? existingQuestion.correctAnswer
                        : [existingQuestion.correctAnswer]),
                      quiz.option_text,
                    ]
                  : existingQuestion.correctAnswer,
            });
          } else {
            // Create new question entry
            questionMap.set(questionKey, {
              id: quiz.id,
              question_id: quiz.id,
              question_text: quiz.question_text,
              correctAnswer: quiz.is_correct === 1 ? quiz.option_text : [],
              group: quiz.group_name,
              group_id: quiz.group_id,
              Ques_level: quiz.ddValue,
              count: quiz.quiz_count || 0,
              image: quiz.question_image || null,
              options: [
                {
                  option_text: quiz.option_text,  
                  is_correct: quiz.is_correct === 1,
                  image: quiz.image_url || null,
                },
              ],
            });
          }
        });

        const mappedQuestions = Array.from(questionMap.values()).map(
          (question) => {
            let correctAnswers = question.correctAnswer;
            if (Array.isArray(correctAnswers)) {
              correctAnswers = correctAnswers.join(" | ");
            }

            return {
              ...question,
              correctAnswer: correctAnswers,
            };
          }
        );

        setFinalQuestions(mappedQuestions);
      } else {
        setError(questionsData.message || "Failed to fetch questions.");
        Swal.fire(
          "Error",
          questionsData.message || "Failed to fetch questions.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      setError("Something went wrong, please try again.");
      Swal.fire("Error", "Something went wrong, please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (questionId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "OK",
    });

    if (!result.isConfirmed) return;

    if (!questionId) {
      Swal.fire("Error", "Question ID is missing.", "error");
      return;
    }

    const endpoint = "quiz/deleteQuestion";
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };
    const body = { id: questionId.toString() };

    try {
      const data = await fetchData(endpoint, method, body, headers);
      if (data?.success) {
        setFinalQuestions((prevQuestions) =>
          prevQuestions.filter((q) => q.id !== questionId)
        );
        Swal.fire("Deleted!", "Question has been deleted.", "success");
      } else {
        Swal.fire(
          "Error",
          data?.message || "Failed to delete the question.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      Swal.fire("Error", "Something went wrong, please try again.", "error");
    }
  };

  const handleEdit = (questionId) => {
    const questionToEdit = questionMap.find((q) => q.id === questionId);

    if (!questionToEdit) {
      Swal.fire("Error", "Question not found in local data", "error");
      return;
    }

    const transformedQuestion = {
      id: questionToEdit.id,
      question_text: questionToEdit.question_text,
      group_id: questionToEdit.group_id?.toString(),
      group_name: questionToEdit.group,
      Ques_level: questionToEdit.Ques_level,
      question_type: 0, 
      image: questionToEdit.image,
      options: questionToEdit.options.map(option => ({
        option_text: option.option_text,
        is_correct: option.is_correct,
        image: option.image
      }))
    };

    setSelectedQuestion(transformedQuestion);
    setShowEditModal(true);
  };

  const transformQuestionData = (apiData) => {
    if (!apiData || apiData.length === 0) return null;

    const questionMap = {};

    apiData.forEach((item) => {
      if (!questionMap[item.question_id]) {
        questionMap[item.question_id] = {
          id: item.question_id,
          question_text: item.question_text,
          group_id: item.group_id?.toString(),
          group_name: item.group_name,
          Ques_level: item.ddValue,
          question_type: item.question_type || 0,
          image: item.question_image || null,
          options: [],
        };
      }

      if (item.option_text) {
        questionMap[item.question_id].options.push({
          option_text: item.option_text,
          is_correct: item.is_correct === 1,
          image: item.option_image || null,
        });
      }
    });

    return Object.values(questionMap)[0];
  };

  const handleCloseModal = (isUpdated = false) => {
    setShowEditModal(false);
    setSelectedQuestion(null);

    if (isUpdated) {
      fetchQuestions();
    }
  };

  const handleQuestionCreated = () => {
    fetchQuestions();
    setShowQuizQuestions(false);
    Swal.fire("Success", "Question added successfully!", "success");
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const groups = ["All", ...new Set(questionMap.map((q) => q.group))];

  const filteredQuestions = questionMap.filter((question) => {
    return (
      (selectedGroup === "All" || question.group === selectedGroup) &&
      (question.question_text || question.text)
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  });

  if (showQuizQuestions) {
    return (
      <QuizQuestions
        onBackToBank={() => setShowQuizQuestions(false)}
        onQuestionCreated={handleQuestionCreated}
      />
    );
  }

  if (loading) {
    return <LoadPage />;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowQuizQuestions(true)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
        >
          Create Question
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border rounded w-1/2"
        />

        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="p-2 border rounded"
        >
          {groups.map((group, index) => (
            <option key={index} value={group}>
              {group}
            </option>
          ))}
        </select>
      </div>

      {filteredQuestions.length > 0 ? (
        <div className="overflow-auto" style={{ maxHeight: "600px" }}>
          <table className="w-full border-collapse border border-gray-300">
            <thead className="sticky top-0 z-10">
              <tr className="bg-DGXgreen">
                <th className="border p-2">#</th>
                <th className="border p-2">Question</th>
                <th className="border p-2">Correct Answer</th>
                {/* <th className="border p-2">Answer Images</th> */}
                <th className="border p-2">Group</th>
                <th className="border p-2">Level</th>
                <th className="border p-2">Count</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.map((q, index) => (
                <tr key={`${q.id}_${index}`} className="hover:bg-gray-50">
                  <td className="border p-2 text-center">{index + 1}</td>
                  <td className="border p-2">{q.question_text || q.text}</td>
                  <td className="border p-2">{q.correctAnswer}</td>
                  {/* <td className="border p-2">
                    {q.images && q.images.length > 0 ? (
                      q.images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`Answer ${i + 1}`}
                          className="h-12 w-auto mx-auto"
                        />
                      ))
                    ) : (
                      <span className="text-gray-400">No images</span>
                    )}
                  </td> */}
                  <td className="border p-2 text-center">{q.group}</td>
                  <td className="border p-2 text-center">
                    {q.Ques_level || q.level}
                  </td>
                  <td className="border p-2 text-center">{q.count}</td>
                  <td className="border p-2 text-center">
                    <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                      <button
                        onClick={() => handleEdit(q.id)}
                        className="bg-yellow-500 text-white p-1 sm:p-2 rounded hover:bg-yellow-600 transition"
                        title="Edit"
                        aria-label="Edit"
                      >
                        <FaEdit className="text-xs sm:text-sm" />
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="bg-red-500 text-white p-1 sm:p-2 rounded hover:bg-red-600 transition"
                        title="Delete"
                        aria-label="Delete"
                      >
                        <FaTrash className="text-xs sm:text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500">No questions found.</p>
      )}

      {showEditModal && selectedQuestion && (
        <EditQuestionModal
          isOpen={showEditModal}
          onClose={() => handleCloseModal(false)}
          questionData={selectedQuestion}
          onUpdateSuccess={() => handleCloseModal(true)}
          categories={categories}
          questionLevels={questionLevels}
        />
      )}
    </div>
  );
};
export default QuizBank;
