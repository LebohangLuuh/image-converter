<script lang="ts">
  import MediaButton from "$lib/components/MediaButton.svelte";
  import SideBar from "$lib/components/SideBar.svelte";
  import { FFmpeg } from "@ffmpeg/ffmpeg";
  import { FileDropzone } from "@skeletonlabs/skeleton";
  import { onMount } from "svelte";

  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

  let ffmpeg: FFmpeg;
  let isFFmpegLoaded = false;
  let loadingMessage = "Initializing...";

  const SUPPORTED_FORMATS = {
    mp3: { mime: "audio/mpeg", quality: ["-b:a", "192k"] },
    wav: { mime: "audio/wav", quality: ["-ar", "44100"] },
    ogg: { mime: "audio/ogg", quality: ["-b:a", "192k"] },
    aac: { mime: "audio/aac", quality: ["-b:a", "128k"] },
    m4a: { mime: "audio/x-m4a", quality: ["-b:a", "192k"] },
    flac: { mime: "audio/flac", quality: ["-compression_level", "5"] },
  };

  let isConverting = false;
  let progress = 0;
  let selectedFormat = "";
  let uploadedFile: File | null = null;
  let conversionLog: string[] = [];

  async function loadFFMpeg() {
    try {
      ffmpeg = new FFmpeg();

      // Set up logging
      ffmpeg.on("log", ({ message }) => {
        console.log("FFmpeg:", message);
        conversionLog = [...conversionLog.slice(-10), message]; // Keep last 10 messages
      });

      // Set up progress tracking
      ffmpeg.on("progress", ({ progress: p, time }) => {
        progress = Math.round(p * 100);
        console.log(`Progress: ${progress}%, Time: ${time}`);
      });

      loadingMessage = "Loading FFmpeg core...";

      await ffmpeg.load({
        coreURL: `${baseURL}/ffmpeg-core.js`,
        wasmURL: `${baseURL}/ffmpeg-core.wasm`,
        workerURL: `${baseURL}/ffmpeg-worker.js`,
      });

      isFFmpegLoaded = true;
      loadingMessage = "FFmpeg loaded successfully!";
      console.log("FFmpeg loaded successfully");
    } catch (error) {
      console.error("Failed to load FFmpeg:", error);
      loadingMessage = "Failed to load FFmpeg. Please refresh the page.";
    }
  }

  async function handleFileUpload(event: Event) {
    try {
      const input = event.target as HTMLInputElement;
      const files = input.files;

      if (!files || files.length === 0) {
        alert("Please select a file.");
        return;
      }

      const file = files[0];

      // Validate file type
      if (!file.type.startsWith("audio/")) {
        alert("Please select a valid audio file.");
        return;
      }

      // Validate file size (max 100MB)
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("File is too large. Maximum size is 100MB.");
        return;
      }

      uploadedFile = file;
      console.log("Audio file uploaded:", file);
    } catch (error) {
      console.error("Error handling file upload:", error);
      alert("Failed to upload file.");
    }
  }

  async function convertAudio(): Promise<void> {
    if (!isFFmpegLoaded) {
      alert("FFmpeg is not loaded yet. Please wait...");
      return;
    }

    if (!uploadedFile || !selectedFormat) {
      alert("Please select a file and output format.");
      return;
    }

    isConverting = true;
    progress = 0;
    conversionLog = [];

    try {
      // Generate unique filenames
      const inputFileName = `input_${Date.now()}.${uploadedFile.name.split(".").pop()}`;
      const outputFileName = `output_${Date.now()}.${selectedFormat}`;

      console.log(`Converting ${inputFileName} to ${outputFileName}`);

      // Write input file to FFmpeg's virtual filesystem
      const inputData = new Uint8Array(await uploadedFile.arrayBuffer());
      await ffmpeg.writeFile(inputFileName, inputData);

      // Get conversion parameters
      const formatConfig =
        SUPPORTED_FORMATS[selectedFormat as keyof typeof SUPPORTED_FORMATS];

      // Build FFmpeg command
      const command = [
        "-i",
        inputFileName,
        ...formatConfig.quality,
        "-y", // Overwrite output file
        outputFileName,
      ];

      console.log("FFmpeg command:", command);

      // Execute conversion
      await ffmpeg.exec(command);

      // Read the converted file
      const outputData = await ffmpeg.readFile(outputFileName);

      // Create blob and download
      const blob = new Blob([outputData], { type: formatConfig.mime });
      downloadConvertedFile(blob, `converted.${selectedFormat}`);

      // Cleanup
      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile(outputFileName);

      console.log("Conversion completed successfully");
    } catch (error) {
      console.error("Conversion failed:", error);
      alert(`Conversion failed: ${error.message}`);
    } finally {
      isConverting = false;
      progress = 0;
    }
  }

  function downloadConvertedFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  onMount(() => {
    loadFFMpeg();
  });
</script>

<MediaButton />
<SideBar />

<div class="card w-[50%] pr-10 pb-10 pt-10 ml-[30%] mt-[-10%]">
  <div class="mt-0 ml-10">
    {#if !isFFmpegLoaded}
      <div class="text-center p-6">
        <div class="animate-spin text-4xl mb-4">⚙️</div>
        <div class="text-lg font-semibold">{loadingMessage}</div>
        <div class="text-sm opacity-75 mt-2">
          This may take a few moments...
        </div>
      </div>
    {:else}
      <FileDropzone
        name="audio-files"
        accept="audio/*"
        on:change={handleFileUpload}
        class="flex justify-start space-x-72"
        disabled={isConverting}
      >
        <svelte:fragment slot="message">
          <div class="text-center">
            <i class="fa-solid fa-music text-4xl opacity-75"></i>
            <div class="text-lg font-semibold">Upload Audio File</div>
            <div class="text-sm opacity-75">
              Supports MP3, WAV, AAC, FLAC, OGG and more
            </div>
          </div>
        </svelte:fragment>
      </FileDropzone>

      <div class="format-selector mt-5">
        <label
          for="format-select"
          class="format-label text-primary-500 font-semibold"
        >
          Select Output Format:
        </label>
        <select
          id="format-select"
          class="select w-[65%] mt-2"
          bind:value={selectedFormat}
          disabled={isConverting}
        >
          <option value="">Choose format...</option>
          {#each Object.entries(SUPPORTED_FORMATS) as [format, config]}
            <option value={format}>{format.toUpperCase()}</option>
          {/each}
        </select>
      </div>

      {#if uploadedFile}
        <div class="mt-4 p-3 bg-surface-100-800-token rounded-lg">
          <div class="text-sm font-semibold text-surface-700-200-token">
            📁 {uploadedFile.name}
          </div>
          <div class="text-xs text-surface-600-300-token mt-1">
            Size: {formatFileSize(uploadedFile.size)} | Type: {uploadedFile.type}
          </div>
        </div>
      {/if}

      {#if isConverting}
        <div class="mt-4 p-4 bg-primary-100-800-token rounded-lg">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-semibold">Converting...</span>
            <span class="text-sm">{progress}%</span>
          </div>
          <div class="w-full bg-surface-300-600-token rounded-full h-2">
            <div
              class="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style="width: {progress}%"
            ></div>
          </div>
          {#if conversionLog.length > 0}
            <div class="mt-2 text-xs text-surface-600-300-token">
              Status: {conversionLog[conversionLog.length - 1]}
            </div>
          {/if}
        </div>
      {/if}
    {/if}
  </div>

  <button
    type="button"
    class="btn variant-filled-primary convert-button mt-6"
    on:click={convertAudio}
    disabled={isConverting ||
      !selectedFormat ||
      !uploadedFile ||
      !isFFmpegLoaded}
  >
    {#if !isFFmpegLoaded}
      Loading FFmpeg...
    {:else if isConverting}
      Converting... {progress}%
    {:else}
      🎵 Convert Audio
    {/if}
  </button>
</div>

<style>
  .format-label {
    color: #24afb2;
  }

  .convert-button {
    width: 50%;
    margin: 0 auto;
    display: block;
    color: white;
    min-height: 48px;
  }

  @media (max-width: 768px) {
    .card {
      width: 90%;
      margin-left: 5%;
      margin-top: 20px;
    }

    .convert-button {
      width: 100%;
    }

    .select {
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .card {
      width: 95%;
      margin-left: 2.5%;
      padding: 15px;
    }

    .convert-button {
      width: 100%;
    }
  }
</style>
