import React, { useEffect, useState } from 'react';

const ByteArrayImage = ({ byteArray, className }) => {
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    if (!byteArray) {
      setImageSrc(null);
      return;
    }

    try {
      // Handle both direct base64 strings and Buffer objects
      if (typeof byteArray === 'string') {
        // If it's already a base64 string
        setImageSrc(`data:image/jpeg;base64,${byteArray}`);
      } else if (byteArray.data) {
        // If it's an object with data property
        setImageSrc(`data:image/jpeg;base64,${byteArray.data}`);
      } else if (Array.isArray(byteArray) ){
        // Handle array of bytes
        const binary = byteArray.map(b => String.fromCharCode(b)).join('');
        const base64 = window.btoa(binary);
        setImageSrc(`data:image/jpeg;base64,${base64}`);
      } else if (byteArray.type === 'Buffer') {
        // Handle Node.js Buffer object
        const binary = String.fromCharCode.apply(null, byteArray.data);
        const base64 = window.btoa(binary);
        setImageSrc(`data:image/jpeg;base64,${base64}`);
      }
    } catch (error) {
      console.error('Image processing error:', error);
      setImageSrc(null);
    }
  }, [byteArray]);

  if (!imageSrc) {
    return (
      <div className="flex items-center justify-center text-gray-400 text-sm h-full">
        No Image
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt="Module content"
      className={className || "w-full h-full object-cover"}
      onError={() => setImageSrc(null)}
    />
  );
};

export default ByteArrayImage;