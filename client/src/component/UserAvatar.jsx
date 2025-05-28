import React, { useState, useContext, useRef } from 'react';
import { images } from '../../public/index.js';
import { FaCamera, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import ApiContext from '../context/ApiContext.jsx';
import Swal from 'sweetalert2';

const UserAvatar = ({ user, onImageUpdate }) => {
  const { userToken, fetchData, setUser } = useContext(ApiContext);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const getProfileImageUrl = () => {
    // First show preview if available
    if (previewImage) return previewImage;
    
    // Then show user's profile picture with cache busting
    if (user?.ProfilePicture) {
      // Check if URL already has query params
      const separator = user.ProfilePicture.includes('?') ? '&' : '?';
      return `${user.ProfilePicture}${separator}ts=${Date.now()}`;
    }
    
    // Fallback to default image
    return images.defaultProfile;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File',
        text: 'Only JPG, PNG, and WEBP images are allowed',
      });
      return;
    }

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'Image size should be less than 5MB',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target.result);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to process the image',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveAvatar = async () => {
    if (isLoading || !previewImage) return;
    
    setIsLoading(true);
    
    try {
      // Convert base64 to blob if needed
      let imageToUpload = previewImage;
      if (previewImage.startsWith('data:')) {
        const blob = await fetch(previewImage).then(r => r.blob());
        imageToUpload = blob;
      }

      const formData = new FormData();
      formData.append('profileImage', imageToUpload);

      const response = await fetchData('userprofile/updateProfilePicture', 'POST', formData, {
        'auth-token': userToken
      });

      if (response?.success) {
        // Ensure we have the full URL
        let imageUrl = response.data.imageUrl;
        if (!imageUrl.startsWith('http')) {
          imageUrl = `${process.env.REACT_APP_API_URL}/${imageUrl}`;
        }

        // Update user context
        if (setUser) {
          setUser(prev => ({
            ...prev,
            ProfilePicture: imageUrl
          }));
        }
        
        // Clear preview
        setPreviewImage(null);
        
        // Notify parent if needed
        if (onImageUpdate) {
          onImageUpdate(imageUrl);
        }
        
        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Profile image updated successfully!',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        throw new Error(response?.message || 'Failed to update profile image');
      }
    } catch (error) {
      console.error('Error saving profile image:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to update profile image',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-DGXwhite w-full rounded-lg shadow-xl pb-6 border border-DGXgreen transition-all duration-300 hover:shadow-lg">
      <div className="w-full h-[250px] rounded-t-lg overflow-hidden relative">
        <img 
          src={images.NvidiaBackground} 
          className="w-full h-full object-cover"
          alt="Profile background" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
      </div>
      
      <div className="flex flex-col items-center -mt-20 px-4">
        <div className="relative group mb-4">
          <div className="w-40 h-40 border-4 border-white rounded-full overflow-hidden bg-gray-100 shadow-lg relative">
            <img 
              src={getProfileImageUrl()} 
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              alt="User profile"
              onError={(e) => {
                e.target.src = images.defaultProfile;
              }}
              key={user?.ProfilePicture ? `img-${Date.now()}` : 'default-img'}
            />
            
            <div 
              className={`absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-full transition-all duration-300 ${previewImage ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} cursor-pointer`}
              onClick={triggerFileInput}
            >
              <FaCamera className="text-2xl text-white mb-1" />
              <span className="text-white text-sm font-medium">
                {previewImage ? 'Change Photo' : 'Upload Photo'}
              </span>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg, image/png, image/webp"
            className="hidden"
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{user?.Name || 'User'}</h2>
          <p className="text-DGXgray font-medium">{user?.Designation || ''}</p>
          <p className="text-sm text-gray-500">{user?.EmailId || ''}</p>
        </div>

        <div className="w-full max-w-md space-y-4">
          {previewImage && (
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => setPreviewImage(null)}
                disabled={isLoading}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 flex items-center disabled:opacity-50 transition-colors"
              >
                <FaTimes className="mr-2" />
                Cancel
              </button>
              <button 
                onClick={saveAvatar}
                disabled={isLoading}
                className="px-6 py-2 bg-DGXgreen text-white rounded-full hover:bg-DGXdarkgreen flex items-center disabled:opacity-50 transition-colors shadow-md"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaCheck className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAvatar;