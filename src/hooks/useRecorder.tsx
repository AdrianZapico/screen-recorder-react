import { useState, useRef, useCallback } from 'react';

const useRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const getCombinedStream = useCallback(async (): Promise<MediaStream> => {
    const [screenStream, audioStream] = await Promise.all([
      navigator.mediaDevices.getDisplayMedia({ video: true }),
      navigator.mediaDevices.getUserMedia({ audio: true }),
    ]);
    return new MediaStream([
      ...screenStream.getVideoTracks(),
      ...audioStream.getAudioTracks(),
    ]);
  }, []);

  const startRecording = useCallback(async () => {
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
  }, [getCombinedStream]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }, []);

  return { isRecording, startRecording, stopRecording, recordedChunks };
};

export default useRecorder;
