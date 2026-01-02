---
title: Decoding & Encoding
description: Encoding and decoding audio
---

Just as with video, the WebCodecs for audio is designed to transform compressed audio into raw audio and vice versa.

![](/src/assets/content/audio/encode-decode/simplified-2.svg)


Specifically, the `AudioDecoder` tansforms `EncodedAudioChunk` objects into `AudioData`, and the `AudioEncoder` transforms `AudioData` into `EncodedAudioChunk` objects, and when decoding and encoding, there will be a 1:1 correspondence between `EncodedAudioChunk` objects and`AudioData` objects.

### Audio is easier

Encoding and Decoding is significantly easier for audio than it is for video for a few reasons:

* It is significantly less computationally intense
* It runs on the CPU, and does not require hardware acceleration
* It does not require inter-chunk dependencies

This all makes is so that encoding and decoding can be done as simple async process that you can await.

![](/src/assets/content/audio/encode-decode/web-audio-assembly-line.svg)

This makes pipelines more predictable and easy to work with.

### Decode

Audio decoding is simple enough that my actual production code (below) is simple enough to also be a hello world example

```typescript


function decodeAudio(chunks: EncodedAudioChunk[], config: AudioDecoderConfig): Promise<AudioData[]>{

    const decodedData: AudioData[] = [];
    const total_chunks = audio.chunks.length;
    let decoded_chunks = 0;

    return new Promise((resolve, reject) => {

        if(total_chunks === 0) return resolve(decodedData);
            
        const decoder = new AudioDecoder({
            output: (chunk: AudioData) => {
                decodedData.push(chunk);
                decoded_chunks += 1;
                if(decoded_chunks === total_chunks) return resolve(decodedData);
            },
            error: (e) => {console.warn("Error decoding audio", e);}
        });
    
        decoder.configure({
            codec: config.codec,
            sampleRate: config.sampleRate,
            numberOfChannels: config.numberOfChannels
        });
    
        for(const chunk of chunks){
            decoder.decode(chunk);
        }
        decoder.flush();
    
    });    
}

```

The only extra step would be getting the `AudioDecoderConfig`, which you can get via a demuxing library

##### MediaBunny

```typescript
import {Input, MP4, BlobSource} from 'media-bunny'

const input = new Input({
    formats: [MP4],
    source: new BlobSource(file),
});

const audioTrack = await input.getPrimaryAudioTrack();
const decoderConfig = <AudioDecoderConfig> await audioTrack.getDecoderConfig();
// This is what you'd supply to the `AudioDecoder` to start decoding
```

##### web-demuxer


```typescript
import {WebDemuxer} from 'web-demuxer'

const demuxer = new WebDemuxer({
    wasmFilePath: "https://cdn.jsdelivr.net/npm/web-demuxer@latest/dist/wasm-files/web-demuxer.wasm",
});

await demuxer.load(<File> file);
const mediaInfo = await demuxer.getMediaInfo();
const audioTrack = mediaInfo.streams.filter((s)=>s.codec_type_string === 'audio')[0];


const decoderConfig: AudioDecoderConfig = {
    codec: audioTrack.codec_string,
    sampleRate: audioTrack.sample_rate,
    numChannels: audioTrack.channels

}


```




### Encoder
Loop



### Memory


Chunked process








