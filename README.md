# Multi-Format Media Converter

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-blue?style=for-the-badge)](https://image-converter-ruddy-theta.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with Svelte](https://img.shields.io/badge/Built%20with-Svelte-FF3E00?logo=svelte&logoColor=white)](https://svelte.dev/)

A comprehensive, browser-based media conversion tool supporting multiple file formats including images, documents, audio, and video files. All conversions are performed locally in your browser, ensuring complete privacy and data security.

## 🌟 Features

### Image Conversion
- **Supported Formats**: PNG, JPEG, JPG, WEBP
- **Canvas-based Processing**: High-quality client-side conversion
- **File Validation**: Type checking and 5MB size limit
- **Instant Download**: No server processing delays

### Document Conversion
- **Supported Formats**: DOCX, PDF, TXT, XLSX
- **Advanced PDF Processing**: Text extraction with PDF.js
- **Memory Optimized**: Dynamic processing limits based on file size
- **Smart Text Handling**: Proper formatting and character encoding

### Audio Conversion
- **Supported Formats**: MP3, WAV, OGG, AAC, M4A, FLAC
- **FFmpeg Integration**: Professional-grade audio processing
- **Quality Control**: Configurable bitrate and encoding settings
- **Progress Tracking**: Real-time conversion progress with time estimates

### Video Conversion
- **Supported Formats**: MP4, WebM, AVI, MOV, MKV
- **Quality Presets**: High, Medium, and Low quality options
- **Memory Management**: Dynamic file size limits to prevent browser crashes
- **Fallback Processing**: Automatic retry with simpler encoding if initial conversion fails

### Universal Features
- **Privacy-First**: All processing happens locally in your browser
- **No Upload Required**: Files never leave your device
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI**: Built with Skeleton UI components and Tailwind CSS
- **Error Handling**: Comprehensive error messages with actionable solutions

## 🚀 Live Demo

Experience the converter in action: **[Multi-Format Media Converter](https://image-converter-ruddy-theta.vercel.app/)**

## 📸 Screenshots

![Application Interface](Screenshot%20(1).png)
*Main interface showing the drag-and-drop upload area and format selection*

## 🛠️ Technology Stack

- **Framework**: [Svelte](https://svelte.dev/) with TypeScript
- **UI Components**: [Skeleton UI](https://www.skeleton.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Media Processing**: 
  - [FFmpeg.wasm](https://ffmpegwasm.netlify.app/) for audio/video conversion
  - [PDF.js](https://mozilla.github.io/pdf.js/) for PDF text extraction
  - [Mammoth.js](https://github.com/mwilliamson/mammoth.js) for DOCX processing
  - [SheetJS](https://sheetjs.com/) for spreadsheet handling
- **Deployment**: [Vercel](https://vercel.com/)

## 🏃‍♂️ Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ 
- [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), or [pnpm](https://pnpm.io/)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/multi-format-media-converter.git
cd multi-format-media-converter

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

## 📁 Project Structure

```
src/
├── lib/
│   └── components/
│       ├── MediaButton.svelte      # Navigation header component
│       └── SideBar.svelte          # Navigation sidebar
├── routes/
│   ├── +page.svelte               # Image converter (home page)
│   ├── Audio/
│   │   └── +page.svelte           # Audio converter
│   ├── Video/
│   │   └── +page.svelte           # Video converter
│   └── Docs/
│       └── +page.svelte           # Document converter
├── utils.ts                       # Utility functions
└── app.html                       # HTML template
```

## 🔧 Configuration

### File Size Limits

The application enforces the following size limits to ensure optimal performance:

- **Images**: 5MB
- **Documents**: 10-50MB (varies by type)
- **Audio**: 100MB
- **Video**: 200MB (reduced for browser memory constraints)

### Supported Conversions

| Source Format | Target Formats |
|---------------|----------------|
| **Images** | PNG ↔ JPEG ↔ JPG ↔ WEBP |
| **Documents** | PDF → TXT, DOCX<br>DOCX → TXT, PDF<br>TXT → PDF, DOCX, XLSX<br>XLSX → TXT |
| **Audio** | MP3 ↔ WAV ↔ OGG ↔ AAC ↔ M4A ↔ FLAC |
| **Video** | MP4 ↔ WebM ↔ AVI ↔ MOV ↔ MKV |

## 🔒 Privacy & Security

- **Local Processing**: All file conversions happen in your browser
- **No Data Collection**: Files are never uploaded to external servers
- **Memory Management**: Automatic cleanup prevents memory leaks
- **Secure Libraries**: PDF.js configured with security restrictions

## 🐛 Troubleshooting

### Common Issues

**"Conversion produced empty output file"**
- Try using MP4 format for video conversions (best compatibility)
- Use "Low Quality" setting for large video files
- Ensure input file is not corrupted

**"Memory access out of bounds"**
- Reduce file size or use lower quality settings
- Try refreshing the page to clear browser memory
- Use MP4 format which is most memory-efficient

**"Failed to load processing library"**
- Check your internet connection
- Disable ad blockers temporarily
- Try refreshing the page

### Performance Tips

- Use lower quality settings for large files
- Convert files one at a time for best performance
- Close other browser tabs to free up memory
- Use MP4/JPEG formats for best compatibility

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** and test thoroughly
4. **Commit your changes**: `git commit -m 'Add some feature'`
5. **Push to the branch**: `git push origin feature/your-feature-name`
6. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Add error handling for new features
- Test with various file formats and sizes
- Update documentation for new functionality
- Ensure mobile responsiveness

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FFmpeg](https://ffmpeg.org/) team for the incredible media processing capabilities
- [Mozilla PDF.js](https://mozilla.github.io/pdf.js/) for PDF processing
- [Skeleton UI](https://www.skeleton.dev/) for beautiful Svelte components
- [Vercel](https://vercel.com/) for seamless deployment platform

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search existing [GitHub Issues](https://github.com/yourusername/multi-format-media-converter/issues)
3. Create a new issue with detailed information about your problem

---

<div align="center">
  <p>Built with ❤️ using Svelte and modern web technologies</p>
  <p>
    <a href="#-quick-start">Get Started</a> •
    <a href="https://image-converter-ruddy-theta.vercel.app/">Live Demo</a> •
    <a href="#-troubleshooting">Support</a>
  </p>
</div>