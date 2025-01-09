<script>
  import { onMount } from "svelte";
  import MediaButton from "../../lib/components/MediaButton.svelte";
  import { FileDropzone } from "@skeletonlabs/skeleton";

  const FileDropzonee = FileDropzone;

  let fileDropzone;
  let selectedFormat = "";
  let transcodedAudioUrl = null;

  let ffmpeg;

  // Load ffmpeg.wasm when component mounts
  onMount(async () => {
    const { createFFmpeg, fetchFile } = ffmpeg;
    ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();
  });

  // Function to transcode the audio file
  const transcode = async (file) => {
    const outputExtension = selectedFormat;

    if (!outputExtension) {
      alert("Please select a format for conversion.");
      return;
    }

    try {
      // Load the file into FFmpeg's virtual filesystem
      const fileData = await ffmpeg.fetchFile(file);
      const fileName = file.name.split(".")[0];

      // Write the file to FFmpeg's virtual filesystem
      await ffmpeg.write(file.name, fileData);

      // Run FFmpeg command to convert the file
      const outputFileName = `${fileName}.${outputExtension}`;
      await ffmpeg.run("-i", file.name, outputFileName);

      // Retrieve the converted file from FFmpeg's virtual filesystem
      const data = await ffmpeg.read(outputFileName);
      const blob = new Blob([data], { type: `audio/${outputExtension}` });

      // Generate a download URL for the converted file
      transcodedAudioUrl = URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error during transcoding", error);
      alert("Error during file conversion.");
    }
  };

  // Handle file input and start conversion and download in one go
  const handleDownload = async () => {
    if (!fileDropzone.files || fileDropzone.files.length === 0) {
      alert("Please select an audio file.");
      return;
    }

    const file = fileDropzone.files[0];
    await transcode(file); // Perform transcoding
    if (!transcodedAudioUrl) {
      alert("Transcoding failed.");
      return;
    }

    // Download the transcoded audio file
    const link = document.createElement("a");
    link.href = transcodedAudioUrl;
    link.download = `converted_audio.${selectedFormat}`;
    link.click();
  };
</script>

<MediaButton />

<div class="pl-96 pr-44 ml-36 justify-center align-middle items-center display-flex w-[70%]">
  <FileDropzonee
    bind:this={fileDropzone}
    id="file-dropzone"
    name="files"
    accept="audio/*"
  />

  <span style="color:aqua;">Select Format</span>

  <select class="select w-[45%] mt-5 ml-5" bind:value={selectedFormat}>
    <option value="" disabled selected>Select format</option>
    <option value="mp3">mp3</option>
    <option value="m4a">m4a</option>
    <option value="wav">wav</option>
  </select>

  <!-- Button to handle both conversion and download -->
  <button
    type="button"
    class="btn variant-filled-primary ml-5 w-[25%]"
    on:click={handleDownload}
  >
    Download Audio
  </button>
</div>

