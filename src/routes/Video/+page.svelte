<script lang="ts">
  import MediaButton from "$lib/components/MediaButton.svelte";
  import SideBar from "$lib/components/SideBar.svelte";
import { FFmpeg } from "@ffmpeg/ffmpeg";
  import { FileDropzone } from "@skeletonlabs/skeleton";
  import { onMount } from "svelte";

  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

  let message = $state("Click Start to Transcode");

  type AppState = "init" | "loaded" | "convert.start" | "convert.done";

  let ffmpeg: FFmpeg;

  async function loadFFMpeg() {
    ffmpeg = new FFmpeg();
    message = "Loading ffmpeg-core.js";
   
    await ffmpeg.load({
      coreURL: `${baseURL}/ffmpeg-core.js`,
      wasmURL: `${baseURL}/ffmpeg-core.wasm`,
    });
    message = "Start transcoding";
   
  }

  const SUPPORTED_FORMATS = {
  mp4: "video/mpeg",
  webm: "video/webm",
  avi: "video/avi",
};

  let isConverting = $state(false);
let progress = $state(0);
let selectedFormat = $state("");

async function convertVideo(file: File, format: keyof typeof SUPPORTED_FORMATS): Promise<Blob> {
  isConverting = true;
  progress = 0;

  const inputFileName = "input_" + file.name;
  const outputFileName = `output.${format}`;

  // Write the file to FFmpeg's virtual file system
  await ffmpeg.writeFile(inputFileName, new Uint8Array(await file.arrayBuffer()));

  // progress reporting
  ffmpeg.on("progress", ({ progress: p }) => {
    progress = Math.round(p * 100);
  });

  // convert the file
  await ffmpeg.exec(["-i", inputFileName, outputFileName]);
  const data = await ffmpeg.readFile(outputFileName);

  // Clean virtual system
  await ffmpeg.deleteFile(inputFileName);
  await ffmpeg.deleteFile(outputFileName);

  isConverting = false;
  return new Blob([data], { type: SUPPORTED_FORMATS[format] });
}

let fileDropzone: FileDropzone;

async function handleDownload() {
  if (!fileDropzone.files || fileDropzone.files.length === 0) {
    alert("Please select a file first.");
    return;
  }

  const file = fileDropzone.files[0];
  const convertedBlob = await convertVideo(file, selectedFormat as keyof typeof SUPPORTED_FORMATS);

  // download link
  const url = URL.createObjectURL(convertedBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `converted.${selectedFormat}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

  onMount(() => {
    loadFFMpeg();
  });

</script>

<MediaButton />
<SideBar />

<div class="card w-[50%] pr-10 pb-10 pt-10 ml-[30%] mt-[-10%]">
  <div class="mt-0 ml-10">
    <FileDropzone bind:this={fileDropzone} id="file-dropzone" name="files" accept="video/*" class="flex justify-start space-x-72"></FileDropzone>

    <div class="format-selector flex">
      <label for="format-select" class="format-label">Select Format</label>
      <select id="format-select" class="select w-[65%]" bind:value={selectedFormat} disabled={isConverting}>
        <option value="">Select format</option>
        {#each Object.keys(SUPPORTED_FORMATS) as format}
          <option value={format}>{format.toUpperCase()}</option>
        {/each}
      </select>
    </div>
  </div>

  <button type="button" class="btn variant-filled-primary convert-button" onclick={handleDownload} disabled={isConverting || !selectedFormat}>
    {isConverting ? `Converting... ${progress}%` : "Download Video"}
  </button>

</div>

<style>
  .format-selector {
    margin-top: 1.25rem;
  }

  .format-label {
    color: #24afb2;
    margin-right: 1.25rem;
  }

  .convert-button {
    width: 50%;
    margin: 1.25rem auto;
    display: block;
    color: white;
  }
</style>
