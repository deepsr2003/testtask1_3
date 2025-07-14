const startBtn = document.getElementById('startBtn');
const sysAudioTag = document.getElementById('systemAudio');
const micAudioTag = document.getElementById('micAudio');

startBtn.onclick = async () => {
  try {
    console.log('Requesting media...');
    const systemStream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
    
    // Remove video track — we only want system audio
    systemStream.getVideoTracks().forEach(track => systemStream.removeTrack(track));
    
    sysAudioTag.srcObject = systemStream;

    const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const audioCtx = new AudioContext();
    console.log('Loading worklet...');
    await audioCtx.audioWorklet.addModule('/audio/worklet-processor.js');

    const systemSrc = audioCtx.createMediaStreamSource(systemStream);
    const micSrc = audioCtx.createMediaStreamSource(micStream);

    const echoNode = new AudioWorkletNode(audioCtx, 'echo-canceller');

    systemSrc.connect(echoNode, 0, 0);
    micSrc.connect(echoNode, 0, 1);

    const destination = audioCtx.createMediaStreamDestination();
    echoNode.connect(destination);

    micAudioTag.srcObject = destination.stream;
    micAudioTag.play();

    console.log('Streams connected and processing started.');
  } catch (err) {
    console.error('Error:', err);
    alert('Error: ' + err.message);
  }
};
