'use client'

import React, { useState, useEffect } from 'react';
import { Mic, Square, Play, Download } from 'lucide-react';

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [timer, setTimer] = useState(0);
  const [recordedChunks, setRecordedChunks] = useState([]);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedChunks(chunks);
        setAudioURL(URL.createObjectURL(blob));
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setTimer(0);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const downloadRecording = () => {
    if (audioURL) {
      const a = document.createElement('a');
      a.href = audioURL;
      a.download = `recording-${new Date().toISOString()}.webm`;
      a.click();
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg space-y-4">
      <div className="text-center space-y-2">
        <div className="text-2xl font-bold text-gray-800">Audio Recorder</div>
        <div className="text-gray-500">{isRecording ? 'Recording...' : 'Ready'}</div>
        <div className="text-xl font-mono">{formatTime(timer)}</div>
      </div>

      <div className="flex justify-center space-x-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="flex items-center justify-center p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
          >
            <Mic size={24} />
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center justify-center p-3 rounded-full bg-gray-600 hover:bg-gray-700 text-white transition-colors"
          >
            <Square size={24} />
          </button>
        )}
      </div>

      {audioURL && (
        <div className="space-y-4">
          <audio controls className="w-full" src={audioURL} />
          <button
            onClick={downloadRecording}
            className="w-full flex items-center justify-center gap-2 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
          >
            <Download size={20} />
            Download Recording
          </button>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;