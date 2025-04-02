import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import ApiContext from "../../../context/ApiContext";
import { useContext } from "react";

const EditQuizModal = ({ quiz, onClose, categories, quizLevels }) => {
  const { fetchData, userToken } = useContext(ApiContext);
  const [formData, setFormData] = useState({
    QuizID: '',
    QuizCategory: '',
    QuizName: '',
    QuizLevel: '',
    QuizDuration: '',
    NegativeMarking: false,
    StartDateAndTime: '',
    EndDateTime: '',
    QuizVisibility: 'Public',
    AuthLstEdit: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (quiz) {
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const adjustedDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
        return format(adjustedDate, "yyyy-MM-dd'T'HH:mm");
      };

      setFormData({
        QuizID: quiz.QuizID,
        QuizCategory: quiz.QuizCategory,
        QuizName: quiz.QuizName,
        QuizLevel: quiz.QuizLevel,
        QuizDuration: quiz.QuizDuration,
        NegativeMarking: quiz.NegativeMarking || false,
        StartDateAndTime: formatDateForInput(quiz.StartDateAndTime),
        EndDateTime: formatDateForInput(quiz.EndDateTime),
        QuizVisibility: quiz.QuizVisibility || 'Public',
        AuthLstEdit: userToken
      });
    }
  }, [quiz, userToken]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const endpoint = "quiz/updateQuiz";
      const method = "POST";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };
  
      // Format dates for SQL Server
      const formattedData = {
        ...formData,
        StartDateAndTime: new Date(formData.StartDateAndTime).toISOString(),
        EndDateTime: new Date(formData.EndDateTime).toISOString()
      };
  
      const response = await fetchData(endpoint, method, formattedData, headers);
      
      if (response.success) {
        Swal.fire({
          title: 'Success!',
          text: 'Quiz updated successfully',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          onClose(true, formattedData);
        });
      } else {
        Swal.fire({
          title: 'Error!',
          text: response.message || 'Failed to update quiz',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error('Error updating quiz:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Something went wrong while updating the quiz',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Quiz</h2>
          <button 
            onClick={() => onClose(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input type="hidden" name="QuizID" value={formData.QuizID} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quiz Category*
              </label>
              <select
                name="QuizCategory"
                value={formData.QuizCategory}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.group_id} value={category.group_id}>
                    {category.group_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quiz Name*
              </label>
              <input
                type="text"
                name="QuizName"
                value={formData.QuizName}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quiz Level*
              </label>
              <select
                name="QuizLevel"
                value={formData.QuizLevel}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Level</option>
                {quizLevels.map(level => (
                  <option key={level.idCode} value={level.idCode}>
                    {level.ddValue}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)*
              </label>
              <input
                type="number"
                name="QuizDuration"
                value={formData.QuizDuration}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                min="1"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="NegativeMarking"
                checked={formData.NegativeMarking}
                onChange={handleChange}
                className="mr-2"
                id="negativeMarking"
              />
              <label htmlFor="negativeMarking" className="text-sm font-medium text-gray-700">
                Negative Marking
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visibility*
              </label>
              <select
                name="QuizVisibility"
                value={formData.QuizVisibility}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date & Time*
              </label>
              <input
                type="datetime-local"
                name="StartDateAndTime"
                value={formData.StartDateAndTime}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date & Time*
              </label>
              <input
                type="datetime-local"
                name="EndDateTime"
                value={formData.EndDateTime}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuizModal;