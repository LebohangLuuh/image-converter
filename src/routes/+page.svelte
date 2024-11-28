<script>
  import { TabAnchor, TabGroup } from "@skeletonlabs/skeleton";
  import ImageConverter from "../ImageConverter.svelte";
  import { page } from "$app/stores";
</script>

<h1
  class="h1 mb-10 mt-10 text-center font-light"
  style="font-size: 90px; color: #e76f6f"
>
  Media Converter App
</h1>

<div
  class="space-x-8 ml-36 container justify-center align-middle items-center flex flex-row mb-16 mt-16"
>
  <a href="/" class="card p-4">
    <img src="./undraw_Recording.png" alt="Images" class="image-class h-20" />
    Images
  </a>
  <a href="../routes/Audio" class="card p-4">
    <img src="./undraw_Recording.png" alt="Images" class="image-class h-20" />
    Audio
  </a>
  <a href="../routes/Video" class="card p-4">
    <img src="./undraw_Recording.png" alt="Images" class="image-class h-20" />
    Videos
  </a>
  <a href="../routes/Docs" class="card p-4">
    <img src="./undraw_Recording.png" alt="Images" class="image-class h-20" />
    Documents
  </a>
</div>

<ImageConverter />
