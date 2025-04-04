import React, { useState, useEffect, useContext } from "react";
import ApiContext from "../../../context/ApiContext";
import QuizQuestions from "./QuizQuestions";
import Swal from "sweetalert2";
import LoadPage from "../../../component/LoadPage";

const QuizBank = () => {
  const { fetchData, userToken } = useContext(ApiContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [showQuizQuestions, setShowQuizQuestions] = useState(false);
  const [finalQuestions, setFinalQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuestions = async () => {
    setLoading(true);
    const endpoint = "quiz/getQuestion";
    const method = "GET";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    try {
      const data = await fetchData(endpoint, method, {}, headers);
      if (data.success) {
        const mappedQuestions = data.data.quizzes.map((quiz) => ({
          id: quiz.id,
          text: quiz.question_text,
          correctAnswer: quiz.option_text,
          group: quiz.group_name,
          level: quiz.ddValue,
          count: quiz.count,
        }));
        setFinalQuestions(mappedQuestions);
      } else {
        setError(data.message || "Failed to fetch questions.");
        Swal.fire("Error", data.message || "Failed to fetch questions.", "error");
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
    if (!questionId) {
      console.error("Question ID is undefined.");
      Swal.fire("Error", "Question ID is missing.", "error");
      return;
    }

    const endpoint = "quiz/deleteQuestion";
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };
    const body = { id: questionId };

    try {
      const data = await fetchData(endpoint, method, body, headers);
      if (data?.success) {
        setFinalQuestions((prevQuestions) =>
          prevQuestions.filter((q) => q.id !== questionId)
        );
        Swal.fire("Success", "Question deleted successfully.", "success");
      } else {
        Swal.fire("Error", data?.message || "Failed to delete the question.", "error");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      Swal.fire("Error", "Something went wrong, please try again.", "error");
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const groups = ["All", ...new Set(finalQuestions.map((q) => q.group))];

  const filteredQuestions = finalQuestions.filter((question) => {
    return (
      (selectedGroup === "All" || question.group === selectedGroup) &&
      question.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (showQuizQuestions) {
    return <QuizQuestions onBackToBank={() => setShowQuizQuestions(false)} />;
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
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-DGXgreen">
              <th className="border p-2">#</th>
              <th className="border p-2">Question</th>
              <th className="border p-2">Correct Answer</th>
              <th className="border p-2">Group</th>
              <th className="border p-2">Level</th>
              <th className="border p-2">Count</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.map((q, index) => (
              <tr key={q.id} className="text-center">
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">{q.text}</td>
                <td className="border p-2">{q.correctAnswer}</td>
                <td className="border p-2">{q.group}</td>
                <td className="border p-2">{q.level}</td>
                <td className="border p-2">{q.count}</td>
                <td className="border p-2 flex justify-center">
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-center text-gray-500">No questions found.</p>
      )}
    </div>
  );
};

export default QuizBank;