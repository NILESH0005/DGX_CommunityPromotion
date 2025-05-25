import React, { useEffect, useState } from 'react';

export default function ByteArrayImage({ byteArray, className }) {
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    if (!byteArray) return;
    try {
      // Handle both direct arrays and Buffer objects
      const bytes = Array.isArray(byteArray) ? byteArray :
        (byteArray.type === 'Buffer' ? byteArray.data : null);

      if (!bytes || bytes.length === 0) return;

      const binary = bytes.map(b => String.fromCharCode(b)).join('');
      const base64 = window.btoa(binary);
      setImageSrc(`data:image/jpeg;base64,${base64}`);
    } catch (error) {
      console.error('Image processing error:', error);
    }
    console.log("Triggered");

  }, [byteArray]);


  if (!imageSrc) {
    return (
      <div className="flex items-center justify-center text-gray-400 text-sm h-full">
        {byteArray ? 'Loading image...' : 'No Image'}
      </div>
    );
  } else {
    const unwanted = "dataimage/jpegbase64";
    if (imageSrc.includes(unwanted)) {
      setImageSrc(imageSrc.replace(unwanted, ''))
    }
  }

  return (
    <img
      src={imageSrc}
      alt="Content"
      className={className || "w-full h-full object-cover"}
    onError={() => setImageSrc(null)}
    />
  );
}