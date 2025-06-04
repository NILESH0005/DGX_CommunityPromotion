import React, { useState, useEffect, useContext } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import QuizHeader from "./QuizHeader";
import QuizPalette from "./QuizPalette";
import ApiContext from "../../context/ApiContext";
import Loader from "../LoadPage";
import Swal from "sweetalert2";

const Quiz = () => {
  const { quizId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const quiz = location.state?.quiz || {};

  const STORAGE_KEY = `quiz_attempt_${quiz.QuizID}`;
  const { userToken, fetchData } = useContext(ApiContext);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [timer, setTimer] = useState({ hours: 0, minutes: 30, seconds: 0 });
  const [questionStatus, setQuestionStatus] = useState({});

  const loadSavedAnswers = () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      return savedData ? JSON.parse(savedData) : null;
    } catch (error) {
      console.error("Failed to load saved answers:", error);
      return null;
    }
  };

  const saveAnswersToStorage = (answers) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch (error) {
      console.error("Failed to save answers:", error);
    }
  };

  const clearAnswerFromStorage = (questionIndex) => {
    const savedData = loadSavedAnswers();
    if (savedData) {
      const updatedAnswers = savedData.answers.map((answer, idx) =>
        idx === questionIndex ? null : answer
      );
      saveAnswersToStorage({
        ...savedData,
        answers: updatedAnswers,
      });
    }
  };

  const [selectedAnswers, setSelectedAnswers] = useState([]);


  useEffect(() => {
    // console.log("Current quiz data:", quiz); 

    if (!quiz?.QuizID) {
      setError("Quiz ID is missing");
      setLoading(false);
      return;
    }

    if (!quiz?.group_id) {
      setError("Group ID is missing");
      setLoading(false);
      return;
    }

    if (userToken) {
      fetchQuizQuestions();
    }
  }, [quiz, userToken]);


 

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY) {
        console.log("LocalStorage updated:", e);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [STORAGE_KEY]);

  // const fetchQuizQuestions = async () => {
  //   setLoading(true);
  //   setError(null);

  //   try {

  //     if (!userToken) {
  //       throw new Error("Authentication token is missing");
  //     }

  //     const endpoint = "quiz/getQuizQuestions";
  //     const method = "POST";
  //     const headers = {
  //       "Content-Type": "application/json",
  //       "auth-token": userToken,
  //     };
  //     const body = {
  //       quizGroupID: quiz.group_id,
  //       QuizID: quiz.QuizID
  //     };

  //     const data = await fetchData(endpoint, method, body, headers);
  //     console.log("ddddaaatttaaa", data);

  //     if (!data) {
  //       throw new Error("No data received from server");
  //     }

  //     if (data.success) {
  //       const transformedQuestions = transformQuestions(data.data.questions);
  //       setQuestions(transformedQuestions);

  //       const saved = loadSavedAnswers();
  //       setSelectedAnswers(saved?.answers || Array(transformedQuestions.length).fill(null));

  //       if (transformedQuestions.length > 0) {
  //         const duration = transformedQuestions[0].duration || 30;
  //         const hours = Math.floor(duration / 60);
  //         const minutes = duration % 60;
  //         setTimer({ hours, minutes, seconds: 0 });
  //       }

  //       // const initialSelectedAnswers = Array(transformedQuestions.length).fill(null);
  //       const initialQuestionStatus = transformedQuestions.reduce((acc, _, index) => {
  //         acc[index + 1] = "not-visited";
  //         return acc;
  //       }, {});

  //       // setSelectedAnswers(initialSelectedAnswers);
  //       setQuestionStatus(initialQuestionStatus);
  //     } else {
  //       throw new Error(data.message || "Failed to fetch questions");
  //     }
  //   } catch (err) {
  //     console.error("Error fetching questions:", err);
  //     setError(err.message || "Something went wrong, please try again.");
  //     Swal.fire({
  //       icon: 'error',
  //       title: 'Error',
  //       text: err.message || "Failed to load questions",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };



  const fetchQuizQuestions = async (quizData) => {
    setLoading(true);
    setError(null);
    console.log();
    

    try {
      console.log("Fetching questions with:", {
        quizGroupID: quizData.group_id,
        QuizID: quizData.QuizID
      });

      const data = await fetchData(
        "quiz/getQuizQuestions",
        "POST",
        {
          quizGroupID: quizData.group_id,
          QuizID: quizData.QuizID
        },
        {
          "Content-Type": "application/json",
          "auth-token": userToken,
        }
      );

      console.log("API Response:", data);

      if (!data) {
        throw new Error("No data received from server");
      }

      if (data.success) {
        const transformedQuestions = transformQuestions(data.data.questions);
        setQuestions(transformedQuestions);

        const saved = loadSavedAnswers();
        setSelectedAnswers(saved?.answers || Array(transformedQuestions.length).fill(null));

        // Initialize timer and question status
        if (transformedQuestions.length > 0) {
          const duration = transformedQuestions[0].duration || quizData.duration || 30;
          const hours = Math.floor(duration / 60);
          const minutes = duration % 60;
          setTimer({ hours, minutes, seconds: 0 });
        }

        const initialQuestionStatus = transformedQuestions.reduce((acc, _, index) => {
          acc[index + 1] = "not-visited";
          return acc;
        }, {});

        setQuestionStatus(initialQuestionStatus);
      } else {
        throw new Error(data.message || "Failed to fetch questions");
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError(err.message || "Failed to load questions");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to load questions",
      });
    } finally {
      setLoading(false);
    }
  };

  const transformQuestions = (apiQuestions) => {
    return apiQuestions.map((item) => {
      // First ensure options have proper IDs
      const optionsWithIds = item.options.map((option, index) => ({
        ...option,
        id: option.id ? Number(option.id) : index + 1, // Fallback to index if ID is missing
      }));

      // Then find correct answers
      const correctAnswers = optionsWithIds
        .filter(
          (option) => option.is_correct === true || option.is_correct === 1
        )
        .map((option) => Number(option.id));

      return {
        id: Number(item.QuestionsID),
        question_text: item.QuestionTxt,
        totalMarks: Number(item.totalMarks) || 1,
        negativeMarks: Number(item.negativeMarks) || 0,
        duration: Number(item.QuizDuration) || 30,
        options: optionsWithIds,
        correctAnswers,
      };
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        let { hours, minutes, seconds } = prev;

        if (hours === 0 && minutes === 0 && seconds === 0) {
          clearInterval(interval);
          handleTimeUp();
          return prev;
        }

        if (seconds === 0) {
          if (minutes === 0) {
            hours -= 1;
            minutes = 59;
          } else {
            minutes -= 1;
          }
          seconds = 59;
        } else {
          seconds -= 1;
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleTimeUp = async () => {
    await Swal.fire({
      title: "Time Up!",
      text: "Your time for this quiz has ended.",
      icon: "warning",
      confirmButtonText: "Submit Now",
    });
    handleQuizSubmit();
  };

  const handleNavigation = (nextQuestion) => {
    if (
      selectedAnswers[currentQuestion] === null &&
      questionStatus[currentQuestion + 1] === "not-visited"
    ) {
      setQuestionStatus((prev) => ({
        ...prev,
        [currentQuestion + 1]: "not-answered",
      }));
    }
    setCurrentQuestion(nextQuestion);
  };
  const handleAnswerClick = (selectedOptionId) => {
    const optionId = Number(selectedOptionId); // Ensure numeric ID
    const currentQuestionData = questions[currentQuestion];

    if (!currentQuestionData) return;

    console.log("Current question options:", currentQuestionData.options);
    console.log("Selected option ID:", optionId);

    const selectedOption = currentQuestionData.options.find(
      (opt) => Number(opt.id) === optionId
    );

    if (!selectedOption) {
      console.error("Option not found");
      return;
    }

    const isCorrect = currentQuestionData.correctAnswers.includes(optionId);

    const newAnswer = {
      questionId: currentQuestionData.id,
      questionText: currentQuestionData.question_text,
      selectedOptionId: optionId, // Use the numeric ID
      selectedOptionText: selectedOption.option_text,
      isCorrect,
      marksAwarded: isCorrect
        ? currentQuestionData.totalMarks
        : -currentQuestionData.negativeMarks,
      maxMarks: currentQuestionData.totalMarks,
      negativeMarks: currentQuestionData.negativeMarks,
      correctAnswers: currentQuestionData.correctAnswers
        .map(
          (id) =>
            currentQuestionData.options.find(
              (opt) => Number(opt.id) === Number(id)
            )?.option_text
        )
        .filter(Boolean),
    };

    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = newAnswer;
    setSelectedAnswers(newAnswers);

    setQuestionStatus((prev) => ({
      ...prev,
      [currentQuestion + 1]: "answered",
    }));

    saveAnswersToStorage({
      quizId: quiz.QuizID,
      groupId: quiz.group_id,
      answers: newAnswers,
    });
  };

  const handleSaveAndNext = () => {
    if (currentQuestion + 1 < questions.length) {
      handleNavigation(currentQuestion + 1);
    } else {
      handleQuizSubmit();
    }
  };

  const handleClearResponse = () => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = null;
    setSelectedAnswers(newAnswers);
    setQuestionStatus((prev) => ({
      ...prev,
      [currentQuestion + 1]: "not-answered",
    }));
    clearAnswerFromStorage(currentQuestion);
  };

  const handleSkip = () => {
    if (currentQuestion + 1 < questions.length) {
      handleNavigation(currentQuestion + 1);
    } else {
      setShowScore(true);
    }
  };

  const handleMarkForReview = () => {
    setQuestionStatus((prev) => ({ ...prev, [currentQuestion + 1]: "marked" }));
    handleSkip();
  };

  const handleQuizSubmit = async () => {
    if (!userToken) {
      Swal.fire({
        icon: "error",
        title: "Authentication Error",
        text: "Please login to submit the quiz",
      });
      return;
    }

    const savedData = loadSavedAnswers();
    if (!savedData) {
      Swal.fire({
        icon: "error",
        title: "Submission Error",
        text: "No quiz data found to submit",
      });
      return;
    }

    const validAnswers = selectedAnswers.filter((answer) => answer !== null);

    const correctCount = validAnswers.filter(
      (answer) => answer.isCorrect
    ).length;
    const incorrectCount = validAnswers.filter(
      (answer) => !answer.isCorrect
    ).length;
    const attemptedCount = validAnswers.length;

    const positiveMarks = validAnswers.reduce(
      (sum, answer) => sum + (answer.isCorrect ? answer.marksAwarded : 0),
      0
    );

    const negativeMarks = validAnswers.reduce(
      (sum, answer) =>
        sum + (!answer.isCorrect ? Math.abs(answer.marksAwarded) : 0),
      0
    );

    const totalScore = positiveMarks - negativeMarks;

    const result = await Swal.fire({
      title: "Are you sure?",
      html: `<p class="mt-4">You won't be able to change your answers after submission!</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes!",
    });

    if (!result.isConfirmed) {
      return;
    }

    const swalInstance = Swal.fire({
      title: "Submitting...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      setSubmitting(true);
      setSubmitError(null);

      const endpoint = "quiz/submitQuiz";
      const method = "POST";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };

      const preparedAnswers = savedData.answers
        .filter((a) => a !== null)
        .map((answer) => ({
          questionId: Number(answer.questionId),
          selectedOptionId: Number(answer.selectedOptionId),
          isCorrect: Boolean(answer.isCorrect),
          marksAwarded: Number(answer.marksAwarded),
          maxMarks: Number(answer.maxMarks),
          negativeMarks: Number(answer.negativeMarks),
        }));

      const body = {
        quizId: Number(savedData.quizId),
        groupId: Number(savedData.groupId),
        answers: preparedAnswers,
      };

      const data = await fetchData(endpoint, method, body, headers);

      if (!data.success) {
        throw new Error(data.message || "Submission failed");
      }

      setSubmitSuccess(true);
      localStorage.removeItem(STORAGE_KEY);

      await swalInstance.close();

      navigate("/quiz-result", {
        state: {
          quiz: quiz,
          score: data.data?.totalScore || totalScore, // Use server score if available, otherwise use local calculation
          totalQuestions: questions.length,
          answers: selectedAnswers.filter((a) => a !== null),
          correctAnswers: correctCount,
          incorrectAnswers: incorrectCount,
          attemptedCount: attemptedCount,
          positiveMarks: positiveMarks,
          negativeMarks: negativeMarks,
          timeTaken: `${timer.hours}h ${timer.minutes}m ${timer.seconds}s`,
          serverData: data.data,
        },
      });
    } catch (error) {
      console.error("Quiz submission error:", error);
      setSubmitError(error.message);

      await swalInstance.close();

      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: error.message || "Failed to submit quiz. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={fetchQuizQuestions}
            className="mt-4 bg-DGXblue text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <p className="text-lg">No questions available for this quiz.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 container mx-auto px-4 py-6">
        <h1 className="text-3xl font-medium text-center mb-6">{quiz.title}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 border border-gray-300 rounded-md">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border-b border-gray-300">
              <div className="flex items-center gap-4">
                <span className="text-gray-700">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <div className="w-32 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-blue-500 rounded-full"
                    style={{
                      width: `${
                        ((currentQuestion + 1) / questions.length) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 items-center mt-2 md:mt-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    +{questions[currentQuestion]?.totalMarks || 1}
                  </span>
                  <span className="text-green-600 font-medium">Correct</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    -{questions[currentQuestion]?.negativeMarks || 0}
                  </span>
                  <span className="text-red-600 font-medium">Wrong</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-b border-gray-300">
              <p className="text-lg mb-6">
                {questions[currentQuestion]?.question_text}
              </p>
              <div className="space-y-2">
                {questions[currentQuestion]?.options?.map((option) => {
                  const optionId = Number(option.id); // Ensure numeric ID
                  const isSelected =
                    Number(
                      selectedAnswers[currentQuestion]?.selectedOptionId
                    ) === optionId;

                  return (
                    <label
                      key={optionId}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition
          ${
            isSelected
              ? "bg-blue-100 border-2 border-blue-500"
              : "hover:bg-gray-50 border border-transparent"
          }`}
                    >
                      <input
                        type="radio"
                        name={`answer-${currentQuestion}`}
                        checked={isSelected}
                        onChange={() => handleAnswerClick(optionId)}
                        className="w-4 h-4"
                      />
                      <span>{option.option_text}</span>
                      {isSelected && (
                        <span className="ml-auto text-blue-600">
                          {selectedAnswers[currentQuestion]?.isCorrect
                            ? "✓"
                            : "✗"}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between p-4">
              <div className="flex gap-2">
                {currentQuestion > 0 && (
                  <button
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                    onClick={() => handleNavigation(currentQuestion - 1)}
                  >
                    Previous
                  </button>
                )}
                <button
                  className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition"
                  onClick={handleMarkForReview}
                >
                  Mark for Review
                </button>
                <button
                  className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition"
                  onClick={handleClearResponse}
                >
                  Clear
                </button>
              </div>
              <button
                className={`px-6 py-2 text-white rounded transition
                    ${
                      currentQuestion + 1 === questions.length
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                onClick={handleSaveAndNext}
              >
                {currentQuestion + 1 === questions.length
                  ? "Submit Quiz"
                  : "Next"}
              </button>
            </div>
          </div>

          <QuizPalette
            questionStatus={questionStatus}
            currentQuestion={currentQuestion}
            setCurrentQuestion={(index) => handleNavigation(index)}
            timer={timer}
            totalQuestions={questions.length}
          />
        </div>
      </div>
    </div>
  );
};

export default Quiz;
