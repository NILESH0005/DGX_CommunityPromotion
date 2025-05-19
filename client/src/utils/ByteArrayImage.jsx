import React, { useEffect, useState } from 'react';

export default function ByteArrayImage({ byteArray }) {
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    if (!byteArray || !Array.isArray(byteArray)) return;

    const blob = new Blob([new Uint8Array(byteArray)], { type: 'image/jpeg' });
    const reader = new FileReader();

    reader.onloadend = () => setImageSrc(reader.result);
    reader.readAsDataURL(blob);
  }, [byteArray]);

  if (!imageSrc) return <p>Loading image...</p>;

  return <img src={imageSrc} alt="Image from byte array" />;
}
