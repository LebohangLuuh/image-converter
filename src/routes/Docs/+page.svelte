<script lang="ts">
  import { FileDropzone } from "@skeletonlabs/skeleton";
  import MediaButton from "../../lib/components/MediaButton.svelte";
  import SideBar from "$lib/components/SideBar.svelte";
  import * as mammoth from "mammoth";
  import * as XLSX from "xlsx";
  import { PDFDocument } from "pdf-lib";
  import { downloadFile } from "../utils.js";
  import PptxGenJS from "pptxgenjs";

  let selectedFormat = "";
  let uploadedFile: Blob | null = null;
  let isLoading = false;

  function handleFormatChange(
    event: Event & { currentTarget: HTMLSelectElement }
  ) {
    selectedFormat = event.currentTarget.value;
    console.log("Format Selected:", selectedFormat);
  }

  async function transcode(event: Event) {
    try {
      const input = event.target as HTMLInputElement;
      uploadedFile = input.files ? input.files[0] : null;
      if (!uploadedFile) {
        alert("Please select a file to convert.");
        return;
      }
      console.log("File Uploaded:", uploadedFile);
    } catch (error) {
      console.error("Error in transcode:", error);
      alert("Failed to load file.");
    }
  }

  async function convertAndDownloadFile() {
    if (!uploadedFile || !selectedFormat) {
      alert("Please upload a file and select a format.");
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = async (e) => {
      const arrayBuffer = e.target?.result;
      isLoading = true;
      try {
        if (arrayBuffer) {
          switch (selectedFormat) {
            case "docx":
              await handleDocxConversion(arrayBuffer, selectedFormat);
              break;
            case "pdf":
              await handlePdfConversion(arrayBuffer);
              break;
            case "pptx":
              await handlePptxConversion(
                arrayBuffer as ArrayBuffer,
                "converted.pptx"
              );
              break;
            case "xls":
              await handleXlsConversion(arrayBuffer as ArrayBuffer);
              break;
            default:
              alert("Unsupported format selected.");
          }
        } else {
          alert("Failed to read file.");
        }
      } catch (error) {
        console.error("Conversion error:", error);
        alert("File conversion failed.");
      } finally {
        isLoading = false;
      }
    };

    fileReader.readAsArrayBuffer(uploadedFile);
  }

  async function handleDocxConversion(
    arrayBuffer: string | ArrayBuffer | null,
    fileType: string
  ) {
    try {
      if (fileType === "docx" && arrayBuffer instanceof ArrayBuffer) {
        const result = await mammoth.extractRawText({ arrayBuffer });
        downloadFile(result.value, "converted.docx");
      } else if (fileType === "pdf" && arrayBuffer instanceof ArrayBuffer) {
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const textContent = await extractTextFromPDF(pdfDoc);
        const docxContent = convertTextToDocx(textContent);
        downloadFile(docxContent, "converted.docx");
      } else {
        throw new Error("Invalid input type or file type");
      }
    } catch (error) {
      console.error("Error during DOCX conversion:", error);
      alert("Failed to convert DOCX file. Please ensure the file is valid.");
    }
  }

  async function extractTextFromPDF(pdfDoc: PDFDocument): Promise<string> {
    const pages = pdfDoc.getPages();
    let textContent = "";
    for (const page of pages) {
      const textContentStream = await page.getTextContent();
      textContent += textContentStream.items
        .map((item: any) => (item as any).str)
        .join(" ");
    }
    return textContent;
  }

  function convertTextToDocx(text: string): string {
    return text;
  }

  //docx to pdf
  async function handlePdfConversion(arrayBuffer: string | ArrayBuffer | null) {
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const docxContent = await mammoth.convertToHtml({ arrayBuffer });
    const pdfContent = convertHtmlToPdf(docxContent.value);
    const pdfArrayBuffer = await pdfDoc.save();
    downloadFile(pdfArrayBuffer, "converted.pdf");
  }

  function convertHtmlToPdf(html: string) {
    const doc = new jsPDF();
    doc.fromHTML(html);
    return doc.output("arraybuffer");
  }

  async function handleXlsConversion(arrayBuffer: ArrayBuffer) {
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const xlsData = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    downloadFile(xlsData, "converted.xlsx");
  }

  async function handlePptxConversion(
    arrayBuffer: ArrayBuffer,
    pptxFilePath: string
  ) {
    try {
      const result = await mammoth.extractRawText({ arrayBuffer });
      const paragraphs = result.value.split("\n");

      const pptx = new PptxGenJS();

      paragraphs.forEach((paragraph, index) => {
        if (paragraph.trim()) {
          const slide = pptx.addSlide();
          slide.addText(paragraph, { x: 1, y: 1, fontSize: 18 });
        }
      });

      pptx.writeFile({ fileName: pptxFilePath });
      console.log(`PPTX file created at: ${pptxFilePath}`);
    } catch (error) {
      console.error("Error converting DOCX to PPTX:", error);
      alert("Failed to convert file to PPTX. Please ensure the file is valid.");
    }
  }
</script>

<MediaButton />
<SideBar />

<div class="card w-[50%] pr-10 pb-10 pt-10 ml-[30%] mt-[-10%]">
  <div class="mt-0 ml-10">
    <FileDropzone
      name="files"
      accept=".docx, .pdf, .pptx, .xls, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/pdf, application/vnd.openxmlformats-officedocument.presentationml.presentation, application/vnd.ms-excel"
      on:change={transcode}
      class="flex justify-start space-x-72"
    />

    <span style="color:aqua;">Select Format</span>
    <select
      id="Docx_formats"
      class="select w-[65%] mt-5 ml-5"
      on:change={handleFormatChange}
    >
      <option value="" disabled selected>Select format</option>
      <option value="docx">docx</option>
      <option value="pdf">pdf</option>
      <option value="pptx">pptx</option>
      <option value="xls">xls</option>
    </select>
  </div>
  <button
    type="button"
    on:click={convertAndDownloadFile}
    class="btn variant-filled-primary mt-5 ml-44 w-[50%]"
  >
    Convert and Download File
  </button>
</div>

<style>
  @media (max-width: 768px) {
    .card {
      width: 80%;
      margin-top: 45px;
    }

    .select {
      width: 100%;
      font-size: 0.9rem;
    }

    .btn {
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .card {
      width: 100%;
      padding: 10px;
    }

    .select {
      width: 100%;
      font-size: 0.8rem;
    }

    .btn {
      width: 80%;
      font-size: 1rem;
    }
  }
</style>
