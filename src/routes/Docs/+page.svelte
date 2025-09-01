<script lang="ts">
  import { FileDropzone } from "@skeletonlabs/skeleton";
  import MediaButton from "../../lib/components/MediaButton.svelte";
  import SideBar from "$lib/components/SideBar.svelte";
  import { onMount, onDestroy } from "svelte";
  import { downloadFile } from "../utils";

  // Lazy-loaded libraries with proper typing
  let mammothLib: typeof import('mammoth') | null = null;
  let xlsxLib: typeof import('xlsx') | null = null;
  let pdfjsLib: any = null;

  let selectedFormat = "";
  let uploadedFile: File | null = null;
  let isLoading = false;
  let conversionProgress = 0;
  let loadingMessage = "Initializing...";
  let conversionStartTime = 0;
  let estimatedTimeRemaining = "";

  // File size limits by type (in bytes)
  const FILE_SIZE_LIMITS = {
    pdf: 25 * 1024 * 1024,    // 25MB for PDFs (text extraction is memory intensive)
    docx: 50 * 1024 * 1024,   // 50MB for DOCX files
    xlsx: 30 * 1024 * 1024,   // 30MB for spreadsheets
    txt: 10 * 1024 * 1024,    // 10MB for text files
    xls: 30 * 1024 * 1024,    // 30MB for legacy Excel
  };

  // Supported file extensions with validation
  const SUPPORTED_EXTENSIONS = {
    docx: ['docx'],
    pdf: ['pdf'],
    txt: ['txt', 'text'],
    xlsx: ['xlsx', 'xls', 'xlsm'],
    xls: ['xls', 'xlsx', 'xlsm']
  };

  function handleFormatChange(event: Event & { currentTarget: HTMLSelectElement }) {
    selectedFormat = event.currentTarget.value;
    console.log("Format Selected:", selectedFormat);
  }

  async function transcode(event: Event) {
    try {
      const input = event.target as HTMLInputElement;
      const files = input.files;
      if (!files || files.length === 0) {
        showError("Please select a file to convert.");
        return;
      }

      const file = files[0];

      // Enhanced file validation
      const validation = validateFile(file);
      if (!validation.isValid) {
        showError(validation.error);
        uploadedFile = null;
        return;
      }

      uploadedFile = file;
      console.log("File validated and uploaded:", {
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type
      });

    } catch (error) {
      console.error("Error in file upload:", error);
      showError("Failed to process uploaded file.");
    }
  }

  function validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file size
    const extension = getFileExtension(file.name);
    const maxSize = FILE_SIZE_LIMITS[extension as keyof typeof FILE_SIZE_LIMITS] || 50 * 1024 * 1024;
    
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File is too large. Maximum size for ${extension.toUpperCase()} files is ${formatFileSize(maxSize)}.`
      };
    }

    if (file.size === 0) {
      return {
        isValid: false,
        error: "File appears to be empty."
      };
    }

    // Check file extension
    const supportedExts = Object.values(SUPPORTED_EXTENSIONS).flat();
    if (!supportedExts.includes(extension)) {
      return {
        isValid: false,
        error: `Unsupported file type. Supported formats: ${supportedExts.join(', ').toUpperCase()}`
      };
    }

    // Check MIME type if available
    if (file.type) {
      const validMimeTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/plain',
        'application/msword',
        'application/octet-stream' // Some files may have generic MIME type
      ];
      
      if (!validMimeTypes.includes(file.type)) {
        console.warn(`Unexpected MIME type: ${file.type} for file: ${file.name}`);
      }
    }

    return { isValid: true };
  }

  function getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  }

  function showError(message: string) {
    alert(message);
  }

  function updateProgress(progress: number, message: string = "") {
    conversionProgress = Math.max(0, Math.min(100, progress));
    if (message) loadingMessage = message;
    
    // Estimate time remaining
    if (progress > 5 && conversionStartTime) {
      const elapsed = Date.now() - conversionStartTime;
      const totalEstimated = elapsed / (progress / 100);
      const remaining = Math.max(0, totalEstimated - elapsed);
      estimatedTimeRemaining = formatTime(remaining);
    }
  }

  function formatTime(ms: number): string {
    if (ms < 1000) return "few seconds";
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Enhanced library loading with error handling
  async function ensureMammoth() {
    if (!mammothLib) {
      try {
        updateProgress(0, "Loading document processing library...");
        mammothLib = await import("mammoth");
        updateProgress(10, "Document library loaded");
      } catch (error) {
        throw new Error(`Failed to load document processing library: ${error}`);
      }
    }
    return mammothLib;
  }

  async function ensureXLSX() {
    if (!xlsxLib) {
      try {
        updateProgress(0, "Loading spreadsheet processing library...");
        xlsxLib = await import("xlsx");
        updateProgress(10, "Spreadsheet library loaded");
      } catch (error) {
        throw new Error(`Failed to load spreadsheet processing library: ${error}`);
      }
    }
    return xlsxLib;
  }

  // Enhanced PDF.js loading with better error handling
  async function loadScript(src: string, timeout: number = 30000): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      const timeoutId = setTimeout(() => {
        script.remove();
        reject(new Error(`Script loading timeout: ${src}`));
      }, timeout);

      script.src = src;
      script.async = true;
      script.onload = () => {
        clearTimeout(timeoutId);
        resolve();
      };
      script.onerror = () => {
        clearTimeout(timeoutId);
        script.remove();
        reject(new Error(`Failed to load script: ${src}`));
      };
      
      document.head.appendChild(script);
    });
  }

  async function ensurePdfJs() {
    if (pdfjsLib?.getDocument) return pdfjsLib;

    try {
      updateProgress(0, "Loading PDF processing library...");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
      
      pdfjsLib = (window as any).pdfjsLib;
      if (!pdfjsLib) {
        throw new Error("PDF.js failed to initialize");
      }

      if (pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      }

      updateProgress(10, "PDF library loaded");
      return pdfjsLib;
    } catch (error) {
      throw new Error(`Failed to load PDF processing library: ${error}`);
    }
  }

  // Robust PDF text extraction with memory management
  async function extractTextFromPdf(file: File): Promise<string> {
    const pdfjs = await ensurePdfJs();
    updateProgress(15, "Analyzing PDF structure...");

    try {
      const data = new Uint8Array(await file.arrayBuffer());
      const loadingTask = pdfjs.getDocument({
        data,
        cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
        cMapPacked: true,
        standardFontDataUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/standard_fonts/",
        useSystemFonts: true,
        disableFontFace: false,
        maxImageSize: 1024 * 1024,
        isEvalSupported: false,
        disableRange: false,
        disableStream: false
      });

      const pdf = await loadingTask.promise;
      const pages: string[] = [];
      
      // Dynamic limits based on file size
      const maxPages = Math.min(pdf.numPages, file.size > 10 * 1024 * 1024 ? 100 : 300);
      const maxCharsPerPage = file.size > 5 * 1024 * 1024 ? 2000 : 5000;
      const maxTotalChars = 500000;
      
      let totalChars = 0;

      updateProgress(20, `Extracting text from ${maxPages} pages...`);

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent({
            normalizeWhitespace: true,
            disableCombineTextItems: false
          });

          let pageText = textContent.items
            .filter((item: any) => item.str && item.str.trim())
            .map((item: any) => item.str)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

          // Limit text per page
          if (pageText.length > maxCharsPerPage) {
            pageText = pageText.substring(0, maxCharsPerPage) + "...";
          }

          if (pageText) {
            pages.push(pageText);
            totalChars += pageText.length;
          }

          // Progress update
          const progressPercent = 20 + (pageNum / maxPages) * 50;
          updateProgress(progressPercent, `Processing page ${pageNum} of ${maxPages}...`);

          // Memory management
          if (page.cleanup) page.cleanup();
          
          // Check total character limit
          if (totalChars >= maxTotalChars) {
            pages.push("\n[Document truncated due to size limits]");
            break;
          }

        } catch (pageError) {
          console.warn(`Error processing page ${pageNum}:`, pageError);
          pages.push(`[Error processing page ${pageNum}]`);
        }
      }

      // Force garbage collection if available
      if ((window as any).gc) {
        (window as any).gc();
      }

      updateProgress(75, "Finalizing text extraction...");
      return pages.join('\n\n');

    } catch (error) {
      throw new Error(`PDF text extraction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async function convertAndDownloadFile() {
    if (!uploadedFile || !selectedFormat) {
      showError("Please upload a file and select a target format.");
      return;
    }

    // Check if conversion is actually needed
    const sourceFormat = getFileExtension(uploadedFile.name);
    if (sourceFormat === selectedFormat) {
      if (confirm("The source and target formats are the same. Download the original file?")) {
        downloadFile(await uploadedFile.arrayBuffer(), `original_${uploadedFile.name}`);
      }
      return;
    }

    isLoading = true;
    conversionProgress = 0;
    loadingMessage = "Starting conversion...";
    conversionStartTime = Date.now();
    estimatedTimeRemaining = "";

    try {
      updateProgress(5, "Validating conversion path...");

      // Validate conversion compatibility
      const validationResult = validateConversion(sourceFormat, selectedFormat);
      if (!validationResult.isValid) {
        throw new Error(validationResult.error);
      }

      switch (selectedFormat) {
        case "docx":
          await handleDocxConversion(uploadedFile, sourceFormat);
          break;
        case "pdf":
          await handlePdfConversion(uploadedFile, sourceFormat);
          break;
        case "txt":
          await handleTxtConversion(uploadedFile, sourceFormat);
          break;
        case "xlsx":
          await handleXlsxConversion(uploadedFile, sourceFormat);
          break;
        default:
          throw new Error(`Conversion to ${selectedFormat} is not supported.`);
      }

      updateProgress(100, "Conversion completed successfully!");
      
    } catch (error) {
      console.error("Conversion error:", error);
      const message = error instanceof Error ? error.message : String(error);
      showError(`Conversion failed: ${message}`);
    } finally {
      // Cleanup
      setTimeout(() => {
        isLoading = false;
        conversionProgress = 0;
        loadingMessage = "";
        estimatedTimeRemaining = "";
      }, 1500);
    }
  }

  function validateConversion(sourceFormat: string, targetFormat: string): { isValid: boolean; error?: string } {
    const conversionMatrix = {
      pdf: ['txt', 'docx'],
      docx: ['txt', 'pdf'],
      txt: ['pdf', 'docx', 'xlsx'],
      xlsx: ['txt'],
      xls: ['xlsx', 'txt']
    };

    const validTargets = conversionMatrix[sourceFormat as keyof typeof conversionMatrix] || [];
    
    if (!validTargets.includes(targetFormat)) {
      return {
        isValid: false,
        error: `Cannot convert from ${sourceFormat.toUpperCase()} to ${targetFormat.toUpperCase()}. Supported conversions from ${sourceFormat.toUpperCase()}: ${validTargets.map(t => t.toUpperCase()).join(', ')}`
      };
    }

    return { isValid: true };
  }

  async function handleDocxConversion(file: File, sourceFormat: string) {
    updateProgress(10, "Starting DOCX conversion...");

    try {
      if (sourceFormat === "txt") {
        updateProgress(30, "Reading text file...");
        const text = await file.text();
        updateProgress(60, "Creating DOCX structure...");
        const docxContent = createSimpleDocx(text);
        updateProgress(90, "Preparing download...");
        downloadFile(docxContent, `converted_${file.name.split('.')[0]}.docx`);
        return;
      }

      if (sourceFormat === "pdf") {
        updateProgress(20, "Extracting text from PDF...");
        const text = await extractTextFromPdf(file);
        updateProgress(80, "Creating DOCX structure...");
        const docxContent = createSimpleDocx(text);
        updateProgress(90, "Preparing download...");
        downloadFile(docxContent, `converted_${file.name.split('.')[0]}.docx`);
        return;
      }

      throw new Error(`Conversion from ${sourceFormat} to DOCX not supported`);
    } catch (error) {
      throw new Error(`DOCX conversion failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async function handlePdfConversion(file: File, sourceFormat: string) {
    updateProgress(10, "Starting PDF conversion...");

    try {
      let text = "";

      if (sourceFormat === "docx") {
        const mammoth = await ensureMammoth();
        updateProgress(25, "Extracting text from DOCX...");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
        updateProgress(60, "Text extracted successfully");
      } else if (sourceFormat === "txt") {
        updateProgress(25, "Reading text file...");
        text = await file.text();
        updateProgress(40, "Text loaded");
      } else {
        throw new Error(`Conversion from ${sourceFormat} to PDF not supported`);
      }

      if (!text.trim()) {
        throw new Error("No text content found to convert to PDF");
      }

      updateProgress(70, "Creating PDF structure...");
      const pdfContent = createSimplePdf(text);
      updateProgress(90, "Preparing download...");
      downloadFile(pdfContent, `converted_${file.name.split('.')[0]}.pdf`);

    } catch (error) {
      throw new Error(`PDF conversion failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async function handleTxtConversion(file: File, sourceFormat: string) {
    updateProgress(10, "Starting TXT conversion...");

    try {
      let textContent = "";

      if (sourceFormat === "docx") {
        const mammoth = await ensureMammoth();
        updateProgress(25, "Extracting text from DOCX...");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        textContent = result.value;
      } else if (sourceFormat === "pdf") {
        updateProgress(25, "Extracting text from PDF...");
        textContent = await extractTextFromPdf(file);
      } else if (sourceFormat === "xlsx" || sourceFormat === "xls") {
        const XLSX = await ensureXLSX();
        updateProgress(25, "Reading spreadsheet...");
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        updateProgress(50, "Converting sheets to text...");
        const sheets = workbook.SheetNames;
        textContent = sheets
          .map((sheetName: string) => {
            const worksheet = workbook.Sheets[sheetName];
            const csvContent = XLSX.utils.sheet_to_csv(worksheet);
            return `=== Sheet: ${sheetName} ===\n${csvContent}`;
          })
          .join('\n\n');
      } else {
        throw new Error(`Conversion from ${sourceFormat} to TXT not supported`);
      }

      if (!textContent.trim()) {
        throw new Error("No text content found to extract");
      }

      updateProgress(80, "Preparing text file...");
      const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
      updateProgress(90, "Preparing download...");
      downloadFile(await blob.arrayBuffer(), `converted_${file.name.split('.')[0]}.txt`);

    } catch (error) {
      throw new Error(`TXT conversion failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async function handleXlsxConversion(file: File, sourceFormat: string) {
    updateProgress(10, "Starting XLSX conversion...");

    try {
      const XLSX = await ensureXLSX();

      if (sourceFormat === "xls") {
        updateProgress(25, "Reading legacy Excel file...");
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        updateProgress(60, "Converting to modern format...");
        const xlsxData = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        updateProgress(90, "Preparing download...");
        downloadFile(xlsxData, `converted_${file.name.split('.')[0]}.xlsx`);
        return;
      }

      if (sourceFormat === "txt") {
        updateProgress(25, "Reading text file...");
        const text = await file.text();
        
        updateProgress(40, "Parsing text content...");
        const lines = text.split('\n').filter(line => line.trim());
        const hasCommas = lines.some(line => line.includes(','));
        const hasTabs = lines.some(line => line.includes('\t'));
        
        let data: string[][];
        if (hasCommas || hasTabs) {
          const delimiter = hasCommas ? ',' : '\t';
          data = lines.map(line => line.split(delimiter).map(cell => cell.trim()));
        } else {
          // Single column data
          data = lines.map(line => [line]);
        }

        updateProgress(70, "Creating spreadsheet structure...");
        const worksheet = XLSX.utils.aoa_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        updateProgress(90, "Preparing download...");
        const xlsxData = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        downloadFile(xlsxData, `converted_${file.name.split('.')[0]}.xlsx`);
        return;
      }

      throw new Error(`Conversion from ${sourceFormat} to XLSX not supported`);
    } catch (error) {
      throw new Error(`XLSX conversion failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Enhanced DOCX creation with better structure
  function createSimpleDocx(text: string): ArrayBuffer {
    const safeText = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

    // Split text into paragraphs for better formatting
    const paragraphs = safeText.split(/\n\s*\n/).filter(p => p.trim());
    const paragraphXml = paragraphs.map(para =>
      `    <w:p><w:r><w:t>${para.replace(/\n/g, '</w:t></w:r><w:r><w:br/></w:r><w:r><w:t>')}</w:t></w:r></w:p>`
    ).join('\n');

    const docxXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
${paragraphXml}
  </w:body>
</w:document>`;

    return new TextEncoder().encode(docxXml).buffer;
  }

  // Enhanced PDF creation with better formatting and error handling
  function createSimplePdf(text: string): ArrayBuffer {
    try {
      const escapeText = (s: string) => s
        .replace(/\\/g, "\\\\")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)")
        .replace(/[\r\n]/g, "");

      const lines = text.split('\n');
      const maxLineLength = 85;
      const wrappedLines: string[] = [];

      // Enhanced text wrapping
      for (const line of lines) {
        if (!line.trim()) {
          wrappedLines.push(""); // Preserve empty lines
          continue;
        }

        if (line.length <= maxLineLength) {
          wrappedLines.push(line);
          continue;
        }

        // Word-wrap long lines
        const words = line.split(' ');
        let currentLine = '';
        
        for (const word of words) {
          if ((currentLine + ' ' + word).length <= maxLineLength) {
            currentLine = currentLine ? currentLine + ' ' + word : word;
          } else {
            if (currentLine) {
              wrappedLines.push(currentLine);
              currentLine = word;
            } else {
              // Handle very long words
              wrappedLines.push(word.substring(0, maxLineLength));
              currentLine = word.substring(maxLineLength);
            }
          }
        }
        
        if (currentLine) {
          wrappedLines.push(currentLine);
        }
      }

      // PDF page layout
      const lineHeight = 14;
      const pageHeight = 792;
      const topMargin = 50;
      const bottomMargin = 50;
      const startY = pageHeight - topMargin;
      const usableHeight = pageHeight - topMargin - bottomMargin;
      const maxLinesPerPage = Math.floor(usableHeight / lineHeight);

      // Split into pages
      const pages: string[][] = [];
      for (let i = 0; i < wrappedLines.length; i += maxLinesPerPage) {
        pages.push(wrappedLines.slice(i, i + maxLinesPerPage));
      }

      if (pages.length === 0) {
        pages.push(["[Empty document]"]);
      }

      // Generate PDF structure
      const objects: string[] = [];
      const obj = (num: number, content: string) => `${num} 0 obj\n${content}\nendobj\n`;

      // Catalog object
      objects[1] = obj(1, "<< /Type /Catalog /Pages 2 0 R >>");

      // Pages object
      const pageCount = pages.length;
      const pageObjectsStart = 3;
      const contentObjectsStart = pageObjectsStart + pageCount;
      const resourcesObjectStart = contentObjectsStart + pageCount;

      const kidsRefs = Array.from({ length: pageCount }, (_, i) => 
        `${pageObjectsStart + i} 0 R`
      ).join(" ");
      
      objects[2] = obj(2, `<< /Type /Pages /Kids [${kidsRefs}] /Count ${pageCount} >>`);

      // Font resources object
      objects[resourcesObjectStart] = obj(resourcesObjectStart, 
        `<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>`
      );

      // Page objects
      for (let i = 0; i < pageCount; i++) {
        const pageBody = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 ${pageHeight}] /Resources ${resourcesObjectStart} 0 R /Contents ${contentObjectsStart + i} 0 R >>`;
        objects[pageObjectsStart + i] = obj(pageObjectsStart + i, pageBody);
      }

      // Content objects
      for (let i = 0; i < pageCount; i++) {
        const pageLines = pages[i];
        const contentParts = ["BT", "/F1 12 Tf", `50 ${startY} Td`, `${lineHeight} TL`];
        
        for (const line of pageLines) {
          const escapedLine = escapeText(line);
          if (escapedLine.trim()) {
            contentParts.push(`(${escapedLine}) Tj T*`);
          } else {
            contentParts.push("T*"); // Empty line
          }
        }
        
        contentParts.push("ET");
        const content = contentParts.join("\n") + "\n";
        const streamBody = `<< /Length ${content.length} >>\nstream\n${content}endstream`;
        objects[contentObjectsStart + i] = obj(contentObjectsStart + i, streamBody);
      }

      // Build PDF
      const header = "%PDF-1.4\n";
      const body = [];
      const xrefEntries = ["0000000000 65535 f "];
      let currentOffset = header.length;

      const maxObjNum = resourcesObjectStart;
      for (let i = 1; i <= maxObjNum; i++) {
        xrefEntries[i] = `${currentOffset.toString().padStart(10, "0")} 00000 n `;
        body.push(objects[i]);
        currentOffset += objects[i].length;
      }

      const xrefStart = currentOffset;
      const xref = `xref\n0 ${maxObjNum + 1}\n${xrefEntries.join("\n")}\n`;
      const trailer = `trailer\n<< /Size ${maxObjNum + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

      const pdfContent = header + body.join("") + xref + trailer;
      return new TextEncoder().encode(pdfContent).buffer;

    } catch (error) {
      console.error("PDF creation error:", error);
      // Fallback to minimal PDF
      const minimal = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\nxref\n0 1\n0000000000 65535 f \ntrailer\n<< /Size 1 /Root 1 0 R >>\nstartxref\n9\n%%EOF";
      return new TextEncoder().encode(minimal).buffer;
    }
  }

  // Cleanup on component destruction
  onDestroy(() => {
    if (pdfjsLib) {
      try {
        // Clean up PDF.js resources if available
        if (pdfjsLib.destroyAllDocuments) {
          pdfjsLib.destroyAllDocuments();
        }
      } catch (error) {
        console.warn("PDF.js cleanup warning:", error);
      }
    }
  });
</script>

<MediaButton />
<SideBar />

<div class="card w-[50%] pr-10 pb-10 pt-10 ml-[30%] mt-[-10%]">
  <div class="mt-0 ml-10">
    <FileDropzone
      name="files"
      accept=".docx, .pdf, .txt, .xlsx, .xls, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/pdf, text/plain, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      on:change={transcode}
        class="flex justify-start space-x-72"
    >
      <svelte:fragment slot="message">
        <div class="text-center">
          <i class="fa-solid fa-file-arrow-up text-4xl opacity-75"></i>
          <div class="text-lg font-semibold">Upload Document</div>
          <div class="text-sm opacity-75">
            Supports DOCX, PDF, TXT, XLSX files
          </div>
        </div>
      </svelte:fragment>
    </FileDropzone>

    <div class="mt-5 flex items-center gap-4">
      <span style="color:aqua;">Select Format:</span>
      <select
        id="doc_formats"
        class="select w-[65%]"
        on:change={handleFormatChange}
        disabled={isLoading}
      >
        <option value="" disabled selected>Choose target format</option>
        <option value="docx">DOCX</option>
        <option value="pdf">PDF</option>
        <option value="txt">TXT</option>
        <option value="xlsx">XLSX</option>
      </select>
    </div>

    {#if uploadedFile}
      <div class="mt-4 p-3 bg-surface-100-800-token rounded-lg">
        <div class="text-sm text-surface-600-300-token">
          Selected file: <span class="font-semibold">{uploadedFile.name}</span>
        </div>
        <div class="text-xs text-surface-500-400-token">
          Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
        </div>
      </div>
    {/if}

    {#if isLoading}
      <div class="mt-4">
        <div class="flex justify-between text-sm mb-2">
          <span>Converting...</span>
          <span>{conversionProgress}%</span>
        </div>
        <div class="w-full bg-surface-300-600-token rounded-full h-2">
          <div 
            class="bg-primary-500 h-2 rounded-full transition-all duration-300" 
            style="width: {conversionProgress}%"
          ></div>
        </div>
      </div>
    {/if}
  </div>

  <button
    type="button"
    on:click={convertAndDownloadFile}
    class="btn variant-filled-primary mt-5 ml-44 w-[50%]"
    disabled={isLoading || !uploadedFile || !selectedFormat}
  >
    {isLoading ? 'Converting...' : 'Convert & Download'}
  </button>
</div>

<style>
  @media (max-width: 768px) {
    .card {
      width: 80%;
      margin-top: 45px;
      margin-left: 10%;
    }

    .select {
      width: 100%;
      font-size: 0.9rem;
    }

    .btn {
      width: 100%;
      margin-left: 0;
    }
  }

  @media (max-width: 480px) {
    .card {
      width: 95%;
      padding: 15px;
      margin-left: 2.5%;
    }

    .select {
      width: 100%;
      font-size: 0.8rem;
    }

    .btn {
      width: 100%;
      font-size: 1rem;
      margin-left: 0;
    }
  }
</style>
