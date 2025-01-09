<script>
  import { onMount } from "svelte";
  import MediaButton from "../../lib/components/MediaButton.svelte";
  import SideBar from "$lib/components/SideBar.svelte";
  import * as FFmpeg from '@ffmpeg/ffmpeg';
</script>

<MediaButton />

<SideBar />

<div class="card w-[50%] p-1 pr-10 pb-10 pt-10 ml-[30%] mt-[-10%]">
<div
  class=" mt-0 ml-10"
>
  <FileDropzone name="audios" accept="audio/*" />

  <span style="color:aqua;">Select Format</span>

  <select class="select w-[45%] mt-5 ml-5" bind:value={selectedFormat}>
    <option value="" disabled selected>Select format</option>
    <option value="mp3">mp3</option>
    <option value="m4a">m4a</option>
    <option value="wav">wav</option>
  </select>
</div>
<button type="button" class="btn variant-filled-primary mt-5 ml-44 w-[50%]" on:click={transcode}>Download Audio</button>
</div>

