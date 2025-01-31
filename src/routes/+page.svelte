<script lang="ts">
  import SideBar from "$lib/components/SideBar.svelte";
  import ImageConverter from "../ImageConverter.svelte";
  import MediaButton from "../lib/components/MediaButton.svelte";
  import { LightSwitch } from "@skeletonlabs/skeleton";
</script>

<!-- <LightSwitch class="absolute top-16 left-14 size-10" style="color: #ff5733;" /> -->

<MediaButton />
<SideBar />

<ImageConverter />
