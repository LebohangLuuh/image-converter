<script>
  import { Menu } from "lucide-svelte";
</script>

<div class="flex items-center">
  <div class="menu-container flex justify-start ml-16">
    <Menu style="color: #24afb2" />
  </div>
  <div class="flex-grow text-center mr-28">
    <h1
      class="h1 mb-10 mt-10 font-light"
      style="font-size: 90px; color: #24afb2"
    >
      Media Converter App
    </h1>
  </div>
</div>

<div
  class="space-x-8 ml-36 container justify-center align-middle items-center flex flex-row mb-16 mt-16"
>
  <a href="/" class="card p-4">
    <img src="./undraw_Optimize_image_re_3tb1.png" alt="Images" class="image-class h-20" />
    Images
  </a>
  <a href=".//../Audio" class="card p-4">
    <img src="./undraw_Recording.png" alt="Images" class="image-class h-20" />
    Audio
  </a>
  <a href=".//../Video" class="card p-4">
    <img src="./undraw_video_files_fu10.jpeg" alt="Images" class="image-class h-20" />
    Videos
  </a>
  <a href=".//../Docs" class="card p-4">
    <img src="./undraw_Recording.png" alt="Images" class="image-class h-20" />
    Documents
  </a>
</div>
