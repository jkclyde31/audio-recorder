'use client'

import React, { useState, useEffect } from 'react';
import { Mic, Square, Play, Download, Save } from 'lucide-react';

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [timer, setTimer] = useState(0);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recordingName, setRecordingName] = useState('');
  const [savedRecordings, setSavedRecordings] = useState([]);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Load saved recordings from localStorage on component mount
    const loadedRecordings = localStorage.getItem('audioRecordings');
    if (loadedRecordings) {
      setSavedRecordings(JSON.parse(loadedRecordings));
    }
  }, []);

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
      setRecordingName('');
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

  const saveRecording = () => {
    if (!recordingName.trim()) {
      setShowAlert(true);
      return;
    }

    const newRecording = {
      id: Date.now(),
      name: recordingName,
      date: new Date().toISOString(),
      duration: timer,
      url: audioURL
    };

    const updatedRecordings = [...savedRecordings, newRecording];
    setSavedRecordings(updatedRecordings);
    
    // Save to localStorage
    localStorage.setItem('audioRecordings', JSON.stringify(updatedRecordings));
    
    setShowAlert(false);
    setRecordingName('');
  };

  const downloadRecording = () => {
    if (audioURL) {
      const a = document.createElement('a');
      a.href = audioURL;
      const filename = recordingName || `recording-${new Date().toISOString()}`;
      a.download = `${filename}.webm`;
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
            aria-label="Start Recording"
          >
            <Mic size={24} />
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center justify-center p-3 rounded-full bg-gray-600 hover:bg-gray-700 text-white transition-colors"
            aria-label="Stop Recording"
          >
            <Square size={24} />
          </button>
        )}
      </div>

      {audioURL && (
        <div className="space-y-4">
          <audio controls className="w-full" src={audioURL} />
          
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Enter recording name"
              value={recordingName}
              onChange={(e) => setRecordingName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {showAlert && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                Please enter a name for your recording
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={saveRecording}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
              >
                <Save size={20} />
                Save
              </button>
              
              <button
                onClick={downloadRecording}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded transition-colors"
              >
                <Download size={20} />
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {savedRecordings.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Saved Recordings</h3>
          <div className="space-y-2">
            {savedRecordings.map((recording) => (
              <div
                key={recording.id}
                className="p-3 bg-gray-50 rounded-lg flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{recording.name}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(recording.date).toLocaleDateString()} - {formatTime(recording.duration)}
                  </div>
                </div>
                <audio controls src={recording.url} className="w-32" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;