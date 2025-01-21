<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import MediaButton from "../../lib/components/MediaButton.svelte";
  import { FileDropzone } from "@skeletonlabs/skeleton";
  import SideBar from "$lib/components/SideBar.svelte";
  import { FFmpeg } from "@ffmpeg/ffmpeg";
  import pkg from "file-saver";
  const { saveAs } = pkg;

  type SupportedFormat = "mp3" | "m4a" | "wav";

  const SUPPORTED_FORMATS: Record<
    SupportedFormat,
    { codec: string; mimeType: string }
  > = {
    mp3: { codec: "libmp3lame", mimeType: "audio/mpeg" },
    m4a: { codec: "aac", mimeType: "audio/x-m4a" },
    wav: { codec: "pcm_s16le", mimeType: "audio/wav" },
  };

  let fileDropzone: FileDropzone;

  let selectedFormat: SupportedFormat | "" = "";
  let ffmpeg: FFmpeg | null = null;
  let transcodedAudioUrl: string | null = null;
  let isConverting = false;
  let progress = 0;


  onMount(initFFmpeg);

  async function initFFmpeg(): Promise<void> {
    ffmpeg = new FFmpeg();
    await ffmpeg.load();
    console.log("FFmpeg initialized");
    ffmpeg.on("progress", ({ progress: p }) => {
      progress = Math.round(p * 100);
    });
  }

  function validateFile(file: File): void {
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (!fileExtension || !(fileExtension in SUPPORTED_FORMATS)) {
      throw new Error(`Unsupported file format: .${fileExtension}`);
      console.error("Unsupported file format:", fileExtension `\n Size: ${file.size}`); 
    }
    if (file.size > 100 * 1024 * 1024) {
      console.error("File size too large:", file.size);
      throw new Error("File size too large. Please select a file under 100MB.");
    }
  }

  async function transcode(file: File): Promise<string> {
    console.log("ffmpeg loading", ffmpeg);
    if (ffmpeg) await ffmpeg.load();
    console.log("Transcoding audio...");
    if (!ffmpeg) await initFFmpeg();
    if (!selectedFormat) {
      throw new Error("Please select a format");
    }

    const inputName = `input.${file.name.split(".").pop()}`;
    console.log("inputName", inputName);
    const outputName = `output.${selectedFormat}`;

    if (ffmpeg) {
      await ffmpeg.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));
    } else 
    {
      throw new Error("FFmpeg is not initialized.");
    }
    await ffmpeg.exec(["-i", inputName, "-c:a", SUPPORTED_FORMATS[selectedFormat].codec, "-y", outputName,]);

    const outputFile = await ffmpeg.readFile(outputName);
    return URL.createObjectURL(
      new Blob([outputFile], {
        type: SUPPORTED_FORMATS[selectedFormat].mimeType,
      })
    );
  }

  async function handleDownload(): Promise<void> {
    if (!fileDropzone.files || fileDropzone.files.length === 0) {
      alert("Please select an audio file.");
      return;
    }

    try {
      const file = fileDropzone.files[0];
      validateFile(file);

      console.log("Selected file: ", file.name, "Selected format:", selectedFormat);
      if (transcodedAudioUrl) URL.revokeObjectURL(transcodedAudioUrl);
      isConverting = true;

      console.log("Converting : ", file.name, "size: ", file.size, "\n to ", selectedFormat , "progress: ", progress, "%");
      transcodedAudioUrl = await transcode(file);

      saveAs(transcodedAudioUrl, `converted.${selectedFormat}`);
      alert("Conversion successful!");
      console.log("Conversion successful!");
    } catch (error) {
      alert((error as Error).message || "An unexpected error occurred.");
    } finally {
      isConverting = false;
    }
  }

  onDestroy(() => {
    if (transcodedAudioUrl) URL.revokeObjectURL(transcodedAudioUrl);
  });
</script>

<MediaButton />
<SideBar />

<div class="card w-[50%] pr-10 pb-10 pt-10 ml-[30%] mt-[-10%]">
  <div class=" mt-0 ml-10">
    <FileDropzone bind:this={fileDropzone} id="file-dropzone" name="files" accept="audio/*" class="flex justify-start space-x-72" ></FileDropzone>

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

  <button type="button" class="btn variant-filled-primary convert-button" on:click={handleDownload} disabled={isConverting || !selectedFormat}>
    {isConverting ? `Converting... ${progress}%` : "Download Audio"}
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
