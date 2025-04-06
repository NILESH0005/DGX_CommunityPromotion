import React, { useState, useEffect, useContext } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import {
  FiUpload,
  FiTrash2,
  FiPlus,
  FiX,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import ApiContext from "../../../context/ApiContext";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          Something went wrong. Please try again.
        </div>
      );
    }

    return this.props.children;
  }
}

const EditQuestionModal = ({ questionData, onClose, onUpdate, categories: propCategories, questionLevels: propLevels }) => {
  const { userToken, fetchData, user } = useContext(ApiContext);
  const [formData, setFormData] = useState({
    question_id: '',
    question_text: '',
    Ques_level: '',
    group_id: '',
    image: null,
    question_type: 'single',
    options: [
      { option_text: '', is_correct: 0, image: null },
      { option_text: '', is_correct: 0, image: null }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState(propCategories || []);
  const [questionLevels, setQuestionLevels] = useState(propLevels || []);
  const [expandedSections, setExpandedSections] = useState({
    settings: true,
    question: true,
    options: true,
  });

  useEffect(() => {
    // Initialize form data with questionData when it changes
    if (questionData) {
      const initializeFormData = () => {
        try {
          const safeOptions = Array.isArray(questionData.options) 
            ? questionData.options.map(opt => ({
                option_text: opt?.option_text || '',
                is_correct: opt?.is_correct || 0,
                image: opt?.image || null
              }))
            : [
                { option_text: '', is_correct: 0, image: null },
                { option_text: '', is_correct: 0, image: null }
              ];

          const correctAnswersCount = safeOptions.filter(opt => opt.is_correct).length;

          setFormData({
            question_id: questionData.question_id || '',
            question_text: questionData.question_text || '',
            Ques_level: questionData.Ques_level || '',
            group_id: questionData.group_id?.toString() || '',
            image: questionData.image || null,
            question_type: correctAnswersCount > 1 ? 'multiple' : 'single',
            options: safeOptions
          });
        } catch (error) {
          console.error("Error initializing form data:", error);
          // Fallback to default values if initialization fails
          setFormData({
            question_id: '',
            question_text: '',
            Ques_level: '',
            group_id: '',
            image: null,
            question_type: 'single',
            options: [
              { option_text: '', is_correct: 0, image: null },
              { option_text: '', is_correct: 0, image: null }
            ]
          });
        }
      };

      initializeFormData();
    }
  }, [questionData]);

  useEffect(() => {
    // Fetch categories if not provided via props
    const fetchQuizCategories = async () => {
      if (propCategories && propCategories.length > 0) return;
      
      try {
        const endpoint = `dropdown/getQuestionGroupDropdown`;
        const method = "GET";
        const headers = {
          "Content-Type": "application/json",
          "auth-token": userToken,
        };

        const data = await fetchData(endpoint, method, headers);
        if (data?.success) {
          setCategories(data.data?.sort((a, b) => a.group_name.localeCompare(b.group_name)) || []);
        }
      } catch (error) {
        console.error("Error fetching quiz categories:", error);
      }
    };

    // Fetch question levels if not provided via props
    const fetchQuestionLevels = async () => {
      if (propLevels && propLevels.length > 0) return;

      try {
        const endpoint = `dropdown/getDropdownValues?category=questionLevel`;
        const method = "GET";
        const headers = {
          "Content-Type": "application/json",
          "auth-token": userToken,
        };

        const data = await fetchData(endpoint, method, headers);
        if (data?.success) {
          setQuestionLevels(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching question levels:", error);
      }
    };

    fetchQuizCategories();
    fetchQuestionLevels();
  }, [userToken, fetchData, propCategories, propLevels]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire("Error", "Image size must be less than 2 MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({
        ...prev,
        image: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleOptionImageUpload = (event, index) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire("Error", "Image size must be less than 2 MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const newOptions = [...formData.options];
      newOptions[index].image = reader.result;
      setFormData(prev => ({
        ...prev,
        options: newOptions
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
  };

  const removeOptionImage = (index) => {
    const newOptions = [...formData.options];
    newOptions[index].image = null;
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const handleAddOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [
        ...prev.options,
        { option_text: '', is_correct: 0, image: null }
      ]
    }));
  };

  const handleRemoveOption = (index) => {
    if (formData.options.length <= 2) {
      Swal.fire("Error", "You must have at least 2 options!", "error");
      return;
    }

    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const handleAnswerSelection = (index) => {
    const newOptions = [...formData.options];
    
    if (formData.question_type === 'single') {
      newOptions.forEach((opt, i) => {
        opt.is_correct = i === index ? 1 : 0;
      });
    } else {
      newOptions[index].is_correct = newOptions[index].is_correct ? 0 : 1;
    }
    
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.question_text?.trim()) {
      newErrors.question_text = 'Question text is required';
      isValid = false;
    }

    if (!formData.group_id) {
      newErrors.group_id = 'Question group is required';
      isValid = false;
    }

    const validOptions = formData.options.filter(opt => opt.option_text.trim() !== '');
    if (validOptions.length < 2) {
      newErrors.options = 'At least 2 valid options are required';
      isValid = false;
    }

    const correctCount = formData.options.filter(opt => opt.is_correct).length;
    if (correctCount === 0) {
      newErrors.correctAnswers = 'At least one correct answer is required';
      isValid = false;
    } else if (formData.question_type === 'multiple' && correctCount < 2) {
      newErrors.correctAnswers = 'Multiple choice requires at least 2 correct answers';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleClose = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You have unsaved changes that will be lost.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, discard changes',
      cancelButtonText: 'No, keep editing'
    }).then((result) => {
      if (result.isConfirmed) {
        onClose();
      }
    });
  };

 // EditQuestionModal.js
 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  if (!validateForm()) {
    Swal.fire({
      title: 'Validation Error',
      text: 'Please fix the errors before submitting',
      icon: 'error',
      confirmButtonText: 'OK'
    });
    setLoading(false);
    return;
  }

  try {
    const endpoint = "quiz/updateQuestion";
    const method = "PUT";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    // Prepare payload with only valid options
    const payload = {
      ...formData,
      group_id: Number(formData.group_id) || 0,
      options: formData.options
        .filter(opt => opt.option_text.trim() !== '')
        .map(opt => ({
          ...opt,
          option_text: opt.option_text.trim()
        })),
      AuthLstEdit: user?.username || 'Unknown'
    };

    const response = await fetchData(endpoint, method, payload, headers);
    
    if (response?.success) {
      await Swal.fire({
        title: 'Success!',
        text: 'Question updated successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      onUpdate();
      onClose();
    } else {
      throw new Error(response?.message || 'Failed to update question');
    }
  } catch (error) {
    console.error('Error updating question:', error);
    Swal.fire({
      title: 'Error!',
      text: error.message || 'Something went wrong while updating the question',
      icon: 'error',
      confirmButtonText: 'OK'
    });
  } finally {
    setLoading(false);
  }
}; 

  return (
    <ErrorBoundary>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-2xl font-bold">Edit Question</h2>
            <button 
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              disabled={loading}
            >
              <FiX size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex-1 overflow-y-auto space-y-4 p-4">
              {/* Settings Section */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div
                  className="flex justify-between items-center p-4 cursor-pointer"
                  onClick={() => toggleSection("settings")}
                >
                  <h3 className="text-lg font-bold text-blue-700">
                    Question Settings
                  </h3>
                  {expandedSections.settings ? <FiChevronUp /> : <FiChevronDown />}
                </div>

                {expandedSections.settings && (
                  <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Group Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question Group*
                      </label>
                      <select
                        name="group_id"
                        value={formData.group_id}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                        disabled={loading}
                        required
                      >
                        <option value="">Select Group</option>
                        {categories.map(category => (
                          <option key={category.group_id} value={category.group_id}>
                            {category.group_name}
                          </option>
                        ))}
                      </select>
                      {errors.group_id && (
                        <p className="text-red-500 text-xs mt-1">{errors.group_id}</p>
                      )}
                    </div>

                    {/* Question Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question Level
                      </label>
                      <select
                        name="Ques_level"
                        value={formData.Ques_level}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                        disabled={loading}
                      >
                        <option value="">Select Level</option>
                        {questionLevels.map(level => (
                          <option key={level.idCode} value={level.idCode}>
                            {level.ddValue}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Question Type */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Type
                      </label>
                      <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="question_type"
                            value="single"
                            checked={formData.question_type === 'single'}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600"
                            disabled={loading}
                          />
                          <span className="text-sm">Single Choice</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="question_type"
                            value="multiple"
                            checked={formData.question_type === 'multiple'}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600"
                            disabled={loading}
                          />
                          <span className="text-sm">Multiple Choice</span>
                        </label>
                      </div>
                      {errors.correctAnswers && (
                        <p className="text-red-500 text-xs mt-1">{errors.correctAnswers}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Question Section */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div
                  className="flex justify-between items-center p-4 cursor-pointer"
                  onClick={() => toggleSection("question")}
                >
                  <h3 className="text-lg font-bold text-blue-700">
                    Question Content
                  </h3>
                  {expandedSections.question ? <FiChevronUp /> : <FiChevronDown />}
                </div>

                {expandedSections.question && (
                  <div className="p-4 pt-0 space-y-4">
                    {/* Question Text */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question Text*
                      </label>
                      <textarea
                        name="question_text"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm min-h-[80px]"
                        placeholder="Enter your question..."
                        value={formData.question_text}
                        onChange={handleChange}
                        disabled={loading}
                        required
                      />
                      {errors.question_text && (
                        <p className="text-red-500 text-xs mt-1">{errors.question_text}</p>
                      )}
                    </div>

                    {/* Question Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question Image (Optional)
                      </label>
                      <label className={`flex items-center justify-center space-x-2 cursor-pointer bg-gray-50 p-2 rounded border border-dashed border-gray-300 hover:border-blue-500 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <FiUpload className="text-blue-500" size={16} />
                        <span className="text-blue-500 font-medium text-sm">
                          Upload Image
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={loading}
                        />
                      </label>

                      {formData.image && (
                        <div className="mt-2 relative flex justify-center items-center border border-gray-200 rounded overflow-hidden bg-gray-50 p-2">
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="max-w-full h-auto max-h-[200px] object-contain"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors"
                            disabled={loading}
                          >
                            <FiX size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Options Section */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div
                  className="flex justify-between items-center p-4 cursor-pointer"
                  onClick={() => toggleSection("options")}
                >
                  <h3 className="text-lg font-bold text-blue-700">Answer Options</h3>
                  {expandedSections.options ? <FiChevronUp /> : <FiChevronDown />}
                </div>

                {expandedSections.options && (
                  <div className="p-4 pt-0 space-y-3">
                    {errors.options && (
                      <p className="text-red-500 text-sm mb-2">{errors.options}</p>
                    )}

                    <div className="flex justify-end mb-2">
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className={`flex items-center space-x-1 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loading}
                      >
                        <FiPlus size={14} />
                        <span>Add Option</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {formData.options.map((option, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 p-2 rounded border border-gray-200"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <div className="flex items-center space-x-2 min-w-[120px]">
                              <input
                                type={formData.question_type === 'single' ? 'radio' : 'checkbox'}
                                checked={option.is_correct}
                                onChange={() => handleAnswerSelection(index)}
                                className={`w-4 h-4 cursor-pointer ${
                                  formData.question_type === 'single'
                                    ? 'text-blue-600'
                                    : 'accent-blue-500'
                                }`}
                                name={formData.question_type === 'single' ? 'correctAnswer' : undefined}
                                disabled={loading}
                              />
                              <label className="text-sm font-medium">
                                {String.fromCharCode(65 + index)}
                              </label>
                            </div>

                            <input
                              type="text"
                              className={`flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm ${loading ? 'bg-gray-100' : ''}`}
                              placeholder={`Option ${String.fromCharCode(65 + index)}`}
                              value={option.option_text}
                              onChange={(e) => {
                                const newOptions = [...formData.options];
                                newOptions[index].option_text = e.target.value;
                                setFormData(prev => ({
                                  ...prev,
                                  options: newOptions
                                }));
                              }}
                              disabled={loading}
                              required
                            />

                            <div className="flex items-center space-x-1">
                              <label className={`flex items-center space-x-1 cursor-pointer bg-gray-200 p-1 rounded hover:bg-gray-300 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <FiUpload className="text-blue-500" size={14} />
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleOptionImageUpload(e, index)}
                                  className="hidden"
                                  disabled={loading}
                                />
                              </label>

                              <button
                                type="button"
                                onClick={() => handleRemoveOption(index)}
                                className={`flex items-center justify-center bg-red-500 text-white p-1 rounded hover:bg-red-600 transition-colors ${loading || formData.options.length <= 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={loading || formData.options.length <= 2}
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          </div>

                          {option.image && (
                            <div className="mt-2 relative flex justify-center items-center bg-white p-1 rounded border border-gray-200">
                              <img
                                src={option.image}
                                alt="Option Preview"
                                className="max-w-full h-20 object-contain"
                              />
                              <button
                                type="button"
                                onClick={() => removeOptionImage(index)}
                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                                disabled={loading}
                              >
                                <FiX size={10} />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition disabled:bg-gray-200 disabled:text-gray-500"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center justify-center disabled:bg-blue-300 min-w-[150px]"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : 'Update Question'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default EditQuestionModal;