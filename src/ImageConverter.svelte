<script lang="ts">
  import { FileDropzone } from "@skeletonlabs/skeleton";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";

  function handleFileChange(e: Event): void {
    try {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) {
        throw new Error("No files uploaded");
      }

      const validTypes = ["image/jpeg", "image/png"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      for (const file of files) {
        if (!validTypes.includes(file.type)) {
          console.error("Invalid file type:", file.type);
          continue;
        }
        if (file.size > maxSize) {
          console.error("File is too large:", file.size);
          continue;
        }
        console.log("Valid file:", file);

        convertImage(file, selectedFormat);
      }
    } catch (error) {
      console.error("Error handling file upload:", error);
    }
  }

  const selectedFormat = writable<string | null>(null);
  let convertedFile: File | null = null;

  function convertImage(file: File): void {
    selectedFormat.subscribe((format) => {
      if (!format) {
        console.error("No format selected");
        return;
      }

      const reader = new FileReader();
      reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            console.error("Failed to get canvas context");
            return;
          }
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          // Convert to the selected format
          canvas.toBlob((blob) => {
            if (blob) {
              convertedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, "") + `.${format}`,
                { type: `image/${format}` }
              );
              console.log(
                `Converted to ${format.toUpperCase()}:`,
                convertedFile
              );
            }
          }, `image/${format}`);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  function downloadFile(file: File): void {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
</script>

<div class="card w-[50%] pr-10 pb-10 pt-10 ml-[30%] mt-[-10%]">
  <div
    class=" mt-0 ml-10"
  >
  <FileDropzone name="images" accept="image/*" on:change={handleFileChange}>
  </FileDropzone>

  <span style="color:aqua;">Select Format</span>

  <select id="Image_formats" class="select w-[65%] mt-5 ml-5" bind:value={$selectedFormat}>
    <option value="" disabled selected>Select format</option>
    <option value="png">PNG</option>
    <option value="jpeg">JPEG</option>
    <option value="webp">WEBP</option>
    <option value="jpg">JPG</option>
  </select>


</div>
<button
type="button"
class="btn variant-filled-primary mt-5 ml-44 w-[50%]"
on:click={() => downloadFile(convertedFile)}>Download Image</button
>
</div>


<style>
  @media (max-width: 768px) {
  .card {
    width: 80%;
    margin-top: 45px;
  }

  .select {
    width: 100%;
    font-size: 0.9rem;
  }

  .btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .card {
    width: 100%;
    padding: 10px;
  }

  .select {
    width: 100%;
    font-size: 0.8rem;
  }

  .btn {
    width: 80%;
    font-size: 1rem;
  }
}
</style>