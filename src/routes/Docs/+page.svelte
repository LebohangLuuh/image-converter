<script lang="ts">
  import { FileDropzone } from "@skeletonlabs/skeleton";
  import MediaButton from "../../lib/components/MediaButton.svelte";
</script>

<MediaButton />

<div
  class="pl-96 pr-44 ml-36 justify-center align-middle items-center display-flex w-[70%]"
>
  <FileDropzone name="files" accept="document/*" on:change{transcode} />

  <span style="color:aqua;">Select Format</span>

  <select class="select w-[45%] mt-5 ml-5">
    <option value="Select format" disabled selected>Select format</option>
    <option value="docx">docx</option>
    <option value="pdf">pdf</option>
    <option value="txt">txt</option>
  </select>

  <button type="button" class="btn variant-filled-primary ml-5 w-[25%]"
    >Download File</button
  >
</div>
