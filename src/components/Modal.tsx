import React from 'react';
import './Modal.css'; // Opcional, para estilos do modal

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null; // Não renderiza nada se não estiver aberto

  return (
    <div className="modal">
      <div className="modal-content">
      <h1>Screen Recorder Free React</h1>
        <h2>Como usar?</h2>
        <h2>Selecione a Tela ou Janela</h2>
        <p>
          Para começar a gravação, você precisará escolher a tela ou janela que deseja compartilhar.
        </p>
        <button onClick={onClose}>Começar</button>
      </div>
    </div>
  );
};

export default Modal;
