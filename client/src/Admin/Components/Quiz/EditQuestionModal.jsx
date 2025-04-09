import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export const EditQuestionModal = ({
  isOpen,
  onClose,
  questionData,
  onUpdateSuccess,
  categories,
  questionLevels,
  userToken,
  quizId // Receive the quiz ID from parent
}) => {
  const [formData, setFormData] = useState({
    question_id: quizId || '', // Use the quiz ID here
    question_text: '',
    Ques_level: '',
    group_id: '',
    image: null,
    question_type: 0,
    options: [
      { option_text: '', is_correct: 0, image: null },
      { option_text: '', is_correct: 0, image: null }
    ],
    AuthLstEdit: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (questionData) {
      // Transform the incoming data to match our form structure
      const transformedData = {
        question_id: quizId || questionData.question_id || questionData.id,
        question_text: questionData.question_text,
        Ques_level: questionData.Ques_level,
        group_id: questionData.group_id?.toString(),
        image: questionData.image,
        question_type: questionData.question_type || 0,
        options: questionData.options || [
          { option_text: '', is_correct: 0, image: null },
          { option_text: '', is_correct: 0, image: null }
        ],
        AuthLstEdit: ''
      };

      setFormData(transformedData);
      if (questionData.image) {
        setImagePreview(questionData.image);
      }
    }
  }, [questionData, quizId]); // Include quizId in dependencies

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...formData.options];
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: field === 'is_correct' ? (value === '1' ? 1 : 0) : value
    };
    
    setFormData(prev => ({
      ...prev,
      options: updatedOptions
    }));
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [
        ...prev.options,
        { option_text: '', is_correct: 0, image: null }
      ]
    }));
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) {
      Swal.fire('Warning', 'You must have at least 2 options', 'warning');
      return;
    }
    
    const updatedOptions = formData.options.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      options: updatedOptions
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    setImagePreview(null);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.question_text.trim()) {
      newErrors.question_text = 'Question text is required';
    }
    
    if (!formData.group_id) {
      newErrors.group_id = 'Group is required';
    }
    
    if (formData.options.length < 2) {
      newErrors.options = 'At least 2 options are required';
    } else {
      formData.options.forEach((option, index) => {
        if (!option.option_text.trim()) {
          newErrors[`option_${index}`] = 'Option text is required';
        }
      });
      
      const hasCorrectAnswer = formData.options.some(opt => opt.is_correct === 1);
      if (!hasCorrectAnswer) {
        newErrors.correctAnswer = 'At least one correct answer is required';
      }
      
      if (formData.question_type === 1) {
        const correctCount = formData.options.filter(opt => opt.is_correct === 1).length;
        if (correctCount < 2) {
          newErrors.correctAnswer = 'Multiple choice requires at least 2 correct answers';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const payload = {
        ...formData,
        AuthLstEdit: 'current_user' // You might want to get this from context or props
      };
      
      // Convert options to the required format
      payload.options = formData.options.map(opt => ({
        option_text: opt.option_text,
        is_correct: opt.is_correct,
        image: opt.image
      }));
      
      const response = await fetch('http://localhost:8000/quiz/updateQuestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': userToken
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.success) {
        Swal.fire('Success', 'Question updated successfully!', 'success');
        onUpdateSuccess();
      } else {
        Swal.fire('Error', data.message || 'Failed to update question', 'error');
      }
    } catch (error) {
      console.error('Error updating question:', error);
      Swal.fire('Error', 'An error occurred while updating the question', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Edit Question</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-4">
                {/* Question Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Text <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="question_text"
                    value={formData.question_text}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                  {errors.question_text && (
                    <p className="text-red-500 text-xs mt-1">{errors.question_text}</p>
                  )}
                </div>
                
                {/* Question Group */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Group <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="group_id"
                    value={formData.group_id}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a group</option>
                    {categories?.map((category) => (
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
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a level</option>
                    {questionLevels?.map((level) => (
                      <option key={level.ddValue} value={level.ddValue}>
                        {level.ddValue}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Question Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Type
                  </label>
                  <select
                    name="question_type"
                    value={formData.question_type}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="0">Single Correct Answer</option>
                    <option value="1">Multiple Correct Answers</option>
                  </select>
                </div>
              </div>
              
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Question preview" 
                        className="max-h-48 mx-auto mb-2"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-center mb-2">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Drag and drop your image here, or click to browse</p>
                    </div>
                  )}
                  <input
                    type="file"
                    id="question-image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="question-image"
                    className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
                  >
                    Choose Image
                  </label>
                </div>
              </div>
            </div>
            
            {/* Options Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-gray-800">
                  Answer Options <span className="text-red-500">*</span>
                </h3>
                <button
                  type="button"
                  onClick={addOption}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                >
                  Add Option
                </button>
              </div>
              
              {errors.options && (
                <p className="text-red-500 text-xs mb-2">{errors.options}</p>
              )}
              {errors.correctAnswer && (
                <p className="text-red-500 text-xs mb-2">{errors.correctAnswer}</p>
              )}
              
              <div className="space-y-3">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <input
                          type={formData.question_type === '1' ? 'checkbox' : 'radio'}
                          name="correct_option"
                          checked={option.is_correct === 1}
                          onChange={() => handleOptionChange(
                            index, 
                            'is_correct', 
                            option.is_correct === 1 ? '0' : '1'
                          )}
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <span className="text-sm text-gray-700">
                          {formData.question_type === '1' ? 'Correct' : 'Correct Answer'}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={option.option_text}
                        onChange={(e) => handleOptionChange(index, 'option_text', e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors[`option_${index}`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`option_${index}`]}</p>
                      )}
                    </div>
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="bg-red-500 text-white p-2 rounded hover:bg-red-600 mt-5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : 'Update Question'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditQuestionModal;