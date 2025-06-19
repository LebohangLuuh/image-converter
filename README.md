
# [Image Converter Svelte App](https://image-converter-ruddy-theta.vercel.app/)

A simple web application for converting images between formats (PNG, JPEG, JPG, WEBP) directly in your browser. Built with Svelte and Skeleton UI.

## Features

- Drag-and-drop or select image files (PNG, JPEG, JPG)
- Choose output format: PNG, JPEG, JPG, or WEBP
- Client-side conversion (no server upload)
- Download the converted image instantly
- File validation (type and size limit: 5MB)
- modern UI

## Demo

![Demo Screenshot](<Screenshot (1).png>)
## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/image-converter-svelte.git
   cd image-converter-svelte
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

### Running the App

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal) in your browser.

## Usage

1. Drag and drop an image file into the dropzone, or click to select a file.
2. Choose the desired output format from the dropdown menu.
3. Click "Download Image" to save the converted file.

## Project Structure

```
src/
  └── ImageConverter.svelte   # Main component for image conversion
  └── main.ts                 # Svelte app entry point
  └── app.html                # HTML template
```

## Technologies Used

- [Svelte](https://svelte.dev/)
- [Skeleton UI](https://www.skeleton.dev/) (for FileDropzone and styling)
- TypeScript

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT License. See [LICENSE](LICENSE) for details.

