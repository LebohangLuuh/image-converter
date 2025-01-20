<script lang="ts">
  import { onMount } from 'svelte';
  import { FFmpeg } from '@ffmpeg/ffmpeg';
  import { fetchFile } from '@ffmpeg/util';
  import MediaButton from '$lib/components/MediaButton.svelte';
  import SideBar from '$lib/components/SideBar.svelte';

  let ffmpeg: FFmpeg;
  let isLoading = false;
  let progress = 0;
  let selectedFile: File | null = null;
  let selectedFormat = '';
  let error = '';

  onMount(async () => {
    console.log('FFmpeg loading');
    try {
      ffmpeg = new FFmpeg();
      ffmpeg.on('progress', ({ ratio }) => {
        console.log('Conversion progress:', ratio);
        progress = Math.round(ratio * 100);
        console.log(`Conversion progress: ${progress}%`);
      });
      
      await ffmpeg.load();
      console.log('FFmpeg loaded');
    } catch (err) {
      console.error('FFmpeg failed to load:', err);
    }
  });

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      const file = event.dataTransfer.files[0];
      if (file?.type.startsWith('video/')) {
        selectedFile = file;
      }
    }
  }

  function handleFileSelection(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      selectedFile = input.files[0];
      console.log('Selected file:', selectedFile.name); 

    }
  }

  async function convertVideo() {
    if (!selectedFile || !selectedFormat) return;

    console.log('Selected format:', selectedFormat);


    try {
      error = '';
      isLoading = true;
      progress = 0;

      console.log('Converting video : ', selectedFile.name , 'to format: ', selectedFormat, 'progress: ', progress);
      const inputFileName = 'input' + getExtension(selectedFile.name);
      const outputFileName = `output.${selectedFormat}`;

      await ffmpeg.writeFile(inputFileName, await fetchFile(selectedFile));

      // Run the FFmpeg command
      await ffmpeg.exec([
        '-i', inputFileName,
        outputFileName
      ]);

      // Read the output file
      const data = await ffmpeg.readFile(outputFileName);
      const blob = new Blob([data], { type: `video/${selectedFormat}` });
      
      //  download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `converted-video.${selectedFormat}`;
      console.log('Download link:', a.href);
      window.console.log('Download link:', a.href);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Conversion error:', err);
      error = 'Failed to convert video. Please try again.';
    } finally {
      isLoading = false;
    }
  }

  function getExtension(filename: string): string {
    return '.' + filename.split('.').pop();
  }
</script>

<MediaButton />
<SideBar />

  <div class="card w-[50%] pr-10 pb-10 pt-10 ml-[30%] mt-[-10%]">
    <div class="mt-0 ml-10">
      <div 
        class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500"
        on:click={() => {
          const fileInput = document.getElementById('fileInput');
          if (fileInput) fileInput.click();
        }}
        on:keydown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            const fileInput = document.getElementById('fileInput');
            if (fileInput) fileInput.click();
          }
        }}
        on:dragover|preventDefault
        on:drop|preventDefault={handleDrop}
        role="button"
        tabindex="0"
        aria-label="File input"
      >
        <input
          type="file"
          id="fileInput"
          accept="video/*"
          class="hidden"
          on:change={handleFileSelection}
        />
        {#if selectedFile}
          <p class="text-primary-500">Selected: {selectedFile.name}</p>
        {:else}
          <p>Drag and drop a video file here or click to select</p>
        {/if}
      </div>

      <div class="mt-4">
        <span class="text-cyan-400">Select Format</span>
        <select id="Video_formats" class="select w-[65%] mt-5 ml-5" bind:value={selectedFormat}>
          <option value="" disabled selected>Select format</option>
          <option value="webm">webm</option>
          <option value="mp4">mp4</option>
          <option value="avi">avi</option>
        </select>
      </div>
    </div>

    <button
      type="button"
      class="btn variant-filled-primary mt-5 ml-44 w-[50%]"
      on:click={convertVideo}
      disabled={isLoading || !selectedFormat || !selectedFile}
    >
      {#if isLoading}
        Converting... {progress}%
      {:else}
        Convert Video
      {/if}
    </button>

    {#if error}
      <div class="mt-4 p-4 bg-red-100 text-red-800 rounded">
        {error}
      </div>
    {/if}
  </div>

<style>
  :global(body) {
    background-color: #1a1a1a;
    color: #ffffff;
  }
</style>