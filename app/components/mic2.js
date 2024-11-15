'use client';
import React, { useState, useEffect } from 'react';

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [recorder, setRecorder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('mic-recorder').then((module) => {
        const MicRecorder = module.default;
        const newRecorder = new MicRecorder({
          bitRate: 128,
          encoder: 'mp3',
          sampleRate: 44100
        });
        setRecorder(newRecorder);
      }).catch(err => {
        setError('Failed to initialize recorder');
        console.error(err);
      });
    }
  }, []);

  const startRecording = () => {
    if (!recorder) return;

    recorder.start()
      .then(() => {
        setIsRecording(true);
        setError('');
      })
      .catch((e) => {
        setError('Error starting recording. Please check microphone permissions.');
        console.error(e);
      });
  };

  const stopRecording = () => {
    if (!recorder) return;

    recorder.stop()
      .getAudio()
      .then(([buffer, blob]) => {
        const file = new File(buffer, 'recording.mp3', {
          type: blob.type,
          lastModified: Date.now()
        });
        
        const url = URL.createObjectURL(file);
        setAudioURL(url);
        setIsRecording(false);
      })
      .catch((e) => {
        setError('Could not retrieve the recording');
        console.error(e);
        setIsRecording(false);
      });
  };

  const playAudio = () => {
    if (audioURL) {
      const player = new Audio(audioURL);
      player.play().catch(e => {
        setError('Error playing audio');
        console.error(e);
      });
    }
  };

  const downloadAudio = () => {
    if (audioURL) {
      const link = document.createElement('a');
      link.href = audioURL;
      link.download = 'recording.mp3';
      link.click();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Voice Recorder</h2>
      
      <div className="space-y-4">
        <div className="flex justify-center">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              Stop Recording
            </button>
          )}
        </div>

        {audioURL && !isRecording && (
          <div className="flex justify-center space-x-4">
            <button
              onClick={playAudio}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Play
            </button>
            <button
              onClick={downloadAudio}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              Download
            </button>
          </div>
        )}

        {error && (
          <div className="text-red-500 text-center mt-2 p-2 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        {isRecording && (
          <div className="text-center text-sm text-gray-500">
            Recording in progress...
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;