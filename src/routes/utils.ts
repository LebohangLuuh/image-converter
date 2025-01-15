/**
 * Downloads a file with the specified content and filename.
 * @param content - The content of the file to be downloaded.
 * @param filename - The name of the file to be saved.
 */
export function downloadFile(content: string | ArrayBuffer, filename: string): void {
    const blob = new Blob([content], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}