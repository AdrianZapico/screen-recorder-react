import { useState } from 'react';

const useFileUpload = (recordedChunks: Blob[]) => {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileUpload = async () => {
    if (recordedChunks.length === 0) return;

    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const formData = new FormData();
    formData.append('video', blob, 'recorded-video.webm');

    setIsLoading(true);

    try {
      const response = await fetch('https://screen-recorder-backend.onrender.com/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const downloadUrl = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(downloadUrl);
        link.download = 'converted-video.mp4';
        link.click();

        setSuccessMessage('Arquivo pronto para download!');
        setTimeout(() => setSuccessMessage(null), 2500);
      } else {
        throw new Error('Erro ao enviar o arquivo');
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      setSuccessMessage('Erro ao enviar o arquivo');
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, handleFileUpload, successMessage };
};

export default useFileUpload;
