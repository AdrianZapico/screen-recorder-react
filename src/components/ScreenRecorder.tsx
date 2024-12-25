import React, { useState, useRef, useCallback } from 'react';
import './ScreenRecorder.css';

const ScreenRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true); // Estado para a modal
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
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
  }, [recordedChunks]);

  const closeModal = () => {
    setIsModalOpen(false); // Fecha a modal quando o usuário clicar em "Começar"
  };

  return (
    <div className="screen-recorder-container">
      <h1>Screen Recorder</h1>
      
      {/* Modal informando sobre o processo */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Selecione a Tela ou Janela</h2>
            <p>
              Para começar a gravação, você precisará escolher a tela ou janela que deseja compartilhar.
            </p>
            <button onClick={closeModal}>Começar</button>
          </div>
        </div>
      )}
      
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
    </div>
  );
};

export default ScreenRecorder;
