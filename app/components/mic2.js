'use client'

import { useState, useEffect } from 'react';
import MicRecorder from 'mic-recorder';

const MicRecorderComponent = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [error, setError] = useState(null);
  const [recorder, setRecorder] = useState(null); // Track recorder instance

  useEffect(() => {
    // Only import the mic-recorder on the client-side
    const recorderInstance = new MicRecorder({
      bitRate: 128,
      encoder: 'mp3', // default is mp3, can be wav as well
      sampleRate: 44100, // default is 44100
    });

    setRecorder(recorderInstance); // Save the recorder instance to state

    // Cleanup on component unmount
    return () => {
      // Optionally stop the recorder if needed
      if (recorderInstance) {
        recorderInstance.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    if (!recorder) return; // Ensure recorder is available
    try {
      await recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recorder', err);
      setError('Could not start recording. Please check your microphone permissions.');
    }
  };

  const stopRecording = async () => {
    if (!recorder) return; // Ensure recorder is available
    try {
      const [buffer, blob] = await recorder.stop().getAudio();
      const file = new File(buffer, 'me-at-thevoice.mp3', {
        type: blob.type,
        lastModified: Date.now(),
      });
      setAudioFile(URL.createObjectURL(file));
      setIsRecording(false);
    } catch (err) {
      console.error('Error stopping recorder', err);
      setError('Could not retrieve your audio file.');
    }
  };

  return (
    <div>
      <h1>Mic Recorder</h1>
      <div>
        {isRecording ? (
          <button onClick={stopRecording}>Stop Recording</button>
        ) : (
          <button onClick={startRecording}>Start Recording</button>
        )}
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {audioFile && (
        <div>
          <p>Recording complete! Click to play:</p>
          <audio controls>
            <source src={audioFile} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
};

export default MicRecorderComponent;
