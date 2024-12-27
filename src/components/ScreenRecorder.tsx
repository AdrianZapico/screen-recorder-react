import React, { useState, useRef, useCallback } from 'react';
import './ScreenRecorder.css';
import Modal from './Modal';

const ScreenRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const getCombinedStream = useCallback(async (): Promise<MediaStream> => {
    try {
      const [screenStream, audioStream] = await Promise.all([
        navigator.mediaDevices.getDisplayMedia({ video: true }),
        navigator.mediaDevices.getUserMedia({ audio: true }),
      ]);
      return new MediaStream([
        ...screenStream.getVideoTracks(),
        ...audioStream.getAudioTracks(),
      ]);
    } catch (error) {
      console.error('Error accessing screen/audio recording:', error);
      throw error;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const combinedStream = await getCombinedStream();
      const mediaRecorder = new MediaRecorder(combinedStream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, [getCombinedStream]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }, []);

 
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
        setTimeout(() => {
          setSuccessMessage(null); 
        }, 2500);
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

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="screen-recorder-container">
      <div className="top">Screen Recorder</div>

      <Modal isOpen={isModalOpen} onClose={closeModal} />

      <div>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`recording-btn ${isRecording ? 'stop' : 'start'}`}
        >
          {isRecording ? '🛑Stop Recording' : '▶️Start Recording'}
        </button>

        {recordedChunks.length > 0 && !isLoading && (
          <button onClick={handleFileUpload} className="upload-btn">
            Save Video
          </button>
        )}

        
        {isLoading && <div className="spinner">Carregando...</div>}
      </div>

      {successMessage && <div className="success-message">{successMessage}</div>}
    </div>
  );
};

export default ScreenRecorder;
