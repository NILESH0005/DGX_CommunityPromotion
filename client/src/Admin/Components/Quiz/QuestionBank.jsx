import React, { useState, useEffect, useContext } from "react";
import ApiContext from "../../../context/ApiContext";
import QuizQuestions from "./QuizQuestions";
import Swal from "sweetalert2";
import LoadPage from "../../../component/LoadPage";
import EditQuestionModal from "./EditQuestionModal";

const QuizBank = () => {
  const { fetchData, userToken } = useContext(ApiContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [showQuizQuestions, setShowQuizQuestions] = useState(false);
  const [finalQuestions, setFinalQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [questionLevels, setQuestionLevels] = useState([]);

  const fetchQuestions = async () => {
    setLoading(true);
    const endpoint = "quiz/getQuestion";
    const method = "GET";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    try {
      const [questionsData, categoriesData, levelsData] = await Promise.all([
        fetchData(endpoint, method, {}, headers),
        fetchCategories(),
        fetchQuestionLevels()
      ]);

      if (questionsData.success) {
        const questionMap = new Map();
        
        questionsData.data.quizzes.forEach((quiz) => {
          const questionKey = `${quiz.question_text}_${quiz.id}`;
          const existingQuestion = questionMap.get(questionKey);
          
          if (existingQuestion) {
            const existingAnswers = Array.isArray(existingQuestion.correctAnswer) 
              ? existingQuestion.correctAnswer 
              : [existingQuestion.correctAnswer];
            
            const newAnswers = Array.isArray(quiz.option_text)
              ? quiz.option_text
              : [quiz.option_text];
            
            const combinedAnswers = [...new Set([...existingAnswers, ...newAnswers])];
            
            questionMap.set(questionKey, {
              ...existingQuestion,
              correctAnswer: combinedAnswers,
              id: existingQuestion.id,
              count: existingQuestion.count + (quiz.count || 0),
              images: existingQuestion.images || (quiz.image_url ? [quiz.image_url] : []),
              options: [
                ...(existingQuestion.options || []),
                {
                  option_text: quiz.option_text,
                  is_correct: quiz.is_correct,
                  image: quiz.image_url || null
                }
              ]
            });
          } else {
            questionMap.set(questionKey, {
              id: quiz.id,
              question_id: quiz.id,
              question_text: quiz.question_text,
              correctAnswer: quiz.option_text,
              group: quiz.group_name,
              group_id: quiz.group_id,
              Ques_level: quiz.ddValue,
              count: quiz.count || 0,
              images: quiz.image_url ? [quiz.image_url] : [],
              image: quiz.question_image || null,
              options: [
                {
                  option_text: quiz.option_text,
                  is_correct: quiz.is_correct,
                  image: quiz.image_url || null
                }
              ]
            });
          }
        });

        const mappedQuestions = Array.from(questionMap.values()).map(question => {
          let correctAnswers = question.correctAnswer;
          if (Array.isArray(correctAnswers)) {
            correctAnswers = correctAnswers.join(" | ");
          }
          
          return {
            ...question,
            correctAnswer: correctAnswers
          };
        });

        setFinalQuestions(mappedQuestions);
      } else {
        setError(questionsData.message || "Failed to fetch questions.");
        Swal.fire("Error", questionsData.message || "Failed to fetch questions.", "error");
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      setError("Something went wrong, please try again.");
      Swal.fire("Error", "Something went wrong, please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const endpoint = `dropdown/getQuestionGroupDropdown`;
    const method = "GET";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    try {
      const data = await fetchData(endpoint, method, headers);
      if (data?.success) {
        setCategories(data.data?.sort((a, b) => a.group_name.localeCompare(b.group_name)) || []);
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
      const data = await fetchData(endpoint, method, headers);
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

  const handleDelete = async (questionId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'OK'
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
        Swal.fire("Error", data?.message || "Failed to delete the question.", "error");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      Swal.fire("Error", "Something went wrong, please try again.", "error");
    }
  };

  const handleEdit = (question) => {
    // Transform the question data to match the EditQuestionModal's expected format
    const questionData = {
      question_id: question.id,
      question_text: question.question_text || question.text,
      Ques_level: question.Ques_level || question.level,
      group_id: question.group_id?.toString() || '',
      image: question.image || null,
      options: question.options || [
        { option_text: '', is_correct: 0, image: null },
        { option_text: '', is_correct: 0, image: null }
      ]
    };
    
    setSelectedQuestion(questionData);
    setShowEditModal(true);
  };

  const handleCloseModal = (isUpdated = false) => {
    setShowEditModal(false);
    setSelectedQuestion(null);
    
    if (isUpdated) {
      fetchQuestions(); // Refresh the questions list
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

  const groups = ["All", ...new Set(finalQuestions.map((q) => q.group))];

  const filteredQuestions = finalQuestions.filter((question) => {
    return (
      (selectedGroup === "All" || question.group === selectedGroup) &&
      (question.question_text || question.text).toLowerCase().includes(searchQuery.toLowerCase())
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
                <th className="border p-2">Answer Images</th>
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
                  <td className="border p-2">
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
                  </td>
                  <td className="border p-2 text-center">{q.group}</td>
                  <td className="border p-2 text-center">{q.Ques_level || q.level}</td>
                  <td className="border p-2 text-center">{q.count}</td>
                  <td className="border p-2 space-x-1 text-center">
                    <button
                      onClick={() => handleEdit(q)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition text-sm"
                    >
                      Delete
                    </button>
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
          questionData={selectedQuestion}
          onClose={handleCloseModal}
          onUpdate={() => handleCloseModal(true)}
          categories={categories}
          questionLevels={questionLevels}
        />
      )}
    </div>
  );
};

export default QuizBank;