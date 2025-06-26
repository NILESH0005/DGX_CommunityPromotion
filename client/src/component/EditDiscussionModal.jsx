import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const EditDiscussionModal = ({ 
  isOpen, 
  onRequestClose, 
  discussion, 
  onUpdate 
}) => {
  const [title, setTitle] = useState(discussion?.Title || '');
  const [content, setContent] = useState(discussion?.Content || '');
  const [tags, setTags] = useState(discussion?.Tag || '');
  const [links, setLinks] = useState(discussion?.ResourceUrl || '');
  const [privacy, setPrivacy] = useState(discussion?.Visibility || 'private');
  const [errors, setErrors] = useState({
    title: '',
    content: '',
    tags: '',
    links: '',
    privacy: ''
  });

  useEffect(() => {
    if (discussion) {
      setTitle(discussion.Title);
      setContent(discussion.Content);
      setTags(discussion.Tag);
      setLinks(discussion.ResourceUrl);
      setPrivacy(discussion.Visibility);
    }
  }, [discussion]);

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      title: '',
      content: '',
      tags: '',
      links: '',
      privacy: ''
    };

    if (!title.trim()) {
      newErrors.title = 'Title is required';
      valid = false;
    }

    if (!content.trim() || content === '<p><br></p>') {
      newErrors.content = 'Content is required';
      valid = false;
    }

    if (!tags.trim()) {
      newErrors.tags = 'At least one tag is required';
      valid = false;
    }

    if (!links.trim()) {
      newErrors.links = 'At least one link is required';
      valid = false;
    }

    if (!privacy || privacy === '') {
      newErrors.privacy = 'Please select a privacy option';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const updatedDiscussion = {
      ...discussion,
      Title: title,
      Content: content,
      Tag: tags,
      ResourceUrl: links,
      Visibility: privacy
    };

    onUpdate(updatedDiscussion);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Discussion</h2>
          <button 
            onClick={onRequestClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.title ? 'border-red-500' : ''
              }`}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors({ ...errors, title: '' });
              }}
            />
            {errors.title && (
              <p className="text-red-500 text-xs italic">{errors.title}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              className={`border rounded-lg ${
                errors.content ? 'border-red-500' : ''
              }`}
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  ['blockquote', 'code-block'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['link', 'formula'],
                  ['clean'],
                ],
              }}
            />
            {errors.content && (
              <p className="text-red-500 text-xs italic">{errors.content}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Tags <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.tags ? 'border-red-500' : ''
              }`}
              value={tags}
              onChange={(e) => {
                setTags(e.target.value);
                setErrors({ ...errors, tags: '' });
              }}
              placeholder="Separate tags with commas"
            />
            {errors.tags && (
              <p className="text-red-500 text-xs italic">{errors.tags}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Links <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.links ? 'border-red-500' : ''
              }`}
              value={links}
              onChange={(e) => {
                setLinks(e.target.value);
                setErrors({ ...errors, links: '' });
              }}
              placeholder="Separate links with commas"
            />
            {errors.links && (
              <p className="text-red-500 text-xs italic">{errors.links}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Privacy <span className="text-red-500">*</span>
            </label>
            <select
              value={privacy}
              onChange={(e) => {
                setPrivacy(e.target.value);
                setErrors({ ...errors, privacy: '' });
              }}
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.privacy ? 'border-red-500' : ''
              }`}
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
            {errors.privacy && (
              <p className="text-red-500 text-xs italic">{errors.privacy}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg"
              onClick={onRequestClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDiscussionModal;