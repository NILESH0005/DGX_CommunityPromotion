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

const FileViewer = ({ fileUrl, className }) => {
  const [numPages, setNumPages] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  const [notebookContent, setNotebookContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [fileData, setFileData] = useState(null);
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
      Download
    </button>
  );

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPdfError(null);
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
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 min-h-[500px] overflow-auto">
          <PowerPointRenderer arrayBuffer={arrayBuffer} />
        </div>
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
          }
          .xlsx-wrapper table {
            border-collapse: collapse;
            width: 100%;
          }
          .xlsx-wrapper th, .xlsx-wrapper td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          .xlsx-wrapper th {
            background-color: #f2f2f2;
            font-weight: bold;
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
      <div
        className="notebook-container bg-white rounded-lg shadow"
        style={{ minWidth: "800px" }}
      >
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
      <div
        className={`flex flex-col items-center justify-center p-8 ${className}`}
      >
        <div className="text-red-500 mb-4">{error}</div>
        {renderDownloadButton()}
      </div>
    );
  }

  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(fileExtension)) {
    return (
      <div className={`flex flex-col items-center p-4 ${className}`}>
        <div className="w-full flex justify-between items-center mb-4">
          <div className="ml-4">{renderDownloadButton()}</div>
        </div>
        <div className="w-full max-w-full max-h-[80vh] overflow-auto bg-gray-100 rounded-lg flex items-center justify-center p-4">
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

  if (fileExtension === "pdf") {
    return (
      <div className={`w-full flex flex-col ${className}`}>
        <div className="w-full flex justify-between items-center mb-4">
          <div className="ml-4">{renderDownloadButton()}</div>
        </div>
        <div className="w-full max-w-full bg-white rounded-lg shadow-md overflow-hidden">
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
              <div className="overflow-y-auto p-4">
                {Array.from(new Array(numPages), (el, index) => (
                  <div
                    key={`page_${index + 1}`}
                    className="mb-4 border-b border-gray-200 last:border-b-0"
                  >
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
      </div>
    );
  }

  if (fileType === "docx") {
    return (
      <div className={`w-full h-full flex flex-col ${className}`}>
        <div className="w-full flex justify-between items-center mb-4">
          <div className="ml-4">{renderDownloadButton()}</div>
        </div>
        <div className="flex-1 overflow-auto p-6 bg-white rounded-lg shadow">
          {fileContent}
        </div>
      </div>
    );
  }

  if (fileType === "pptx") {
    return (
      <div className={`w-full h-full flex flex-col ${className}`}>
        <div className="w-full flex justify-between items-center mb-4">
          <div className="ml-4">{renderDownloadButton()}</div>
        </div>
        {fileContent}
      </div>
    );
  }

  if (fileType === "xlsx") {
    return (
      <div className={`w-full h-full flex flex-col ${className}`}>
        <div className="w-full flex justify-between items-center mb-4">
          <div className="ml-4">{renderDownloadButton()}</div>
        </div>
        <div className="flex-1 overflow-auto p-4 bg-white rounded-lg shadow">
          {fileContent}
        </div>
      </div>
    );
  }

  if (fileType === "ipynb") {
    return (
      <div className={`w-full h-full flex flex-col ${className}`}>
        <div className="w-full flex justify-between items-center mb-4">
          <div className="flex-1" />
          <div className="ml-4">{renderDownloadButton()}</div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">{notebookContent}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 ${className}`}
    >
      <div className="text-6xl mb-4">📁</div>
      <h3 className="text-xl font-semibold mb-2">{fileName}</h3>
      <p className="text-gray-500 mb-6">This file type cannot be previewed</p>
      {renderDownloadButton()}
    </div>
  );
};

export default FileViewer;