export async function upscaleImage(imageData: string, scale: number = 2): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                // Set canvas size to the upscaled dimensions
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;

                // Use CSS scaling for smoother results
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                // Draw the image at the new scale
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Convert to base64 with high quality
                const upscaledBase64 = canvas.toDataURL('image/webp', 0.92);
                resolve(upscaledBase64);
            };

            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };

            img.src = imageData;
        } catch (error) {
            reject(error);
        }
    });
}