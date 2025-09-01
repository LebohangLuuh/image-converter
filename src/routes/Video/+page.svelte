<script lang="ts">
  import MediaButton from "$lib/components/MediaButton.svelte";
  import SideBar from "$lib/components/SideBar.svelte";
  import { FFmpeg } from "@ffmpeg/ffmpeg";
  import { FileDropzone } from "@skeletonlabs/skeleton";
  import { onMount, onDestroy } from "svelte";

  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

  let ffmpeg: FFmpeg | null = null;
  let isFFmpegLoaded = false;
  let loadingMessage = "Initializing video converter...";
  let loadingProgress = 0;

  // Simplified format configurations focusing on compatibility
  const SUPPORTED_FORMATS = {
    mp4: {
      mime: "video/mp4",
      params: ["-c:v", "libx264", "-c:a", "aac"],
    },
    webm: {
      mime: "video/webm",
      params: ["-c:v", "libvpx", "-c:a", "libvorbis"],
    },
    avi: {
      mime: "video/x-msvideo",
      params: ["-c:v", "libx264", "-c:a", "libmp3lame"],
    },
    mov: {
      mime: "video/quicktime",
      params: ["-c:v", "libx264", "-c:a", "aac"],
    },
    mkv: {
      mime: "video/x-matroska",
      params: ["-c:v", "libx264", "-c:a", "aac"],
    },
  };

  let isConverting = false;
  let progress = 0;
  let selectedFormat = "";
  let uploadedFile: File | null = null;
  let conversionLog: string[] = [];
  let videoQuality = "medium";
  let estimatedTime = "";
  let conversionStartTime = 0;
  let progressInterval: number | null = null;

  const qualitySettings = {
    high: {
      crf: "20",
      preset: "medium",
      maxWidth: 1920,
      fps: null,
      audioBitrate: "192k",
    },
    medium: {
      crf: "23",
      preset: "fast",
      maxWidth: 1280,
      fps: "30",
      audioBitrate: "128k",
    },
    low: {
      crf: "28",
      preset: "ultrafast",
      maxWidth: 854,
      fps: "24",
      audioBitrate: "96k",
    },
  };

  async function loadFFMpeg() {
    try {
      ffmpeg = new FFmpeg();

      // Enhanced logging with filtering
      ffmpeg.on("log", ({ message }) => {
        if (
          message.includes("error") ||
          message.includes("warning") ||
          message.includes("info")
        ) {
          console.log("FFmpeg:", message);
          conversionLog = [...conversionLog.slice(-20), message];
        }
      });

      // Improved progress tracking
      ffmpeg.on("progress", ({ progress: p, time }) => {
        progress = Math.max(0, Math.min(100, Math.round(p * 100)));

        if (p > 0.05 && uploadedFile && conversionStartTime) {
          const elapsed = Date.now() - conversionStartTime;
          const totalEstimated = elapsed / p;
          const remaining = Math.max(0, totalEstimated - elapsed);
          estimatedTime = formatTime(remaining);
        }
      });

      loadingMessage = "Downloading FFmpeg core (30-90 seconds)...";
      loadingProgress = 10;

      const loadPromise = ffmpeg.load({
        coreURL: `${baseURL}/ffmpeg-core.js`,
        wasmURL: `${baseURL}/ffmpeg-core.wasm`,
        workerURL: `${baseURL}/ffmpeg-worker.js`,
      });

      // Simulate loading progress for better UX
      const progressTimer = setInterval(() => {
        if (loadingProgress < 90) {
          loadingProgress += Math.random() * 5;
        }
      }, 1000);

      await loadPromise;
      clearInterval(progressTimer);

      loadingProgress = 100;
      isFFmpegLoaded = true;
      loadingMessage = "FFmpeg loaded successfully!";
    } catch (error) {
      console.error("FFmpeg loading error:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      loadingMessage = `Failed to load FFmpeg: ${errorMsg}. Please refresh and try again.`;
    }
  }

  async function handleFileUpload(event: Event) {
    try {
      const input = event.target as HTMLInputElement;
      const files = input.files;

      if (!files || files.length === 0) {
        alert("Please select a video file.");
        return;
      }

      const file = files[0];

      // Enhanced file validation
      const validTypes = ["video/", "application/octet-stream"];
      const isValidType =
        validTypes.some((type) => file.type.startsWith(type)) ||
        /\.(mp4|avi|mov|mkv|webm|flv|wmv|m4v|3gp)$/i.test(file.name);

      if (!isValidType) {
        alert(
          "Please select a valid video file (MP4, AVI, MOV, MKV, WebM, etc.)"
        );
        return;
      }

      // Dynamic size limit based on quality setting
      const maxSizes = { high: 100, medium: 150, low: 200 };
      const maxSize =
        maxSizes[videoQuality as keyof typeof maxSizes] * 1024 * 1024;

      if (file.size > maxSize) {
        alert(
          `File is too large. Maximum size for ${videoQuality} quality is ${maxSizes[videoQuality as keyof typeof maxSizes]}MB.`
        );
        return;
      }

      uploadedFile = file;
      console.log("Video file uploaded:", file.name, formatFileSize(file.size));
    } catch (error) {
      console.error("Error handling file upload:", error);
      alert("Failed to upload file.");
    }
  }

  async function convertVideo(): Promise<void> {
    if (!ffmpeg || !isFFmpegLoaded) {
      alert("FFmpeg is not loaded yet. Please wait...");
      return;
    }

    if (!uploadedFile || !selectedFormat) {
      alert("Please select a file and output format.");
      return;
    }

    const formatConfig =
      SUPPORTED_FORMATS[selectedFormat as keyof typeof SUPPORTED_FORMATS];
    if (!formatConfig) {
      alert("Selected format is not supported.");
      return;
    }

    isConverting = true;
    progress = 0;
    conversionLog = [];
    estimatedTime = "";
    conversionStartTime = Date.now();

    let inputFileName = "";
    let outputFileName = "";
    let conversionTimeout: number | null = null;

    try {
      // Generate unique filenames
      const timestamp = Date.now();
      const inputExt = getFileExtension(uploadedFile.name);
      inputFileName = `input_${timestamp}.${inputExt}`;
      outputFileName = `output_${timestamp}.${selectedFormat}`;

      console.log(`Starting conversion: ${inputFileName} -> ${outputFileName}`);

      // Write input file with progress feedback
      loadingMessage = "Preparing file for conversion...";
      const inputData = new Uint8Array(await uploadedFile.arrayBuffer());
      await ffmpeg.writeFile(inputFileName, inputData);

      // Verify input file was written correctly
      try {
        const verifyInput = await ffmpeg.readFile(inputFileName);
        if (!verifyInput || verifyInput.length === 0) {
          throw new Error("Failed to write input file to FFmpeg filesystem");
        }
        console.log(
          `Input file written successfully: ${verifyInput.length} bytes`
        );
      } catch (verifyError) {
        throw new Error(`Input file verification failed: ${verifyError}`);
      }

      // Get basic info about the input file first
      try {
        loadingMessage = "Analyzing input file...";
        await ffmpeg.exec(["-i", inputFileName, "-f", "null", "-"]);
      } catch (probeError) {
        console.log("File probe completed (expected error)");
      }

      const quality =
        qualitySettings[videoQuality as keyof typeof qualitySettings];

      let finalCommand: string[] = [];

      if (selectedFormat === "mp4") {
        finalCommand = [
          "-i",
          inputFileName,
          "-c:v",
          "libx264",
          "-preset",
          quality.preset,
          "-crf",
          quality.crf,
          "-c:a",
          "aac",
          "-b:a",
          quality.audioBitrate,
          "-movflags",
          "+faststart",
          "-pix_fmt",
          "yuv420p", // Ensures compatibility
          "-y",
          outputFileName,
        ];
      } else if (selectedFormat === "webm") {
        finalCommand = [
          "-i",
          inputFileName,
          "-c:v",
          "libvpx",
          "-crf",
          "30",
          "-b:v",
          "1M",
          "-c:a",
          "libvorbis",
          "-b:a",
          quality.audioBitrate,
          "-y",
          outputFileName,
        ];
      } else if (selectedFormat === "avi") {
        finalCommand = [
          "-i",
          inputFileName,
          "-c:v",
          "libx264",
          "-preset",
          quality.preset,
          "-crf",
          quality.crf,
          "-c:a",
          "libmp3lame",
          "-b:a",
          quality.audioBitrate,
          "-y",
          outputFileName,
        ];
      } else {
        // Generic command for MOV and MKV
        finalCommand = [
          "-i",
          inputFileName,
          "-c:v",
          "libx264",
          "-preset",
          quality.preset,
          "-crf",
          quality.crf,
          "-c:a",
          "aac",
          "-b:a",
          quality.audioBitrate,
          "-y",
          outputFileName,
        ];
      }

      if (quality.maxWidth && quality.maxWidth < 1920) {
        // Insert scaling filter before output filename
        const outputIndex = finalCommand.indexOf(outputFileName);
        finalCommand.splice(
          outputIndex,
          0,
          "-vf",
          `scale=${quality.maxWidth}:-2`
        );
      }

      // Add frame rate limit if specified
      if (quality.fps) {
        const outputIndex = finalCommand.indexOf(outputFileName);
        finalCommand.splice(outputIndex, 0, "-r", quality.fps);
      }

      console.log("FFmpeg command:", finalCommand.join(" "));

      // Set conversion timeout (15 minutes max)
      const timeoutDuration = 15 * 60 * 1000;
      conversionTimeout = setTimeout(() => {
        throw new Error(
          `Conversion timeout after ${timeoutDuration / 60000} minutes`
        );
      }, timeoutDuration);

      // Execute conversion with enhanced error detection
      loadingMessage = "Converting video...";
      let conversionSuccessful = false;

      try {
        await ffmpeg.exec(finalCommand);
        conversionSuccessful = true;
      } catch (execError) {
        console.warn("First conversion attempt failed:", execError);

        loadingMessage = "Retrying with simpler encoding...";

        const fallbackCommand = [
          "-i",
          inputFileName,
          "-c:v",
          "libx264",
          "-preset",
          "ultrafast",
          "-crf",
          "28",
          "-c:a",
          "aac",
          "-y",
          outputFileName,
        ];

        console.log("Fallback command:", fallbackCommand.join(" "));

        try {
          await ffmpeg.exec(fallbackCommand);
          conversionSuccessful = true;
        } catch (fallbackError) {
          throw new Error(
            `Both conversion attempts failed. Primary: ${execError}. Fallback: ${fallbackError}`
          );
        }
      }

      if (conversionTimeout) {
        clearTimeout(conversionTimeout);
        conversionTimeout = null;
      }

      let outputData: Uint8Array;
      try {
        outputData = (await ffmpeg.readFile(outputFileName)) as Uint8Array;
      } catch (readError) {
        try {
          const files = await ffmpeg.listDir("/");
          console.log("Files in FFmpeg filesystem:", files);
        } catch (listError) {
          console.warn("Could not list filesystem contents");
        }

        const msg =
          readError instanceof Error ? readError.message : String(readError);
        throw new Error(
          `Failed to read converted file: ${msg}. The conversion may have failed silently.`
        );
      }

      // Multiple validation checks
      if (!outputData) {
        throw new Error("Output data is null - conversion failed");
      }

      if (outputData.length === 0) {
        throw new Error("Conversion produced zero-byte output file");
      }

      if (outputData.length < 1000) {
        // Check if it's a valid video header at least
        const dataView = new DataView(outputData.buffer);
        let hasValidHeader = false;

        if (selectedFormat === "mp4") {
          // Check for MP4 box signature
          if (outputData.length >= 8) {
            const boxType = String.fromCharCode(
              dataView.getUint8(4),
              dataView.getUint8(5),
              dataView.getUint8(6),
              dataView.getUint8(7)
            );
            hasValidHeader = ["ftyp", "moov", "mdat"].includes(boxType);
          }
        } else if (selectedFormat === "webm") {
          // Check for WebM/Matroska signature
          hasValidHeader =
            outputData[0] === 0x1a &&
            outputData[1] === 0x45 &&
            outputData[2] === 0xdf &&
            outputData[3] === 0xa3;
        } else if (selectedFormat === "avi") {
          // Check for AVI RIFF signature
          hasValidHeader =
            outputData[0] === 0x52 &&
            outputData[1] === 0x49 &&
            outputData[2] === 0x46 &&
            outputData[3] === 0x46;
        }

        if (!hasValidHeader) {
          throw new Error(
            `Conversion produced invalid ${selectedFormat.toUpperCase()} file (${outputData.length} bytes). The file may be corrupted.`
          );
        }
      }

      // Check minimum reasonable file size (1KB for very short videos)
      if (outputData.length < 1024) {
        console.warn(`Output file is very small: ${outputData.length} bytes`);
      }

      // Create and download file
      const blob = new Blob([outputData], { type: formatConfig.mime });
      downloadConvertedFile(
        blob,
        `converted_${uploadedFile.name.split(".")[0]}.${selectedFormat}`
      );

      console.log(
        `Conversion completed successfully. Output size: ${formatFileSize(outputData.length)}`
      );
      loadingMessage = "Conversion completed successfully!";
    } catch (error) {
      if (conversionTimeout) {
        clearTimeout(conversionTimeout);
      }

      console.error("Video conversion failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Enhanced error analysis with specific solutions
      const isMemoryError =
        /memory|out of bounds|wasm/i.test(errorMessage) ||
        conversionLog.some((log) => /memory|out of bounds/i.test(log));

      const isCodecError =
        /codec|encoder|decoder/i.test(errorMessage) ||
        conversionLog.some((log) => /codec|encoder|decoder/i.test(log));

      const isEmptyOutputError =
        errorMessage.includes("empty output") ||
        errorMessage.includes("zero-byte") ||
        errorMessage.includes("suspiciously small");

      let errorHint = "";
      if (isMemoryError) {
        errorHint =
          "\n\n💡 SOLUTION: Use 'Low Quality' setting or try a smaller/shorter video file. Browser memory is limited.";
      } else if (isCodecError) {
        errorHint =
          "\n\n💡 SOLUTION: Try MP4 format which has the best compatibility, or try a different input file.";
      } else if (isEmptyOutputError) {
        errorHint =
          "\n\n💡 SOLUTION: Your video file might be corrupted or in an unsupported format. Try:\n- Converting to MP4 first\n- Using a different video file\n- Checking if the file plays correctly outside the browser";
      } else {
        errorHint =
          "\n\n💡 TIP: Try MP4 format with Low Quality settings for best compatibility.";
      }

      const recentLogs = conversionLog
        .slice(-3)
        .filter(
          (log) =>
            log.includes("error") ||
            log.includes("failed") ||
            log.includes("invalid")
        )
        .join("\n");

      const logInfo = recentLogs ? `\n\nError details:\n${recentLogs}` : "";

      alert(`❌ Conversion Failed\n\n${errorMessage}${errorHint}${logInfo}`);
    } finally {
      // Perform cleanup
      if (ffmpeg) {
        try {
          if (inputFileName) await ffmpeg.deleteFile(inputFileName);
          if (outputFileName) await ffmpeg.deleteFile(outputFileName);
        } catch (cleanupError) {
          console.warn("Cleanup warning:", cleanupError);
        }
      }

      if (conversionTimeout) {
        clearTimeout(conversionTimeout);
      }

      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }

      isConverting = false;
      progress = 0;
      estimatedTime = "";
      loadingMessage = isFFmpegLoaded
        ? "Ready for next conversion"
        : loadingMessage;
    }
  }

  function downloadConvertedFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  function getFileExtension(filename: string): string {
    return filename.split(".").pop()?.toLowerCase() || "mp4";
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  }

  function formatTime(ms: number): string {
    if (!ms || ms < 0) return "calculating...";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    } else {
      return `${seconds}s`;
    }
  }

  function getQualityDescription(quality: string): string {
    const descriptions = {
      high: "Best quality, slower conversion, 100MB limit",
      medium: "Good quality and speed, 150MB limit",
      low: "Fast conversion, smaller files, 200MB limit",
    };
    return descriptions[quality as keyof typeof descriptions] || "";
  }

  function getEstimatedConversionTime(
    fileSizeBytes: number,
    quality: string
  ): string {
    const baseTimePerMB = { high: 15, medium: 8, low: 4 }; // seconds per MB
    const fileSizeMB = fileSizeBytes / (1024 * 1024);
    const estimatedSeconds =
      fileSizeMB * baseTimePerMB[quality as keyof typeof baseTimePerMB];
    return formatTime(estimatedSeconds * 1000);
  }

  onMount(() => {
    loadFFMpeg();
  });

  onDestroy(() => {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
  });
</script>

<MediaButton />
<SideBar />

<div class="card w-[50%] pr-10 pb-10 pt-10 ml-[30%] mt-[-10%]">
  <div class="mt-0 ml-10">
    {#if !isFFmpegLoaded}
      <div class="text-center p-6">
        <div class="animate-spin text-4xl mb-4">⚙️</div>
        <div class="text-lg font-semibold">{loadingMessage}</div>
        {#if loadingProgress > 0}
          <div class="w-full bg-surface-300-600-token rounded-full h-2 mt-4">
            <div
              class="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style="width: {loadingProgress}%"
            ></div>
          </div>
          <div class="text-sm mt-2">{Math.round(loadingProgress)}%</div>
        {/if}
        <div class="text-sm opacity-75 mt-2">
          Large library download required for video processing
        </div>
      </div>
    {:else}
      <FileDropzone
        name="video-files"
        accept="video/*,.mp4,.avi,.mov,.mkv,.webm,.flv,.wmv,.m4v,.3gp"
        on:change={handleFileUpload}
        class="flex justify-start space-x-72"
        disabled={isConverting}
      >
        <svelte:fragment slot="message">
          <div class="text-center">
            <i class="fa-solid fa-video text-4xl opacity-75"></i>
            <div class="text-lg font-semibold">Upload Video File</div>
            <div class="text-sm opacity-75">
              Supports MP4, AVI, MOV, MKV, WebM, FLV, WMV
            </div>
            <div class="text-xs opacity-60 mt-1">
              Size limits: High(100MB) | Medium(150MB) | Low(200MB)
            </div>
          </div>
        </svelte:fragment>
      </FileDropzone>

      <div class="mt-5 space-y-4">
        <!-- Quality Selection -->
        <div>
          <label
            for="quality-select"
            class="format-label text-primary-500 font-semibold block mb-2"
          >
            Quality & Speed:
          </label>
          <select
            id="quality-select"
            class="select w-full"
            bind:value={videoQuality}
            disabled={isConverting}
          >
            <option value="high">High Quality (Slow)</option>
            <option value="medium">Medium Quality (Balanced)</option>
            <option value="low">Low Quality (Fast)</option>
          </select>
          <div class="text-xs text-surface-600-300-token mt-1">
            {getQualityDescription(videoQuality)}
          </div>
        </div>

        <!-- Format Selection -->
        <div>
          <label
            for="format-select"
            class="format-label text-primary-500 font-semibold block mb-2"
          >
            Output Format:
          </label>
          <select
            id="format-select"
            class="select w-full"
            bind:value={selectedFormat}
            disabled={isConverting}
          >
            <option value="">Choose format...</option>
            {#each Object.keys(SUPPORTED_FORMATS) as format}
              <option value={format}>{format.toUpperCase()}</option>
            {/each}
          </select>
        </div>
      </div>

      {#if uploadedFile}
        <div class="mt-4 p-3 bg-surface-100-800-token rounded-lg">
          <div class="text-sm font-semibold text-surface-700-200-token">
            📹 {uploadedFile.name}
          </div>
          <div class="text-xs text-surface-600-300-token mt-1 space-y-1">
            <div>
              Size: {formatFileSize(uploadedFile.size)} | Type: {uploadedFile.type}
            </div>
            {#if selectedFormat && videoQuality}
              <div>
                Estimated conversion time: ~{getEstimatedConversionTime(
                  uploadedFile.size,
                  videoQuality
                )}
              </div>
            {/if}
          </div>
        </div>
      {/if}

      {#if isConverting}
        <div class="mt-4 p-4 bg-primary-100-800-token rounded-lg">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-semibold">Converting Video...</span>
            <div class="text-right">
              <div class="text-sm font-bold">{progress}%</div>
              {#if estimatedTime && estimatedTime !== "calculating..."}
                <div class="text-xs opacity-75">{estimatedTime} remaining</div>
              {/if}
            </div>
          </div>
          <div class="w-full bg-surface-300-600-token rounded-full h-3">
            <div
              class="bg-gradient-to-r from-primary-500 via-secondary-400 to-tertiary-500 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
              style="width: {progress}%"
            ></div>
          </div>

          <div class="mt-3 text-xs text-surface-600-300-token">
            Status: {loadingMessage}
          </div>

          {#if conversionLog.length > 0}
            <details class="mt-2">
              <summary
                class="text-xs cursor-pointer text-surface-600-300-token hover:text-surface-500-400-token"
              >
                Technical Details ({conversionLog.length} logs)
              </summary>
              <div
                class="mt-2 text-xs font-mono bg-surface-200-700-token p-2 rounded max-h-24 overflow-y-auto border"
              >
                {#each conversionLog.slice(-8) as log, i}
                  <div class="opacity-{i < 4 ? '50' : '75'} py-0.5">{log}</div>
                {/each}
              </div>
            </details>
          {/if}
        </div>
      {/if}
    {/if}
  </div>

  <button
    type="button"
    class="btn variant-filled-primary convert-button mt-6"
    on:click={convertVideo}
    disabled={isConverting ||
      !selectedFormat ||
      !uploadedFile ||
      !isFFmpegLoaded}
  >
    {#if !isFFmpegLoaded}
      Loading FFmpeg... {loadingProgress > 0
        ? `${Math.round(loadingProgress)}%`
        : ""}
    {:else if isConverting}
      Converting... {progress}%
    {:else}
      Convert Video
    {/if}
  </button>
</div>

<style>
  .format-label {
    color: #24afb2;
  }

  .convert-button {
    width: 60%;
    margin: 0 auto;
    display: block;
    color: white;
    min-height: 48px;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  .convert-button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .convert-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .card {
      width: 95%;
      margin-left: 2.5%;
      margin-top: 20px;
      padding: 20px;
    }

    .convert-button {
      width: 100%;
    }

    .select {
      width: 100% !important;
    }
  }

  @media (max-width: 480px) {
    .card {
      padding: 15px;
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin {
    animation: spin 2s linear infinite;
  }
</style>
