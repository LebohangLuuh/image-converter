<script lang="ts">
  import SideBar from "$lib/components/SideBar.svelte";
import MediaButton from "../../lib/components/MediaButton.svelte";
  import { FileDropzone } from "@skeletonlabs/skeleton";
  import { onMount } from "svelte";

  let selectedFormat = ""; 
  let videoSrc = ""; // Source for the video player

  let ffmpeg: any;

  onMount(async () => {
    const { createFFmpeg, fetchFile } = await import("@ffmpeg/ffmpeg");
    ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();
  });

  const transcode = async ({ detail: { files } }) => {
    if (!files || files.length === 0) return;

    const { name } = files[0];
    const outputName = `output.${selectedFormat}`;

    ffmpeg.FS("writeFile", name, await fetchFile(files[0]));
    await ffmpeg.run("-i", name, outputName);
    const data = ffmpeg.FS("readFile", outputName);

    videoSrc = URL.createObjectURL(new Blob([data.buffer], { type: `video/${selectedFormat}` }));
  };

  function downloadVideo(src) {
    const a = document.createElement('a');
    a.href = src;
    a.download = `transcoded-video.${selectedFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
</script>

<MediaButton />

<SideBar />

<div class="pl-96 pr-44 ml-36 justify-center align-middle items-center display-flex w-[70%]">
  <FileDropzone name="files" accept="video/*" on:change={transcode} />

  <span style="color:aqua;">Select Format</span>

  <select class="select w-[45%] mt-5 ml-5" bind:value={selectedFormat}>
    <option value="webm">webm</option>
    <option value="mp4">mp4</option>
    <option value="mkv">mkv</option>
  </select>

  <button type="button" class="btn variant-filled-primary ml-5 w-[25%]" on:click={() => downloadVideo(videoSrc)}>
    Download Video
  </button>
</div>
