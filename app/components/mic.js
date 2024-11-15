'use client'

import React, { useState, useEffect } from 'react';

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [recorder, setRecorder] = useState(null);
  const [error, setError] = useState('');
  const [audioChunks, setAudioChunks] = useState([]);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [hasAudioDevice, setHasAudioDevice] = useState(false);

  // Check if audio devices are available
  useEffect(() => {
    const checkAudioDevices = async () => {
      try {
        // First check if the API is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          setError('Media devices API not supported in this browser.');
          return;
        }

        // Get list of devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = devices.filter(device => device.kind === 'audioinput');
        
        if (audioDevices.length === 0) {
          setError('No microphone found. Please connect a microphone and refresh the page.');
          setHasAudioDevice(false);
        } else {
          setHasAudioDevice(true);
          setError('');
        }
      } catch (err) {
        setError('Error checking audio devices. Please ensure you have a working microphone.');
        console.error('Device enumeration error:', err);
      }
    };

    checkAudioDevices();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && hasAudioDevice) {
      import('mic-recorder').then((module) => {
        const MicRecorder = module.default;
        const recorder = new MicRecorder({
          bitRate: 128,
          encoder: 'wav',
        });
        setRecorder(recorder);
      }).catch(err => {
        setError('Failed to initialize recorder. Please refresh the page.');
        console.error('Recorder initialization error:', err);
      });
    }
  }, [hasAudioDevice]);

  const requestPermission = async () => {
    try {
      if (!hasAudioDevice) {
        setError('No microphone found. Please connect a microphone and refresh the page.');
        return;
      }

      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setPermissionGranted(true);
      setError('');
      // Stop the tracks after getting permission
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No microphone found. Please connect a microphone and refresh the page.');
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone permission denied. Please allow access in your browser settings.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Your microphone is busy or unavailable. Please close other applications using it.');
      } else {
        setError('Error accessing microphone. Please check your device settings.');
      }
      console.error('Permission error:', err);
    }
  };

  const startRecording = async () => {
    try {
      if (!hasAudioDevice) {
        setError('No microphone found. Please connect a microphone and refresh the page.');
        return;
      }

      if (!permissionGranted) {
        await requestPermission();
        return;
      }

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
      setError('Recording failed to start. Please check your microphone connection.');
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
      setError('Recording failed to stop. Please refresh the page and try again.');
      console.error('Stop recording error:', e);
    }
  };

  const playAudio = () => {
    if (audioURL) {
      const audio = new Audio(audioURL);
      audio.play().catch(err => {
        setError('Failed to play audio. Please try downloading instead.');
        console.error('Playback error:', err);
      });
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
        {hasAudioDevice && !permissionGranted ? (
          <div className="text-center">
            <button
              onClick={requestPermission}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Allow Microphone Access
            </button>
          </div>
        ) : hasAudioDevice && permissionGranted ? (
          <>
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
          </>
        ) : null}

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

        {!error && !permissionGranted && hasAudioDevice && (
          <div className="text-center text-sm text-gray-500 mt-2">
            Please allow microphone access to start recording
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;