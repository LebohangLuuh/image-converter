<script lang="ts">
  import { FileDropzone } from '@skeletonlabs/skeleton';
  import MediaButton from '../../lib/components/MediaButton.svelte';
  import { onMount } from 'svelte';
  import SideBar from '$lib/components/SideBar.svelte';

  let selectedFormat = '';
  let convertedFileUrl = '';
  let isLoading = false;
  let errorMessage = '';
  let file: File | null = null;

  function handleFormatChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    selectedFormat = target.value;
  }

  async function transcode(event: CustomEvent) {
    const files = event.detail.files;
    if (files.length > 0) {
      file = files[0];
    }
  }

  async function convertAndDownloadFile() {
    if (!file || !selectedFormat) {
      errorMessage = 'Please select a file and format.';
      return;
    }

    isLoading = true;
    errorMessage = '';

    try {
      
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: JSON.stringify({
          fileName: file.name,
          format: selectedFormat
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Conversion failed');
      }

      const data = await response.json();
      convertedFileUrl = data.url; 

      // Automatically download the file after conversion
      const link = document.createElement('a');
      link.href = convertedFileUrl;
      link.download = `converted.${selectedFormat}`;
      link.click();
    } catch (error) {
      errorMessage = error.message;
    } finally {
      isLoading = false;
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