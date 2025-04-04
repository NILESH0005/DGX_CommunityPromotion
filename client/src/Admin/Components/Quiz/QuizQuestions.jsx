import React, { useState, useEffect, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { FiUpload, FiTrash2, FiPlus, FiX } from "react-icons/fi";
import QuizQuestionTable from "./QuizQuestionTable";
import ApiContext from "../../../context/ApiContext";

const QuizQuestions = ({ onBackToBank }) => {
  const { userToken, fetchData } = useContext(ApiContext);
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [group, setGroup] = useState("General");
  const [image, setImage] = useState(null);
  const [optionImages, setOptionImages] = useState([null, null, null, null]);
  const [categories, setCategories] = useState([]);
  const [questionLevels, setQuestionLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [questionType, setQuestionType] = useState("single");

  useEffect(() => {
    const fetchQuizCategories = async () => {
      const endpoint = `dropdown/getQuestionGroupDropdown`;
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

    const fetchQuestionLevels = async () => {
      const endpoint = `dropdown/getDropdownValues?category=questionLevel`;
      const method = "GET";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };

      try {
        const data = await fetchData(endpoint, method, headers);
        if (data.success) {
          setQuestionLevels(data.data);
        } else {
          Swal.fire("Error", "Failed to fetch question levels.", "error");
        }
      } catch (error) {
        console.error("Error fetching question levels:", error);
        Swal.fire("Error", "Error fetching question levels.", "error");
      }
    };

    fetchQuizCategories();
    fetchQuestionLevels();
  }, [userToken, fetchData]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire("Error", "Image size must be less than 2 MB.", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleOptionImageUpload = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire("Error", "Image size must be less than 2 MB.", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const newOptionImages = [...optionImages];
        newOptionImages[index] = reader.result;
        setOptionImages(newOptionImages);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const removeOptionImage = (index) => {
    const newOptionImages = [...optionImages];
    newOptionImages[index] = null;
    setOptionImages(newOptionImages);
  };

  const handleAddOption = () => {
    setOptions([...options, ""]);
    setOptionImages([...optionImages, null]);
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);

      const newOptionImages = [...optionImages];
      newOptionImages.splice(index, 1);
      setOptionImages(newOptionImages);

      const newCorrectAnswers = correctAnswers
        .filter((answer) => answer !== index)
        .map((answer) => (answer > index ? answer - 1 : answer));
      setCorrectAnswers(newCorrectAnswers);
    } else {
      Swal.fire("Error", "You must have at least 2 options!", "error");
    }
  };

  const handleAnswerSelection = (index) => {
    if (questionType === "single") {
      setCorrectAnswers([index]);
    } else {
      const newCorrectAnswers = [...correctAnswers];
      if (newCorrectAnswers.includes(index)) {
        newCorrectAnswers.splice(newCorrectAnswers.indexOf(index), 1);
      } else {
        newCorrectAnswers.push(index);
      }
      setCorrectAnswers(newCorrectAnswers);
    }
  };

  const handleCreateQuestion = async () => {
    if (!questionText.trim()) {
      Swal.fire("Error", "Please enter a question!", "error");
      return;
    }
    if (options.length < 2) {
      Swal.fire("Error", "You must have at least 2 answer options!", "error");
      return;
    }
    if (options.some(opt => !opt.trim())) {
      Swal.fire("Error", "All options must have text!", "error");
      return;
    }
    if (correctAnswers.length === 0) {
      Swal.fire("Error", "Please select at least one correct answer!", "error");
      return;
    }
    if (questionType === "multiple" && correctAnswers.length < 2) {
      Swal.fire("Error", "Multiple choice questions require at least 2 correct answers!", "error");
      return;
    }

    const questionData = {
      question_text: questionText,
      Ques_level: selectedLevel,
      question_type: questionType,
      image: image,
      group_id: group,
      options: options.map((option, index) => ({
        option_text: option,
        is_correct: correctAnswers.includes(index),
        image: optionImages[index],
      })),
    };

    try {
      const endpoint = "quiz/createQuestion";
      const method = "POST";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };
      const body = questionData;

      const response = await fetchData(endpoint, method, body, headers);
      if (response && response.success) {
        Swal.fire("Success", "Question added successfully!", "success");
        setQuestionText("");
        setOptions(["", "", "", ""]);
        setCorrectAnswers([]);
        setGroup("General");
        setImage(null);
        setOptionImages([null, null, null, null]);
        setSelectedLevel("");
      } else {
        Swal.fire("Error", response?.message || "Failed to add question.", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire("Error", "Something went wrong, please try again.", "error");
    }
  };

  const handleDelete = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
    Swal.fire("Deleted", "Question removed successfully!", "success");
  };

  const handleEdit = (id) => {
    const question = questions.find((q) => q.id === id);
    setQuestionText(question.text);
    setOptions(question.options);
    setCorrectAnswers(question.correctAnswers);
    setGroup(question.group);
    setImage(question.image || null);
    setOptionImages(question.optionImages || [null, null, null, null]);
    setQuestions(questions.filter((q) => q.id !== id));
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center bg-gray-50 p-3 rounded-lg">
        Create Quiz Question
      </h2>

     
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Group Selection */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold mb-2 pb-1 border-b border-blue-200 text-blue-700">
            Question Group
          </h3>
          <select
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-base"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
          >
            <option value="">Select Group</option>
            {categories.map((cat) => (
              <option key={cat.group_id} value={cat.group_id}>
                {cat.group_name}
              </option>
            ))}
          </select>
        </div>

        {/* Question Level */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold mb-2 pb-1 border-b border-blue-200 text-blue-700">
            Question Level
          </h3>
          <select
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-base"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            <option value="">Select Question Level</option>
            {questionLevels.map((level) => (
              <option key={level.idCode} value={level.idCode}>
                {level.ddValue}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Question Type */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
        <h3 className="text-lg font-bold mb-2 pb-1 border-b border-blue-200 text-blue-700">
          Question Type
        </h3>
        <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              className="w-4 h-4 text-blue-600"
              checked={questionType === "single"}
              onChange={() => setQuestionType("single")}
            />
            <span className="text-base">Single Choice</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              className="w-4 h-4 text-blue-600"
              checked={questionType === "multiple"}
              onChange={() => setQuestionType("multiple")}
            />
            <span className="text-base">Multiple Choice</span>
          </label>
        </div>
      </div>

      {/* Question Text */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
        <h3 className="text-lg font-bold mb-2 pb-1 border-b border-blue-200 text-blue-700">
          Question Text
        </h3>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-base"
          placeholder="Enter your question..."
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
        />
      </div>

      {/* Question Image */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
        <h3 className="text-lg font-bold mb-2 pb-1 border-b border-blue-200 text-blue-700">
          Question Image (Optional)
        </h3>
        <label className="flex items-center justify-center space-x-2 cursor-pointer bg-gray-50 p-3 rounded border border-dashed border-gray-300 hover:border-blue-500 transition-colors">
          <FiUpload className="text-blue-500" size={20} />
          <span className="text-blue-500 font-medium text-base">Upload Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>

        {image && (
          <div className="mt-3 relative flex justify-center items-center border border-gray-200 rounded overflow-hidden max-w-3xl mx-auto bg-gray-50 p-3">
            <img
              src={image}
              alt="Preview"
              className="w-full h-auto max-h-[40vh] object-contain"
            />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors"
            >
              <FiX size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Options Section */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-3 pb-1 border-b border-blue-200">
          <h3 className="text-lg font-bold text-blue-700">Answer Options</h3>
          <button
            onClick={handleAddOption}
            className="flex items-center space-x-1 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors text-base"
          >
            <FiPlus size={16} />
            <span>Add Option</span>
          </button>
        </div>

        <div className="space-y-3 max-h-[calc(100vh-800px)] overflow-y-auto">
          {options.map((option, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="flex items-center space-x-2">
                  <input
                    type={questionType === "single" ? "radio" : "checkbox"}
                    checked={correctAnswers.includes(index)}
                    onChange={() => handleAnswerSelection(index)}
                    className={`w-4 h-4 cursor-pointer ${questionType === "single" ? "text-blue-600" : "accent-blue-500"}`}
                    name={questionType === "single" ? "correctAnswer" : undefined}
                  />
                  <label className="text-base font-medium w-4">
                    {String.fromCharCode(65 + index)}
                  </label>
                </div>

                <input
                  type="text"
                  className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...options];
                    newOptions[index] = e.target.value;
                    setOptions(newOptions);
                  }}
                />

                <div className="flex items-center space-x-2">
                  <label className="flex items-center space-x-1 cursor-pointer bg-gray-200 p-1 rounded hover:bg-gray-300 transition-colors">
                    <FiUpload className="text-blue-500" size={16} />
                    <span className="hidden sm:inline text-xs">Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleOptionImageUpload(e, index)}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={() => handleRemoveOption(index)}
                    className="flex items-center justify-center bg-red-500 text-white p-1 rounded hover:bg-red-600 transition-colors"
                    disabled={options.length <= 2}
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>

              {optionImages[index] && (
                <div className="mt-2 relative flex justify-center items-center bg-white p-2 rounded border border-gray-200">
                  <img
                    src={optionImages[index]}
                    alt="Option Preview"
                    className="max-w-full h-24 object-contain"
                  />
                  <button
                    onClick={() => removeOptionImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-6">
        <button
          onClick={handleCreateQuestion}
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors text-base font-semibold shadow"
        >
          Create Question
        </button>
        <button
          onClick={onBackToBank}
          className="bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600 transition-colors text-base font-semibold shadow"
        >
          Go to Question Bank
        </button>
      </div>

      <QuizQuestionTable
        questions={questions}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
    </div>
  );
};

export default QuizQuestions;