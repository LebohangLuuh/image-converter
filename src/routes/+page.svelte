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
  class="pl-96 ml-52 container justify-center align-middle items-center display-flex mb-16 mt-16"
>
  <a href="/" class="card p-4">Images</a>
  <a href="/" class="card p-4">Audios</a>
  <a href="/" class="card p-4">Videos</a>
  <a href="/" class="card p-4">Documents</a>
</div>

<ImageConverter />
