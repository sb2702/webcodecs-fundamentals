let videoTrack;
let audioTrack;
let stream;
let recorder = null;

const startWebcamBtn = document.getElementById('startWebcamBtn');
const startRecordingBtn = document.getElementById('startRecordingBtn');
const stopRecordingBtn = document.getElementById('stopRecordingBtn');
const downloadBtn = document.getElementById('downloadBtn');
const reloadBtn = document.getElementById('reloadBtn');
const status = document.getElementById('status');
const preview = document.getElementById('preview');
const playback = document.getElementById('playback');

// Import from CDN
const { WebcamRecorder, getWebcam } = await import('https://unpkg.com/webcodecs-examples@latest/dist/index.js');

// Start webcam
startWebcamBtn.addEventListener('click', async () => {
  try {
    const webcam = await getWebcam();
    videoTrack = webcam.videoTrack;
    audioTrack = webcam.audioTrack;
    stream = webcam.stream;

    preview.srcObject = stream;
    status.textContent = 'Webcam ready';

    startWebcamBtn.disabled = true;
    startRecordingBtn.disabled = false;
  } catch (error) {
    status.textContent = `Error: ${error.message}`;
  }
});

// Start recording
startRecordingBtn.addEventListener('click', async () => {
  try {
    recorder = new WebcamRecorder(videoTrack, audioTrack);
    await recorder.start();

    status.textContent = 'Recording...';
    startRecordingBtn.disabled = true;
    stopRecordingBtn.disabled = false;
    playback.style.display = 'none';
    downloadBtn.style.display = 'none';
  } catch (error) {
    status.textContent = `Error: ${error.message}`;
  }
});

// Stop recording
stopRecordingBtn.addEventListener('click', async () => {
  if (!recorder) return;

  try {
    status.textContent = 'Stopping...';
    const blob = await recorder.stop();

    // Stop camera
    stream.getTracks().forEach(track => track.stop());
    preview.srcObject = null;

    status.textContent = `Recording complete! Size: ${(blob.size / 1024 / 1024).toFixed(2)} MB`;

    // Hide recording buttons
    startWebcamBtn.style.display = 'none';
    startRecordingBtn.style.display = 'none';
    stopRecordingBtn.style.display = 'none';

    // Show playback
    const url = URL.createObjectURL(blob);
    playback.src = url;
    playback.style.display = 'block';

    // Setup download
    downloadBtn.onclick = () => {
      const a = document.createElement('a');
      a.href = url;
      a.download = 'webcam-recording.mp4';
      a.click();
    };
    downloadBtn.style.display = 'inline-block';

    // Show reload button
    reloadBtn.style.display = 'inline-block';

    recorder = null;
  } catch (error) {
    status.textContent = `Error: ${error.message}`;
  }
});
