<script>
  import { page } from "$app/stores";
</script>


<div class="flex items-center">
  <div class="flex-grow text-center">
    <h1
      class="h1 mb-0 mt-10 font-light text-center"
      style="font-size: 90px; color: #24afb2"
    >
      {#each ["Image", "Docs", "Audio", "Video"] as mediaType}
        {#if $page.url.pathname === `/${mediaType === "Image" ? "" : mediaType}`}
          {mediaType} Converter App
        {/if}
      {/each}
    </h1>
  </div>
</div>

<style>
    @media (max-width: 768px) {

   .h1 {
      font-size: 16px;
      padding-left: 85px;
      margin-bottom: 5px;
    }
  }
</style>
