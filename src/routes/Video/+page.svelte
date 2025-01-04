<script lang="ts">
  import SideBar from "$lib/components/SideBar.svelte";
  import MediaButton from "../../lib/components/MediaButton.svelte";
  import { FileDropzone } from "@skeletonlabs/skeleton";

  let selectedFormat = "";
  let videoSrc: string | null = null;
  let isLoading = false;
  let errorMessage = "";
  let videoFile: File | null = null; // Store the actual video file

  const handleFileSelection = (event: CustomEvent) => {
    const { files } = event.detail || {};
    if (!files || files.length === 0) {
      errorMessage = "No files selected.";
      videoSrc = null;
      videoFile = null;
      return;
    }

    const file = files[0];
    if (!file.type.startsWith("video/")) {
      errorMessage = "Selected file is not a video.";
      videoSrc = null;
      videoFile = null;
      return;
    }

    errorMessage = "";
    videoFile = file;
    videoSrc = URL.createObjectURL(file);
  };

  const convertVideo = async (file: File, format: string): Promise<Blob | null> => {
    // Simulate a format conversion process
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(new Blob([file], { type: `video/${format}` })); // Mock conversion
      }, 3000);
    });
  };

  const downloadVideo = async () => {
    if (!videoFile || !selectedFormat) {
      errorMessage = "Please select a video file and a format.";
      return;
    }

    isLoading = true;
    try {
      const convertedBlob = await convertVideo(videoFile, selectedFormat);

      if (convertedBlob) {
        const downloadUrl = URL.createObjectURL(convertedBlob);
        const a = document.createElement("a");
        const originalName = videoFile.name.split(".")[0];
        a.href = downloadUrl;
        a.download = `${originalName}.${selectedFormat}`;
        a.click();
        URL.revokeObjectURL(downloadUrl);
      } else {
        errorMessage = "Failed to convert video.";
      }
    } catch (error) {
      errorMessage = "An error occurred during video conversion.";
      console.error("Error during video conversion:", error);
    } finally {
      isLoading = false;
    }
  };
</script>

<MediaButton />
<SideBar />

<div class="card w-[50%] pr-10 pb-10 pt-10 ml-[30%] mt-[-10%]">
  <div class="mt-0 ml-10">
    <FileDropzone
      name="videos"
      accept="video/*"
      on:change={handleFileSelection}
    />
    <span style="color:aqua;">Select Format</span>
    <select id="Video_formats" class="select w-[65%] mt-5 ml-5" bind:value={selectedFormat}>
      <option value="" disabled selected>Select format</option>
      <option value="webm">webm</option>
      <option value="mp4">mp4</option>
      <option value="avi">avi</option>
    </select>
  </div>

  {#if isLoading}
    <p>Loading...</p>
  {/if}

  {#if errorMessage}
    <p class="error">{errorMessage}</p>
  {/if}

  <button
    type="button"
    class="btn variant-filled-primary mt-5 ml-44 w-[50%]"
    on:click={downloadVideo}
    disabled={isLoading || !selectedFormat}
  >
    Download Video
  </button>
</div>

<style>
  .error {
    color: red;
    font-size: 1rem;
  }

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
