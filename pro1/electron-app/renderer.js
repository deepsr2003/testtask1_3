const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');
let fileHandle, writable;

startBtn.onclick = async () => {
  const format = 'aac';
  fileHandle = await window.showSaveFilePicker({
    suggestedName: 'recording.aac',
    types: [{ description: 'AAC Audio', accept: { 'audio/aac': ['.aac'] } }]
  });
  writable = await fileHandle.createWritable();
  await window.api.start(format);
  window.api.onChunk(async chunk => {
    await writable.write(chunk);
  });
};

stopBtn.onclick = async () => {
  await window.api.stop();
  if (writable) await writable.close();
};
