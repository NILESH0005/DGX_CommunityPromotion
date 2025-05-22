import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FileViewer = ({ fileUrl }) => {
    const [numPages, setNumPages] = useState(null);
    const fileExtension = fileUrl.split('.').pop().toLowerCase();
    const fileName = fileUrl.split('/').pop();

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

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExtension)) {
        return (
            <div>
                <img src={fileUrl} alt="Uploaded file" className="w-full max-w-md" />
                {renderDownloadButton()}
            </div>
        );
    }

    if (fileExtension === 'pdf') {
        return (
            <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-8">
                <div className="max-w-4xl w-full bg-white shadow-lg rounded-xl p-4 overflow-auto">
                    <Document
                        file={fileUrl}
                        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                        className="flex flex-col items-center"
                    >
                        {Array.from(new Array(numPages), (_, index) => (
                            <Page
                                key={index}
                                pageNumber={index + 1}
                                width={800} // 👈 Adjust width for visibility and layout
                            />
                        ))}
                    </Document>

                    <div className="mt-4 flex justify-center">
                        {renderDownloadButton()}
                    </div>
                </div>
            </div>


        );
    }

    if (['doc', 'docx', 'ppt', 'pptx'].includes(fileExtension)) {
        return (
            <div>
                <iframe
                    title="Office viewer"
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
                    width="100%"
                    height="600px"
                    frameBorder="0"
                />
                {renderDownloadButton()}
            </div>
        );
    }

    if (fileExtension === 'csv') {
        return (
            <div>
                <iframe src={fileUrl} width="100%" height="600px" title="CSV Viewer" />
                {renderDownloadButton()}
            </div>
        );
    }

    if (fileExtension === 'ipynb') {
        return (
            <div>
                <iframe
                    src={`https://nbviewer.org/url/${encodeURIComponent(fileUrl)}`}
                    width="100%"
                    height="600px"
                    title="Jupyter Notebook Viewer"
                />
                {renderDownloadButton()}
            </div>
        );
    }

    return (
        <div>
            <p>File preview not supported.</p>
            {renderDownloadButton()}
        </div>
    );
};

export default FileViewer;
