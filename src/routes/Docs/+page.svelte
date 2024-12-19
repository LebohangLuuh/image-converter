<script lang="ts">
  import { FileDropzone } from '@skeletonlabs/skeleton';
  import MediaButton from '../../lib/components/MediaButton.svelte';
  import { onMount } from 'svelte';
  import SideBar from '$lib/components/SideBar.svelte';

  let selectedFormat = '';
  let convertedFileUrl = '';
  let ffmpeg: { load: () => any; FS: (arg0: string, arg1: string, arg2: Uint8Array | undefined) => void; run: (arg0: string, arg1: any, arg2: string) => any; };
  let isLoading = false;

  onMount(async () => {
    ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();
  });

  async function transcode(event: CustomEvent) {
    try {
      const files = event.detail.files;
      const file = files[0];
      const outputFormat = selectedFormat;

      if (!file || !outputFormat) {
        console.error('No file or format selected.');
        return;
      }

      isLoading = true;

      // Read file as array buffer
      const reader = new FileReader();
      reader.onload = async (event) => {
        const inputData = event.target?.result;
        if (!inputData) return;

        // Create FFmpeg input
        ffmpeg.FS('writeFile', file.name, new Uint8Array(inputData));

        // Run conversion command
        await ffmpeg.run('-i', file.name, `output.${outputFormat}`);

        // Get output file
        const output = ffmpeg.FS('readFile', `output.${outputFormat}`);

        // Create a blob from the output file
        const blob = new Blob([output.buffer], { type: `application/${outputFormat}` });

        // Create a URL for the blob
        convertedFileUrl = URL.createObjectURL(blob);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error converting file:', error);
    } finally {
      isLoading = false;
    }
  }

  function handleFormatChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    selectedFormat = target.value;
  }

  function downloadFile() {
    if (!convertedFileUrl) {
      console.error('No file available for download.');
      return;
    }
    const a = document.createElement('a');
    a.href = convertedFileUrl;
    a.download = `converted.${selectedFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
</script>


<MediaButton />

<SideBar />


<div
  class="pl-96 pr-44 ml-36 justify-center align-middle items-center display-flex w-[70%]"
>
<FileDropzone 
  name="files" 
  accept=".docx, .pdf, .pptx, .xls, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/pdf, application/vnd.openxmlformats-officedocument.presentationml.presentation, application/vnd.ms-excel" 
  on:change={transcode} 
/>
  <span style="color:aqua;">Select Format</span>

  <select class="select w-[45%] mt-5 ml-5" on:change={handleFormatChange}>
    <option value="" disabled selected>Select format</option>
    <option value="docx">docx</option>
    <option value="pdf">pdf</option>
    <option value="pptx">pptx</option>
    <option value="xls">xls</option>
  </select>

  <button type="button" on:click={downloadFile} class="btn variant-filled-primary ml-5 w-[25%]">
    Download File
  </button>

  {#if isLoading}
    <p>Loading...</p>
  {/if}
</div>