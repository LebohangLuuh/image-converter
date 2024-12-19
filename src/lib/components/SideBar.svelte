<script>
import '@fortawesome/fontawesome-free/css/all.min.css';

function closeWindow() {
            window.close();
        }
</script>

<div class="mt-0" style="margin-left: 155px;">
<ul>
    <li style="--i:6" data-icon="&#xf03e"><a href="/">Image</a></li>
    <li style="--i:5" data-icon="&#xf15b"><a href=".//../Docs">Document</a></li>
    <li style="--i:4" data-icon="&#xf001"><a href=".//../Audio">Audio</a></li>
    <li style="--i:3" data-icon="&#xf03d"><a href=".//../Video">Video</a></li>
    <li style="--i:1" data-icon="&#xf2f5"><a href="javascript:void(0);" on:click={closeWindow}>Exit</a>
    </li>
</ul>
</div>

<style>
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
        color: #fff;
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