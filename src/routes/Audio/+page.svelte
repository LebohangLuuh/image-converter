<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import MediaButton from "../../lib/components/MediaButton.svelte";
  import { FileDropzone } from "@skeletonlabs/skeleton";
  import SideBar from "$lib/components/SideBar.svelte";
  import { FFmpeg } from '@ffmpeg/ffmpeg';
  import { toBlobURL, fetchFile } from '@ffmpeg/util';

  const FileDropzonee = FileDropzone;

  let fileDropzone: FileDropzone;
  let selectedFormat = "";
  let transcodedAudioUrl: string | null = null;
  let isConverting = false;
  let progress = 0;
  let ffmpeg: FFmpeg;

  // Load ffmpeg.wasm 
  onMount(async () => {
    ffmpeg = new FFmpeg();
    
    ffmpeg.on('progress', ({ progress: p }) => {
      progress = Math.round(p * 100);
    });

    try {
      // Load ffmpeg 
      await ffmpeg.load({
        coreURL: await toBlobURL(`/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`/ffmpeg-core.wasm`, 'application/wasm'),
      });
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
      alert('Failed to initialize audio converter. Please try reloading the page.');
    }
  });

  onDestroy(() => {
    if (transcodedAudioUrl) {
      URL.revokeObjectURL(transcodedAudioUrl);
    }
  });

  // transcode the audio file
  const transcode = async (file: File): Promise<string | null> => {
    if (!ffmpeg.loaded) {
      throw new Error('FFmpeg is not loaded');
    }

    const outputExtension = selectedFormat;
    if (!outputExtension) {
      throw new Error('Please select a format for conversion');
    }

    try {
      isConverting = true;
      progress = 0;

      const timestamp = Date.now();
      const inputFileName = `input_${timestamp}${file.name}`;
      const outputFileName = `output_${timestamp}.${outputExtension}`;

      await ffmpeg.writeFile(inputFileName, await fetchFile(file));

      //  FFmpeg command to convert the file
      await ffmpeg.exec([
        '-i', inputFileName,
        '-c:a', getAudioCodec(outputExtension),
        outputFileName
      ]);

      const outputData = await ffmpeg.readFile(outputFileName);
      const blob = new Blob([outputData], { type: `audio/${outputExtension}` });

      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile(outputFileName);

      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Transcoding error:', error);
      throw error;
    } finally {
      isConverting = false;
    }
  };

  function getAudioCodec(format: string): string {
    switch (format) {
      case 'mp3':
        return 'libmp3lame';
      case 'm4a':
        return 'aac';
      case 'wav':
        return 'pcm_s16le';
      default:
        return 'copy';
    }
  }

  const handleDownload = async () => {
    if (!fileDropzone.files || fileDropzone.files.length === 0) {
      alert('Please select an audio file.');
      return;
    }

    try {
      if (transcodedAudioUrl) {
        URL.revokeObjectURL(transcodedAudioUrl);
        transcodedAudioUrl = null;
      }

      const file = fileDropzone.files[0];
      transcodedAudioUrl = await transcode(file);

      if (transcodedAudioUrl) {
        const link = document.createElement('a');
        link.href = transcodedAudioUrl;
        link.download = `converted_${file.name.split('.')[0]}.${selectedFormat}`;
        link.click();
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred during conversion');
    }
  };
</script>

<MediaButton />

<SideBar />

<div class="card w-[50%] pr-10 pb-10 pt-10 ml-[30%] mt-[-10%]">
  <div class="mt-0 ml-10">
    <FileDropzonee
      bind:this={fileDropzone}
      id="file-dropzone"
      name="files"
      accept="audio/*"
    />

    <span style="color:aqua;">Select Format</span>

    <select 
      class="select w-[65%] mt-5 ml-5" 
      bind:value={selectedFormat}
      disabled={isConverting}
    >
      <option value="">Select format</option>
      <option value="mp3">mp3</option>
      <option value="m4a">m4a</option>
      <option value="wav">wav</option>
    </select>
  </div>

  {#if isConverting}
    <div class="progress-bar mt-5 ml-44 w-[50%]">
      <div class="progress" style="width: {progress}%">
        Converting: {progress}%
      </div>
    </div>
  {/if}

  <button
    type="button"
    class="btn variant-filled-primary mt-5 ml-44 w-[50%]"
    on:click={handleDownload}
    disabled={isConverting || !selectedFormat}
  >
    {isConverting ? 'Converting...' : 'Download Audio'}
  </button>
</div>

<style>
  .progress-bar {
    width: 100%;
    height: 20px;
    background-color: #ddd;
    border-radius: 10px;
    overflow: hidden;
  }

  .progress {
    height: 100%;
    background-color: #4CAF50;
    transition: width 0.3s ease-in-out;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px;
  }
</style>