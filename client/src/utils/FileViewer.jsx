import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import { Parser as HtmlToReactParser } from "html-to-react";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PowerPointRenderer = ({ arrayBuffer }) => {
  const [error, setError] = useState(null);

  const handleDownload = () => {
    const blob = new Blob([arrayBuffer], {
      type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "presentation.pptx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gray-100 rounded-lg">
      <div className="text-6xl mb-4">📊</div>
      <h3 className="text-xl font-semibold mb-2">PowerPoint Presentation</h3>
      <p className="text-gray-500 mb-6">
        This file can't be previewed directly. Please download to view.
      </p>
      <button
        onClick={handleDownload}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        Download PowerPoint
      </button>
    </div>
  );
};

const FileViewer = ({ fileUrl, className = "" }) => {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfError, setPdfError] = useState(null);
  const [notebookContent, setNotebookContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [pdfScale, setPdfScale] = useState(1.2);
  const htmlToReactParser = new HtmlToReactParser();

  const fileExtension = fileUrl?.split(".").pop()?.toLowerCase() || "";
  const fileName = fileUrl?.split("/").pop() || "file";

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderDownloadButton = () => (
    <button
      onClick={handleDownload}
      className="absolute top-4 right-4 z-10 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      Download
    </button>
  );

  const renderPdfControls = () => (
    <div className="sticky top-0 z-20 bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage <= 1}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {numPages}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, numPages))}
          disabled={currentPage >= numPages}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setPdfScale(prev => Math.max(prev - 0.2, 0.5))}
          className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          -
        </button>
        <span className="text-sm text-gray-600 min-w-12 text-center">
          {Math.round(pdfScale * 100)}%
        </span>
        <button
          onClick={() => setPdfScale(prev => Math.min(prev + 0.2, 3))}
          className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          +
        </button>
      </div>
    </div>
  );

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPdfError(null);
    setCurrentPage(1);
  };

  const onDocumentLoadError = (error) => {
    console.error("PDF load error:", error);
    setPdfError("Failed to load PDF. The file may be corrupted or invalid.");
  };

  const processDocx = async (arrayBuffer) => {
    try {
      const result = await mammoth.convertToHtml({ arrayBuffer });

      const customStyles = `
        <style>
          .docx-wrapper {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .docx-wrapper table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
          }
          .docx-wrapper table, .docx-wrapper th, .docx-wrapper td {
            border: 1px solid #ddd;
          }
          .docx-wrapper th, .docx-wrapper td {
            padding: 8px;
            text-align: left;
          }
          .docx-wrapper img {
            max-width: 100%;
            height: auto;
          }
          .docx-wrapper ul, .docx-wrapper ol {
            padding-left: 2em;
          }
          .docx-wrapper h1, .docx-wrapper h2, .docx-wrapper h3 {
            margin-top: 1.5em;
            margin-bottom: 0.5em;
          }
        </style>
      `;

      const htmlWithStyles = `${customStyles}<div class="docx-wrapper">${result.value}</div>`;
      return htmlToReactParser.parse(htmlWithStyles);
    } catch (err) {
      console.error("Error processing DOCX:", err);
      throw err;
    }
  };

  const processPptx = async (arrayBuffer) => {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <PowerPointRenderer arrayBuffer={arrayBuffer} />
      </div>
    );
  };

  const processXlsx = async (arrayBuffer) => {
    try {
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const html = XLSX.utils.sheet_to_html(worksheet, {
        editable: false,
        header: "",
        footer: "",
      });

      const customStyles = `
        <style>
          .xlsx-wrapper {
            overflow-x: auto;
            font-family: Arial, sans-serif;
            max-width: 100%;
            margin: 0 auto;
            padding: 20px;
          }
          .xlsx-wrapper table {
            border-collapse: collapse;
            width: 100%;
            min-width: 600px;
          }
          .xlsx-wrapper th, .xlsx-wrapper td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            white-space: nowrap;
          }
          .xlsx-wrapper th {
            background-color: #f2f2f2;
            font-weight: bold;
            position: sticky;
            top: 0;
            z-index: 1;
          }
          .xlsx-wrapper tr:nth-child(even) {
            background-color: #f9f9f9;
          }
        </style>
      `;

      const htmlWithStyles = `${customStyles}<div class="xlsx-wrapper">${html}</div>`;
      return htmlToReactParser.parse(htmlWithStyles);
    } catch (err) {
      console.error("Error processing XLSX:", err);
      throw err;
    }
  };

  const processTextFile = async (arrayBuffer) => {
    try {
      const text = new TextDecoder().decode(arrayBuffer);
      return (
        <div className="w-full max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
          <pre className="whitespace-pre-wrap font-mono text-sm overflow-x-auto">{text}</pre>
        </div>
      );
    } catch (err) {
      console.error("Error processing text file:", err);
      throw err;
    }
  };

  useEffect(() => {
    if (!fileUrl) return;

    const loadFileContent = async () => {
      setLoading(true);
      setError(null);
      setFileContent(null);
      setFileType(null);
      setFileData(null);

      try {
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("Failed to fetch file");

        const arrayBuffer = await response.arrayBuffer();
        setFileData(arrayBuffer);
        const fileType = fileExtension;

        if (fileType === "ipynb") {
          const notebook = JSON.parse(new TextDecoder().decode(arrayBuffer));
          setNotebookContent(renderNotebook(notebook));
          setFileType("ipynb");
        } else if (fileType === "docx") {
          const content = await processDocx(arrayBuffer);
          setFileContent(content);
          setFileType("docx");
        } else if (fileType === "pptx") {
          const content = await processPptx(arrayBuffer);
          setFileContent(content);
          setFileType("pptx");
        } else if (["xlsx", "xls"].includes(fileType)) {
          const content = await processXlsx(arrayBuffer);
          setFileContent(content);
          setFileType("xlsx");
        } else if (["txt", "csv", "json", "js", "ts", "html", "css", "py", "java", "cpp", "c", "md"].includes(fileType)) {
          const content = await processTextFile(arrayBuffer);
          setFileContent(content);
          setFileType("text");
        } else {
          setFileType("other");
        }
      } catch (err) {
        console.error("Error loading file:", err);
        setError("Could not load file. " + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadFileContent();
  }, [fileUrl, fileExtension]);

  const renderNotebook = (notebook) => {
    return (
      <div className="notebook-container bg-white rounded-lg shadow" style={{ minWidth: "800px" }}>
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">
            {notebook.metadata?.name || "Jupyter Notebook"}
          </h2>
          {notebook.metadata?.kernelspec && (
            <div className="text-sm text-gray-500 mt-1">
              Kernel: {notebook.metadata.kernelspec.display_name || "Python"}
            </div>
          )}
        </div>

        <div className="divide-y divide-gray-200">
          {notebook.cells.map((cell, index) => (
            <div
              key={index}
              className={`p-4 ${
                cell.cell_type === "code" ? "bg-gray-50" : "bg-white"
              }`}
            >
              {cell.cell_type === "code" ? (
                <div className="space-y-2">
                  <div className="flex items-center bg-gray-200 px-3 py-1 rounded-t text-sm font-mono text-gray-700">
                    <span>In [{cell.execution_count || " "}]:</span>
                  </div>
                  <pre className="m-0 p-3 bg-gray-800 text-gray-100 rounded-b overflow-x-auto">
                    <code className="font-mono text-sm">
                      {cell.source.join("")}
                    </code>
                  </pre>
                  {cell.outputs?.length > 0 && (
                    <div className="mt-2 p-3 bg-white border border-gray-200 rounded">
                      <div className="text-xs font-mono text-gray-500 mb-1">
                        Out [{cell.execution_count || " "}]:
                      </div>
                      {cell.outputs.map((output, i) => (
                        <div
                          key={i}
                          className="font-mono text-sm whitespace-pre-wrap"
                        >
                          {output.data?.["text/plain"]?.join("\n") ||
                            output.text?.join("\n") ||
                            (output.data?.["image/png"] ? (
                              <img
                                src={`data:image/png;base64,${output.data["image/png"]}`}
                                alt="Output plot"
                                className="max-w-full"
                              />
                            ) : (
                              ""
                            ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="prose max-w-none">
                  <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                    {cell.source.join("")}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!fileUrl) {
    return (
      <div
        className={`flex items-center justify-center h-full text-gray-500 ${className}`}
      >
        Select a file to view its content
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        {renderDownloadButton()}
        <div className="flex flex-col items-center justify-center p-8 h-full">
          <div className="text-red-500 mb-4">{error}</div>
        </div>
      </div>
    );
  }

  // Image files
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(fileExtension)) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        {renderDownloadButton()}
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg p-4 overflow-auto">
          <img
            src={fileUrl}
            alt={fileName}
            className="max-w-full max-h-full object-contain rounded shadow-sm"
            onError={() => setError("Failed to load image")}
          />
        </div>
      </div>
    );
  }

  // PDF files - Enhanced with scrollable view and controls
  if (fileExtension === "pdf") {
    return (
      <div className={`relative w-full h-full ${className}`}>
        {renderDownloadButton()}
        <div className="w-full h-full bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
          {pdfError ? (
            <div className="p-8 text-center h-full flex flex-col items-center justify-center">
              <div className="text-red-500 mb-4">Error loading PDF</div>
              <div className="text-gray-500">{pdfError}</div>
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
              {numPages && renderPdfControls()}
              <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-white shadow-lg">
                    <Page
                      pageNumber={currentPage}
                      scale={pdfScale}
                      renderTextLayer={false}
                      renderAnnotationLayer={true}
                      loading={
                        <div className="flex justify-center items-center h-96 w-full">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                      }
                    />
                  </div>
                </div>
              </div>
            </Document>
          )}
        </div>
      </div>
    );
  }

  // DOCX files
  if (fileType === "docx") {
    return (
      <div className={`relative w-full h-full ${className}`}>
        {renderDownloadButton()}
        <div className="w-full h-full overflow-auto bg-white rounded-lg shadow-md">
          <div className="p-4">
            {fileContent}
          </div>
        </div>
      </div>
    );
  }

  // XLSX files
  if (fileType === "xlsx") {
    return (
      <div className={`relative w-full h-full ${className}`}>
        {renderDownloadButton()}
        <div className="w-full h-full overflow-auto bg-white rounded-lg shadow-md">
          <div className="p-4">
            {fileContent}
          </div>
        </div>
      </div>
    );
  }

  // Text files
  if (fileType === "text") {
    return (
      <div className={`relative w-full h-full ${className}`}>
        {renderDownloadButton()}
        <div className="w-full h-full overflow-auto bg-white rounded-lg shadow-md">
          <div className="p-4">
            {fileContent}
          </div>
        </div>
      </div>
    );
  }

  // PowerPoint files
  if (fileType === "pptx") {
    return (
      <div className={`relative w-full h-full ${className}`}>
        {renderDownloadButton()}
        <div className="w-full h-full overflow-auto bg-white rounded-lg shadow-md">
          <div className="p-4">
            {fileContent}
          </div>
        </div>
      </div>
    );
  }

  // Jupyter Notebook files
  if (fileType === "ipynb") {
    return (
      <div className={`relative w-full h-full ${className}`}>
        {renderDownloadButton()}
        <div className="w-full h-full overflow-auto bg-gray-50 rounded-lg shadow-md">
          <div className="p-4 flex justify-center">
            <div className="w-full max-w-4xl">
              {notebookContent}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Other file types
  return (
    <div className={`relative w-full h-full ${className}`}>
      {renderDownloadButton()}
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gray-100 rounded-lg">
        <div className="text-6xl mb-4">📁</div>
        <h3 className="text-xl font-semibold mb-2">{fileName}</h3>
        <p className="text-gray-500 mb-6">This file type cannot be previewed</p>
      </div>
    </div>
  );
};

// Demo component to show the FileViewer in action
const FileViewerDemo = () => {
  const [selectedFile, setSelectedFile] = useState("");
  
  const sampleFiles = [
    { name: "Sample PDF", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
    { name: "Sample Image", url: "https://via.placeholder.com/800x600/4F46E5/white?text=Sample+Image" }
  ];

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      <div className="p-4 bg-white border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Enhanced File Viewer</h1>
        <div className="flex flex-wrap gap-2">
          {sampleFiles.map((file, index) => (
            <button
              key={index}
              onClick={() => setSelectedFile(file.url)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                selectedFile === file.url
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {file.name}
            </button>
          ))}
          <button
            onClick={() => setSelectedFile("")}
            className="px-4 py-2 rounded-lg border bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="flex-1 p-4">
        <FileViewer 
          fileUrl={selectedFile} 
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default FileViewer;