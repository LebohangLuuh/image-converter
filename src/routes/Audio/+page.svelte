<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import MediaButton from "../../lib/components/MediaButton.svelte";
  import { FileDropzone } from "@skeletonlabs/skeleton";
  import SideBar from "$lib/components/SideBar.svelte";
  import { FFmpeg } from '@ffmpeg/ffmpeg';
  import { saveAs } from 'file-saver';

  type SupportedFormat = 'mp3' | 'm4a' | 'wav';

  const SUPPORTED_FORMATS: Record<SupportedFormat, { codec: string; mimeType: string }> = {
    mp3: { codec: 'libmp3lame', mimeType: 'audio/mpeg' },
    m4a: { codec: 'aac', mimeType: 'audio/x-m4a' },
    wav: { codec: 'pcm_s16le', mimeType: 'audio/wav' },
  };

  let fileDropzone: FileDropzone;

  onMount(() => {
    fileDropzone = new FileDropzone({ target: document.body });
  });
  let selectedFormat: SupportedFormat | '' = '';
  let ffmpeg: FFmpeg | null = null;
  let transcodedAudioUrl: string | null = null;
  let isConverting = false;
  let progress = 0;

  async function initFFmpeg(): Promise<void> {
    ffmpeg = new FFmpeg();
    await ffmpeg.load();
    ffmpeg.on('progress', ({ progress: p }) => {
      progress = Math.round(p * 100);
    });
  }

  function validateFile(file: File): void {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !(fileExtension in SUPPORTED_FORMATS)) {
      throw new Error(`Unsupported file format: .${fileExtension}`);
    }
    if (file.size > 100 * 1024 * 1024) {
      throw new Error('File size too large. Please select a file under 100MB.');
    }
  }

  async function transcode(file: File): Promise<string> {
    if (!ffmpeg || !ffmpeg.loaded) throw new Error('FFmpeg not initialized.');
    if (!selectedFormat) throw new Error('Please select a format.');

    const inputName = `input.${file.name.split('.').pop()}`;
    const outputName = `output.${selectedFormat}`;

    await ffmpeg.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));
    await ffmpeg.exec(['-i', inputName, '-c:a', SUPPORTED_FORMATS[selectedFormat].codec, '-y', outputName]);

    const outputFile = await ffmpeg.readFile(outputName);
    return URL.createObjectURL(new Blob([outputFile], { type: SUPPORTED_FORMATS[selectedFormat].mimeType }));
  }

  async function handleDownload(): Promise<void> {
    if (!fileDropzone.files || fileDropzone.files.length === 0) {
      alert('Please select an audio file.');
      return;
    }

    try {
      const file = fileDropzone.files[0];
      validateFile(file);

      if (transcodedAudioUrl) URL.revokeObjectURL(transcodedAudioUrl);
      isConverting = true;
      transcodedAudioUrl = await transcode(file);

      saveAs(transcodedAudioUrl, `converted.${selectedFormat}`);
      alert('Conversion successful!');
    } catch (error) {
      alert((error as Error).message || 'An unexpected error occurred.');
    } finally {
      isConverting = false;
    }
  }

  onMount(initFFmpeg);
  onDestroy(() => {
    if (transcodedAudioUrl) URL.revokeObjectURL(transcodedAudioUrl);
  });
</script>

  <MediaButton />
  <SideBar />

  <div class="card w-[50%] pr-10 pb-2 pt-5 ml-[30%] mt-[-12%]">
    <div class=" mt-0 ml-10">
      <FileDropzone
        bind:this={fileDropzone}
        id="file-dropzone"
        name="files"
        accept="audio/*"
      />

      <div class="format-selector">
        <label for="format-select" class="format-label">Select Format</label>
        <select id="format-select" class="select w-[65%]" bind:value={selectedFormat} disabled={isConverting}>
          <option value="">Select format</option>
          {#each Object.keys(SUPPORTED_FORMATS) as format}
            <option value={format}>{format.toUpperCase()}</option>
          {/each}
        </select>
      </div>
    </div>

    {#if isConverting}
      <div class="progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
        <div class="progress" style="width: {progress}%">
          Converting: {progress}%
        </div>
      </div>
    {/if}

    <button
      type="button"
      class="btn variant-filled-primary convert-button"
      on:click={handleDownload}
      disabled={isConverting || !selectedFormat}
    >
      {isConverting ? 'Converting...' : 'Download Audio'}
    </button>
  </div>

<style>

  .format-selector {
    margin-top: 1.25rem;
  }

  .format-label {
    color: var(--color-primary-500);
    margin-right: 1.25rem;
  }

  .progress-bar {
    width: 50%;
    height: 20px;
    background-color: #ddd;
    border-radius: 10px;
    overflow: hidden;
    margin: 1.25rem auto;
  }

  .progress {
    height: 100%;
    background-color: var(--color-success-500);
    transition: width 0.3s ease-in-out;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px;
  }

  .convert-button {
    width: 50%;
    margin: 1.25rem auto;
    display: block;
  }

</style>