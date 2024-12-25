import React, { useState, useRef, useCallback } from 'react';
import './ScreenRecorder.css';
import Modal from './Modal';

const ScreenRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true); // Estado para a modal
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Mensagem de sucesso
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Combinar streams de vídeo e áudio
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

  // Inicia a gravação
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

  // Para a gravação
  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }, []);

  // Faz o download do arquivo e exibe mensagem de sucesso
  const downloadRecording = useCallback(() => {
    if (recordedChunks.length === 0) return;

    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'screen-recording.webm';
    link.click();

    URL.revokeObjectURL(url);
    setRecordedChunks([]);
    setSuccessMessage('Arquivo salvo com sucesso!');
    setTimeout(() => setSuccessMessage(null), 3000); // Mensagem desaparece após 3 segundos
  }, [recordedChunks]);

  // Fecha o modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="screen-recorder-container">
      <div className='top'>Screen Recorder</div>
      
      {/* Modal para selecionar a tela */}
      <Modal isOpen={isModalOpen} onClose={closeModal} />

      <div>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`recording-btn ${isRecording ? 'stop' : 'start'}`}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        {recordedChunks.length > 0 && (
          <button onClick={downloadRecording} className="download-btn">
            Download Recording
          </button>
        )}
      </div>

      {/* Mensagem de sucesso */}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
    </div>
  );
};

export default ScreenRecorder;
