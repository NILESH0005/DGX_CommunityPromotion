import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FileViewer = ({ fileUrl }) => {
    const [numPages, setNumPages] = useState(null);
    const fileExtension = fileUrl?.split('.').pop().toLowerCase() || '';
    const fileName = fileUrl?.split('/').pop() || 'file';

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderDownloadButton = () => (
        <button
            onClick={handleDownload}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
            Download
        </button>
    );

    // Handle case when no file is selected
    if (!fileUrl) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                Select a file to view its content
            </div>
        );
    }

    // Handle PDF files
    if (fileExtension === 'pdf') {
        return (
            <div className="w-full h-full flex flex-col items-center bg-gray-50">
                <div className="w-full h-full bg-white overflow-auto">
                    <Document
                        file={fileUrl}
                        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                        className="w-full"
                    >
                        {Array.from(new Array(numPages), (_, index) => (
                            <Page
                                key={`page_${index + 1}`}
                                pageNumber={index + 1}
                                width={800}
                                className="mx-auto my-4"
                            />
                        ))}
                    </Document>
                </div>
                <div className="mt-4">
                    {renderDownloadButton()}
                </div>
            </div>
        );
    }

    // Handle PowerPoint files
    if (['ppt', 'pptx'].includes(fileExtension)) {
        return (
            <div className="w-full h-full flex flex-col">
                <iframe
                    title="PowerPoint Viewer"
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    className="flex-grow"
                />
                <div className="mt-4">
                    {renderDownloadButton()}
                </div>
            </div>
        );
    }

    // Handle Jupyter Notebook files
    if (fileExtension === 'ipynb') {
        return (
            <div className="w-full h-full flex flex-col">
                <iframe
                    src={`/api/notebook-to-html?url=${encodeURIComponent(fileUrl)}`} width="100%"
                    height="100%"
                    title="Jupyter Notebook Viewer"
                    className="flex-grow"
                />
                <div className="mt-4">
                    {renderDownloadButton()}
                </div>
            </div>
        );
    }

    // For unsupported file types
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold mb-2">{fileName}</h3>
            <p className="text-gray-500 mb-6">This file type cannot be previewed</p>
            {renderDownloadButton()}
        </div>
    );
};

export default FileViewer;