import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const FileUploader = ({ selectedFile, onFileSelect }) => {
  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <h3 className="card-title text-lg">4. Upload File</h3>
        <input
          type="file"
          className="file-input file-input-bordered w-full"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) onFileSelect(file);
          }}
        />
        {selectedFile && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="avatar placeholder">
                <div className="bg-neutral text-neutral-content rounded w-12">
                  <span className="text-xs">{selectedFile.name.split('.').pop()}</span>
                </div>
              </div>
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;