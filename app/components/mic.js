'use client'

import React, { useState, useEffect } from 'react';

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [recorder, setRecorder] = useState(null);
  const [error, setError] = useState('');
  const [audioChunks, setAudioChunks] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('mic-recorder').then((module) => {
        const MicRecorder = module.default;
        const recorder = new MicRecorder({
          bitRate: 128,
          encoder: 'wav',
        });
        setRecorder(recorder);
      });
    }
  }, []);

  const startRecording = async () => {
    try {
      if (recorder) {
        setAudioChunks([]);
        await recorder.start();
        setIsRecording(true);
        setError('');

        recorder.on('data', (chunk) => {
          setAudioChunks((prevChunks) => [...prevChunks, chunk]);
        });
      }
    } catch (e) {
      setError('Please allow microphone access to record audio.');
      console.error('Recording error:', e);
    }
  };

  const stopRecording = async () => {
    try {
      if (recorder) {
        await recorder.stop();
        setIsRecording(false);

        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
      }
    } catch (e) {
      setError('Recording failed. Please try again.');
      console.error('Stop recording error:', e);
    }
  };

  const playAudio = () => {
    if (audioURL) {
      const audio = new Audio(audioURL);
      audio.play();
    }
  };

  const downloadAudio = () => {
    if (audioURL) {
      const link = document.createElement('a');
      link.href = audioURL;
      link.download = 'recording.wav';
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
          <div className="text-red-500 text-center mt-2">
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