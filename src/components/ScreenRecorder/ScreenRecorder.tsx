import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import Spinner from '../Spinner/Spinner';
import useRecorder from '../../hooks/useRecorder';
import useFileUpload from '../../hooks/useFileUpload';
import './ScreenRecorder.css'

const ScreenRecorder: React.FC = () => {
  const { isRecording, startRecording, stopRecording, recordedChunks } = useRecorder();
  const { isLoading, handleFileUpload, successMessage } = useFileUpload(recordedChunks);

  const [isModalOpen, setIsModalOpen] = useState(true);

  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="screen-recorder-container">
      <div className="top">Screen Recorder</div>
      <Modal isOpen={isModalOpen} onClose={closeModal} />

      
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

        {isLoading && <div className="spinner-container">
          <Spinner />
        </div>}
      

      {successMessage &&
        <div className="success-message">{successMessage}</div>}
    </div>
  );
};

export default ScreenRecorder;
