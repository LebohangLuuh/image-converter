<script>
  import { page } from "$app/stores";
  import "@fortawesome/fontawesome-free/css/all.min.css";

  function shareWebsite() {
    if (navigator.share) {
      navigator
        .share({
          title: "Multi-Media converstion",
          text: "Check out this amazing website for media format conversion!",
          url: window.location.href,
        })
        .then(() => console.log("Successful share"))
        .catch((error) => console.log("Error sharing", error));
    } else {
      alert("Web Share API is not supported in your browser.");
    }
  }
</script>

<div class="mt-0" style="margin-left: 155px;">
  <ul>
    <li
      style="--i:6"
      data-icon="&#xf03e"
      class={$page.url.pathname === "/" ? "selected" : ""}
    >
      <a href="/">Image</a>
    </li>
    <li
      style="--i:5"
      data-icon="&#xf15b"
      class={$page.url.pathname === "/Docs" ? "selected" : ""}
    >
      <a href=".//../Docs">Document</a>
    </li>
    <li
      style="--i:4"
      data-icon="&#xf001"
      class={$page.url.pathname === "/Audio" ? "selected" : ""}
    >
      <a href=".//../Audio">Audio</a>
    </li>
    <li
      style="--i:3"
      data-icon="&#xf03d"
      class={$page.url.pathname === "/Video" ? "selected" : ""}
    >
      <a href=".//../Video">Video</a>
    </li>
    <li
      style="--i:1;"
      data-icon="&#xf064;"
      class={$page.url.pathname === "" ? "selected" : ""}
    >
      <button
        style="letter-spacing: 0.5em; text-transform: uppercase;"
        aria-label="Share"
        on:click|preventDefault={shareWebsite}>Share</button
      >
    </li>
  </ul>
</div>

<style>
  .selected {
    background: #24afb2;
    transform: translateX(-50px);
  }

  .selected::before {
    background: #b224a6;
  }

  .selected::after {
    background: #24afb2;
  }
  ul {
    position: relative;
    transform: skewY(-15deg);
  }

  li {
    position: relative;
    z-index: calc(1 * var(--i));
    list-style: none;
    width: 200;
    padding: 15px;
    background: #355557;
    transition: 0.5s;
  }

  li:hover {
    background: #24afb2;
    transform: translateX(-50px);
  }

  li::before {
    font-family: "fontAwesome";
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    content: attr(data-icon);
    position: absolute;
    top: 0;
    left: -40;
    width: 40px;
    height: 100%;
    background: #355557;
    transform-origin: right;
    transform: skewY(45deg);
    transition: 0.5s;
  }

  li:hover::before {
    background: #24afb2;
  }

  li::after {
    content: "";
    position: absolute;
    left: 0;
    top: -40px;
    width: 100%;
    height: 40px;
    background: #355557;
    transform-origin: bottom;
    transform: skewX(45deg);
    transition: 0.5s;
  }

  li:hover::after {
    background: #24afb2;
  }

  li a {
    color: #fff;
    display: block;
    text-transform: uppercase;
    letter-spacing: 0.5em;
    transition: 0.5s;
  }

  li a:hover {
    color: #fff;
  }

  li:last-child::after {
    box-shadow: -120px 120px 20px rgba(0, 0, 0, 0.25);
  }
</style>