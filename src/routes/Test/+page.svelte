<script lang="ts">
  import { FFmpeg } from "@ffmpeg/ffmpeg";
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

  onMount(() => {
    loadFFMpeg();
  });

  async function testFFMPEG() {
    ffmpeg.exec(["-version"]);

    ffmpeg.on("log", ({ message }) => {
      console.log(message);
    });
  }
</script>

<div>
  <br />
  <p>{message}</p>
  <button onclick={testFFMPEG}>Start</button>
</div>
