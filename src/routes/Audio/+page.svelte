<script lang="ts">
  import { FileDropzone } from "@skeletonlabs/skeleton";
  import MediaButton from "../../lib/components/MediaButton.svelte";
</script>

<MediaButton />

<div
  class="pl-96 pr-44 ml-36 justify-center align-middle items-center display-flex w-[70%]"
>
  <FileDropzone name="files" accept="audio/*" on:change{transcode} />

  <span style="color:aqua;">Select Format</span>

  <select class="select w-[45%] mt-5 ml-5">
    <option value="Select format" disabled selected>Select format</option>
    <option value="mp3">mp3</option>
    <option value="m4a">m4a</option>
    <option value="wav">wav</option>
  </select>

  <button type="button" class="btn variant-filled-primary ml-5 w-[25%]"
    >Download Audio</button
  >
</div>

<body>
  <div
    class="space-x-8 ml-36 container justify-center align-middle items-center flex flex-row mb-16 mt-16">
    <script src="ffmpeg.min.js"></script>
    <script>
      const { createFFmpeg, fetchFile } = FFmpeg;
      const ffmpeg = createFFmpeg({ log: true });
      const transcode = async ({ target: { files } }) => {
        const { name } = files[0];
        await ffmpeg.load();
        ffmpeg.FS("writeFile", name, await fetchFile(files[0]));
        await ffmpeg.run("-i", name, "output.mp3");
        const data = ffmpeg.FS("readFile", "output.mp3");
        const video = document.getElementById("player");
        video.src = URL.createObjectURL(
          new Blob([data.buffer], { type: "audio/mp3" })
        );
      };
      document.getElementById("uploader").addEventListener("change", transcode);
    </script>
  </div>
</body>
