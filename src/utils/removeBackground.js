export const removeWhiteBackground = (imageFile, threshold = 200) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r > threshold && g > threshold && b > threshold) {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      canvas.toBlob(
        (blob) => resolve(new File([blob], imageFile.name.replace(/\.[^.]+$/, '.png'), { type: 'image/png' })),
        'image/png'
      );

      URL.revokeObjectURL(img.src);
    };

    img.src = URL.createObjectURL(imageFile);
  });
};
