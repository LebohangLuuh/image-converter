
  <script lang="ts">
  import { FileDropzone } from '@skeletonlabs/skeleton';
  import MediaButton from '../../lib/components/MediaButton.svelte';
  import SideBar from '$lib/components/SideBar.svelte';
  import * as mammoth from "mammoth";
  import * as XLSX from 'xlsx';

  let selectedFormat = ""; 
  let uploadedFile: Blob | null = null; 
  let errorMessage = "";
  let isLoading = false;

  function handleFormatChange(event: Event & { currentTarget: HTMLSelectElement }) {
      selectedFormat = event.currentTarget.value;
      console.log("Format Selected:", selectedFormat);
  }

  async function transcode(event: Event) {
    try {
      const input = event.target as HTMLInputElement;
      uploadedFile = input.files ? input.files[0] : null;
      if (!uploadedFile) {
        errorMessage = "Please select a file to convert.";
        return;
      }
      errorMessage = "";
      console.log("File Uploaded:", uploadedFile);
    } catch (error) {
      console.error("Error in transcode:", error);
      errorMessage = "Failed to load file.";
    }
  }

  async function convertAndDownloadFile() {
    if (!uploadedFile || !selectedFormat) {
      errorMessage = "Please upload a file and select a format.";
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
              await handleDocxConversion(arrayBuffer);
              break;
            case "pdf":
              await handlePdfConversion(arrayBuffer);
              break;
            case "pptx":
              await handlePptxConversion(arrayBuffer);
              break;
            case "xls":
              await handleXlsConversion(arrayBuffer);
              break;
            default:
              errorMessage = "Unsupported format selected.";
          }
        } else {
          errorMessage = "Failed to read file.";
        }
      } catch (error) {
        console.error("Conversion error:", error);
        errorMessage = "File conversion failed.";
      } finally {
        isLoading = false;
      }
    };

    fileReader.readAsArrayBuffer(uploadedFile);
  }

  async function handleDocxConversion(arrayBuffer: string | ArrayBuffer | null) {
    if (arrayBuffer instanceof ArrayBuffer) {
      const result = await mammoth.extractRawText({ arrayBuffer });
    } else {
      throw new Error("Invalid arrayBuffer type");
    }
    const result = await mammoth.extractRawText({ arrayBuffer });
    downloadFile(result.value, "converted.docx");
  }

  async function handlePdfConversion(arrayBuffer: string | ArrayBuffer | null) {
    console.log("PDF conversion logic here.");
    //conversion logic
  }

  async function handlePptxConversion(arrayBuffer: string | ArrayBuffer | null) {
    console.log("PPTX conversion logic here.");
    // PPTX conversion logic
  }

  async function handleXlsConversion(arrayBuffer: string | ArrayBuffer | null) {
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const xlsData = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    downloadFile(xlsData, "converted.xlsx");
  }

  function downloadFile(data: BlobPart, fileName: string) {
    const blob = new Blob([data]);
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
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
    />
    <span style="color:aqua;">Select Format</span>
    <select id="Docx_formats" class="select w-[65%] mt-5 ml-5" on:change={handleFormatChange}>
      <option value="" disabled selected>Select format</option>
      <option value="docx">docx</option>
      <option value="pdf">pdf</option>
      <option value="pptx">pptx</option>
      <option value="xls">xls</option>
    </select>
  </div>
  <button type="button" on:click={convertAndDownloadFile} class="btn variant-filled-primary mt-5 ml-44 w-[50%]">
    Convert and Download File
  </button>
  {#if errorMessage}
    <p style="color: red;">{errorMessage}</p>
  {/if}
  {#if isLoading}
    <p>Loading...</p>
  {/if}
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