import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FileViewer = ({ fileUrl, submoduleName }) => {
  const [numPages, setNumPages] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [notebookContent, setNotebookContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Extract file extension and name safely
  const fileExtension = fileUrl?.split('.').pop()?.toLowerCase() || '';
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
      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
    >
      Download File
    </button>
  );

  const renderSubmoduleHeader = () => (
    <div className="text-center mb-6">
      <h2 className="text-2xl font-bold text-gray-800">{submoduleName}</h2>
    </div>
  );

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPdfError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error('PDF load error:', error);
    setPdfError('Failed to load PDF. The file may be corrupted or invalid.');
  };

  // Handle Jupyter Notebook files
  useEffect(() => {
    if (fileExtension === 'ipynb') {
      const loadNotebook = async () => {
        setLoading(true);
        setError(null);
        try {
          // Try to load via nbviewer first for external files
          if (!fileUrl.startsWith('http://localhost') && !fileUrl.startsWith('file://')) {
            return; // Let iframe handle it
          }
          
          // Fallback for local files
          const response = await fetch(fileUrl);
          if (!response.ok) throw new Error('Failed to fetch notebook');
          const notebook = await response.json();
          setNotebookContent(renderNotebook(notebook));
        } catch (err) {
          console.error('Error loading notebook:', err);
          setError('Could not load notebook. ' + err.message);
        } finally {
          setLoading(false);
        }
      };

      loadNotebook();
    }
  }, [fileUrl, fileExtension]);

  const renderNotebook = (notebook) => {
    return (
      <div className="notebook-container p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">{notebook.metadata?.name || 'Jupyter Notebook'}</h2>
        {notebook.cells.map((cell, index) => (
          <div 
            key={index} 
            className={`mb-4 p-3 rounded ${cell.cell_type === 'code' ? 'bg-gray-50' : 'bg-white'}`}
          >
            {cell.cell_type === 'code' ? (
              <>
                <div className="flex items-center bg-gray-200 px-2 py-1 rounded-t">
                  <span className="text-xs font-mono text-gray-600">In [{cell.execution_count || ' '}]:</span>
                </div>
                <pre className="p-2 bg-gray-800 text-gray-100 rounded-b overflow-x-auto">
                  <code>{cell.source.join('')}</code>
                </pre>
                {cell.outputs?.length > 0 && (
                  <div className="mt-2 p-2 bg-white border rounded">
                    <div className="text-xs font-mono text-gray-500 mb-1">Out [{cell.execution_count || ' '}]:</div>
                    {cell.outputs.map((output, i) => (
                      <div key={i} className="font-mono text-sm">
                        {output.data?.['text/plain']?.join('\n') || output.text?.join('\n') || ''}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="prose max-w-none">
                {cell.source.join('').split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Handle image files
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(fileExtension)) {
    return (
      <div className="flex flex-col items-center">
        {renderSubmoduleHeader()}
        <div className="max-w-full max-h-[80vh] overflow-auto">
          <img 
            src={fileUrl} 
            alt={fileName} 
            className="max-w-full max-h-full object-contain"
            onError={() => setIframeKey(prev => prev + 1)}
          />
        </div>
        {renderDownloadButton()}
      </div>
    );
  }

  // Handle PDF files
  if (fileExtension === 'pdf') {
    return (
      <div className="w-full flex flex-col items-center">
        {renderSubmoduleHeader()}
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-md overflow-hidden">
          {pdfError ? (
            <div className="p-8 text-center">
              <div className="text-red-500 mb-4">Error loading PDF</div>
              {renderDownloadButton()}
            </div>
          ) : (
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              }
              error={
                <div className="p-8 text-center text-red-500">
                  Failed to load PDF document
                </div>
              }
            >
              <div className="overflow-y-auto max-h-[80vh]">
                {Array.from(new Array(numPages), (el, index) => (
                  <div key={`page_${index + 1}`} className="mb-4 border-b border-gray-200 last:border-b-0">
                    <Page 
                      pageNumber={index + 1} 
                      width={800}
		      renderTextLayer={false}
                      loading={
                        <div className="flex justify-center items-center h-64">
                          Loading page {index + 1}...
                        </div>
                      }
                    />
                  </div>
                ))}
              </div>
            </Document>
          )}
        </div>
        <div className="mt-4">
          {renderDownloadButton()}
        </div>
      </div>
    );
  }

  // Handle Office files
  if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(fileExtension)) {
    return (
      <div className="w-full h-full flex flex-col">
        {renderSubmoduleHeader()}
        <div className="flex-1">
          <iframe
            key={iframeKey}
            title="Office viewer"
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
            width="100%"
            height="100%"
            frameBorder="0"
            className="border rounded-lg"
            onError={() => setIframeKey(prev => prev + 1)}
          />
        </div>
        <div className="mt-4">
          {renderDownloadButton()}
        </div>
      </div>
    );
  }

  // Handle Jupyter Notebooks
  if (fileExtension === 'ipynb') {
    // Try to use nbviewer for external files
    if (!fileUrl.startsWith('http://localhost') && !fileUrl.startsWith('file://')) {
      return (
        <div className="w-full h-full flex flex-col">
          {renderSubmoduleHeader()}
          <div className="flex-1">
            <iframe
              key={iframeKey}
              src={`https://nbviewer.org/url/${encodeURIComponent(fileUrl)}`}
              width="100%"
              height="100%"
              title="Jupyter Notebook Viewer"
              className="border rounded-lg"
              onError={() => setIframeKey(prev => prev + 1)}
            />
          </div>
          <div className="mt-4">
            {renderDownloadButton()}
          </div>
        </div>
      );
    }

    // Fallback for local files
    return (
      <div className="w-full h-full flex flex-col p-4 overflow-auto">
        {renderSubmoduleHeader()}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center p-8">
            <div className="text-red-500 mb-4">{error}</div>
            {renderDownloadButton()}
          </div>
        ) : (
          <>
            {notebookContent}
            <div className="mt-4">
              {renderDownloadButton()}
            </div>
          </>
        )}
      </div>
    );
  }

  // Handle CSV files
  if (fileExtension === 'csv') {
    return (
      <div className="w-full h-full flex flex-col">
        {renderSubmoduleHeader()}
        <iframe 
          key={iframeKey}
          src={`https://docs.google.com/spreadsheets/d/e/2PACX-1vR9xX9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ/pubhtml?gid=0&single=true&output=csv&url=${encodeURIComponent(fileUrl)}`}
          width="100%"
          height="100%"
          title="CSV Viewer"
          className="border rounded-lg"
          onError={() => setIframeKey(prev => prev + 1)}
        />
        {renderDownloadButton()}
      </div>
    );
  }

  // Default for unsupported files
  return (
    <div className="flex flex-col items-center justify-center p-8">
      {renderSubmoduleHeader()}
      <div className="text-6xl mb-4">📁</div>
      <p className="text-gray-500 mb-6">This file type cannot be previewed</p>
      {renderDownloadButton()}
    </div>
  );
};

export default FileViewer;