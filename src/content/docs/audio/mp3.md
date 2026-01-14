---
title: MP3
description: How to encode MP3
---

If your application needs to read or write audio-only files, you'll probably want to support MP3 files. Unfortunately, WebCodecs doesn't currently support MP3 [[1](../../datasets/codec-strings)], so you'll need a 3rd party library.

Fortunately, here are a few:


### MediaBunny

For this example, we won't work with the manual WebCodecs API since WebCodecs doesn't even support MP3 [[1](../../datasets/codec-strings)], so we'll use a pure MediaBunny example, which will take the audio source from whatever input file you provide, and transcode it to audio.

```typescript
import { registerMp3Encoder } from '@mediabunny/mp3-encoder';

import {
    Input,
    BlobSource,
    Output,
    BufferTarget,
    MP4,
    Mp3OutputFormat,
    Conversion,
} from 'mediabunny';


registerMp3Encoder();

const input = new Input({
    source: new BlobSource(file), // From a file picker, for example
    formats: [ALL_FORMATS],
});
const output = new Output({
    format: new Mp3OutputFormat(),
    target: new BufferTarget(),
});

const conversion = await Conversion.init({
    input,
    output,
});
await conversion.execute();

output.target.buffer; // => ArrayBuffer containing the MP3 file

```


### MP3Encoder

You can also use `MP3Encoder`, a utility in [webcodec-utils](https://www.npmjs.com/package/webcodecs-utils) which I wrote as a wrapper around [lamejs](https://github.com/zhuker/lamejs) (an MP3 Encoder written in JS), but adapted to work with WebCodecs.

Here's how you would use it:

``` typescript

import { MP3Encoder } from 'webcodecs-utils';

function encodeMP3(audio: AudioData[]): Blob {

    for(const chunk of audio){
        const mp3buf = <Uint8Array> audioEncoder.processBatch(chunk);
        audioEncoder.encodedData.push(mp3buf);
    }

    return audioEncoder!.finish();
}

```


### MP3Decoder

If you need to decode mp4 files, I wrote another wrapper called `MP3Decoder`. See the full API [here](https://github.com/sb2702/webcodecs-utils/blob/main/src/audio/mp3.ts)


```typescript
import { MP3Decoder } from 'webcodecs-utils';

function decodeMP3(file: File): AudioData[] {

    const decoder = new MP3Decoder();
    await decoder.initialize();

    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    //Returns AudioData
    return await decoder.toAudioData(arrayBuffer);
}

```
