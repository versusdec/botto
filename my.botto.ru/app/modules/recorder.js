define('recorder', ['microcore'], function (mc) {

    let r_stream, rt, recorder, blobUrl, blob, soundStream;

    const Recorder = {
        start: () => {
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

            navigator.mediaDevices.getUserMedia({audio: true}).then(async stream => {
                let chunks = [];
                r_stream = stream;
                recorder = new MediaRecorder(stream);
                const audioContext = new AudioContext();
                const audioSource = audioContext.createMediaStreamSource(stream);
                const analyser = audioContext.createAnalyser();
                audioSource.connect(analyser);
                const volumes = new Uint8Array(analyser.frequencyBinCount);
                const volumeCallback = () => {
                    analyser.getByteFrequencyData(volumes);
                    let bars = [];
                    for (let i = 0; i < 100; i++) {
                        bars.push(volumes[i] / 2 / 100)
                    }
                    mc.events.push('recorder.volumes', bars)
                };

                recorder.onstart = () => {
                    soundStream = setInterval(volumeCallback, 100);
                    mc.events.push('record.start', Date.now());
                };

                recorder.ondataavailable = e => {
                    // add stream data to chunks
                    chunks.push(e.data);
                    if (recorder.state === 'inactive') {
                        blob = new Blob(chunks, {type: 'audio/webm'});
                        blobUrl = URL.createObjectURL(blob);
                        mc.events.push('record.ready', {blob: blob, url: blobUrl})
                    }
                };
                recorder.start(1000);
            }).catch(console.error);
        },
        stop: async () => {
            clearInterval(rt);
            clearInterval(soundStream);
            if (recorder && recorder.state && recorder.state !== 'inactive') {
                recorder.stop();
            }
            if (r_stream) {
                r_stream.getAudioTracks()[0].stop();
                r_stream.getAudioTracks()[0].enabled = false;
            }
            mc.events.push('record.stop');
        }
    };

    return Recorder;
});
