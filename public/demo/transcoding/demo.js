let originalFile = null;

function updateStatus(message, isError = false, isProcessing = false) {
  const statusEl = document.getElementById('status');
  statusEl.style.display = 'block';
  statusEl.textContent = message;
  statusEl.classList.remove('error', 'processing');
  if (isError) {
    statusEl.classList.add('error');
  } else if (isProcessing) {
    statusEl.classList.add('processing');
  }
}

function updateStats(progress) {
  const updateStat = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value.toString();
  };

  updateStat('stat-frames', progress.frameCount);
  updateStat('stat-fps', progress.fps.toFixed(1));
  updateStat('stat-elapsed', progress.elapsedSeconds.toFixed(1) + 's');
  updateStat('stat-demuxer-buffer', progress.demuxer.bufferSize);
  updateStat('stat-decoder-queue', progress.decoder.decodeQueueSize);
  updateStat('stat-decoder-buffer', progress.decoder.bufferSize);
  updateStat('stat-render-buffer', progress.render.bufferSize);
  updateStat('stat-encoder-queue', progress.encoder.encodeQueueSize);
  updateStat('stat-encoder-buffer', progress.encoder.bufferSize);
}

async function transcodeFile(file) {
  const statsPanel = document.getElementById('statsPanel');
  const controlPanel = document.getElementById('controlPanel');
  const statusEl = document.getElementById('status');

  try {
    // Hide control panel and show stats
    controlPanel.style.display = 'none';
    statusEl.style.display = 'none';
    statsPanel.style.display = 'block';

    // Import transcoding function from npm package
    const { transcodeFile: transcode } = await import('https://unpkg.com/webcodecs-examples@latest/dist/index.js');

    console.log('Starting transcode for:', file.name);

    // Transcode with progress reporting
    const result = await transcode(file, {
      method: 'pipeline',
      pipelineOptions: {
        onProgress: (progress) => {
          // Update pipeline stats
          updateStats(progress);
        },
      },
    });

    console.log('Transcoding complete:', result);

    // Hide stats panel
    statsPanel.style.display = 'none';

    updateStatus(
      `✓ Complete! Output: ${(result.size / 1024 / 1024).toFixed(2)} MB (${((1 - result.size / file.size) * 100).toFixed(1)}% size reduction)`
    );

    // Show preview
    showPreview(file, result);

  } catch (error) {
    console.error('Transcoding error:', error);
    statsPanel.style.display = 'none';
    updateStatus(`✗ Error: ${error.message}`, true);
    throw error;
  }
}

function showPreview(originalFile, transcodedBlob) {
  const previewContainer = document.getElementById('previewContainer');
  const originalVideo = document.getElementById('originalVideo');
  const transcodedVideo = document.getElementById('transcodedVideo');
  const downloadLink = document.getElementById('downloadLink');

  // Set up original video
  const originalUrl = URL.createObjectURL(originalFile);
  originalVideo.src = originalUrl;
  originalVideo.load();

  // Set up transcoded video
  const transcodedUrl = URL.createObjectURL(transcodedBlob);
  transcodedVideo.src = transcodedUrl;
  transcodedVideo.load();

  // Set up download link
  downloadLink.href = transcodedUrl;
  downloadLink.download = originalFile.name.replace(/\.[^/.]+$/, '') + '-transcoded.mp4';
  downloadLink.target = '_blank';
  downloadLink.style.display = 'inline-block';

  // Show preview container
  previewContainer.style.display = 'block';
}

async function processFile(file) {
  originalFile = file;

  const uploadBtn = document.getElementById('uploadBtn');
  uploadBtn.disabled = true;

  try {
    await transcodeFile(file);
  } catch (error) {
    // Error already handled in transcodeFile
    uploadBtn.disabled = false;
  }
}

// Set up UI
document.addEventListener('DOMContentLoaded', () => {
  const uploadBtn = document.getElementById('uploadBtn');
  const fileInput = document.getElementById('fileInput');

  uploadBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  });
});
