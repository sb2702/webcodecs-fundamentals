---
title: Codecs
description: Codecs and codec strings
---

Codecs are the algorithms for turning raw video frames into compact binary encoded video data.

![](/src/assets/content/basics/codecs/codec.png)


We won't go into how these algorithms actually work (video compression is it's own big-buck-bunny-sized rabbit hole) but this article will cover the practical basics that you need to know as a developer building a WebCodecs application.


### Main Video Codecs

There are a few major video codecs used in the industry, here are the ones you need to know about for WebCodecs.

**H264**: Also known as 'AVC' (Advanced Video Codec). By far the most common codec for common consumer video use. Most "mp4" files that you will find will typically use the h264 codec. This is a patented codec, so while users can freely use h264 players to watch video, large organizations which encode lots of video using h264 may be liable to pay patent royalties.

**H265** - Also known as 'HEVC'. Less common, newer, and has better compression than h264. Fairly widely supported but with major exceptions, same patent concerns as the h264.

**VP8** - Open source video codec, used often in WebRTC because it is very fast for encoding, though the quality of compression is not as good as other codecs.

**VP9** - Successor to VP8, also open source, devloped at Google, many videos on YouTube are encoded with VP9 and also fairly well supported

**AV1** - The latest, most advanced open source codec, with better compression than all the above options, developed by an independent consortium of organizations. Decoding/playback is widely supported across devices and browsers, but because encoding is significantly slower / more expensive than VP9, encoding support on consumer devices is not as widespread.


#### How to practically chose a codec

**Decoding**

If you have a video supplied by a user or some standard 3rd party source, the codec (and specific codec string) will be stored in the metadata of the actual video file.

In that sense, you don't have a choice of codec, you just need to find the codec string from the video to feed to the `VideoDecoder`, and demuxing libraries provide this.

```typescript
const input = new Input({
    formats: [MP4],
    source: new BlobSource(file),
});

const videoTrack = await input.getPrimaryVideoTrack();
// videoTrack.codec => avc (h264)
const codec_string = await input.getCodecParameterString();
// Full codec string used by decoder
const decoderConfig = await videoTrack.getDecoderConfig();
// This is what you'd supply to the `VideoDecoder` to start decoding
```


**Encoding**

Here you do have a choice of what codec to use. Here's the TLDR version:

* If you're generating user-facing videos, espcially if you want to output .mp4 files, use h264
* If it's for internal use and/or you want to use .webm files, use VP9 (open source, better compression)
* If you have strong opinions or object to the above, this section isn't for you

##### Compatability

Don't forget that not all containers work with all codecs. Here's the simplified version of which codecs are supported by which containers.

|Codec| **MP4** | **WebM** |
|---|---|---|
| **H.264** | ✅  | ❌  |
| **H.265** | ✅  | ❌  |
| **VP8** | ❌ | ✅ |
| **VP9** | 🟡  | ✅  |
| **AV1** | 🟡   | ✅ |



### Codec strings

Unhelpfully, WebCodecs doesn't work with simple codec choices like `VP9`

```typescript
const codec = VideoEncoder({
    codec: 'vp9', //This won't work!
    //...
})
```

Instead, you need a fully qualified *codec string* such as: `vp09.00.10.08` which includes additional settings such as *levels* and *profiles*, which are high-level settings/configs you can choose, which affect low-level encoding choices such as macro-block size and chrome-sub-sampling used by the encoder.


Even more unhelpfully, W3C doesn't keep a list of valid codec strings[[1](https://www.w3.org/TR/webcodecs-codec-registry/#video-codec-registry)].


If you just want to encode a video and get on with your life, here's a quick & easy list of codec strings to maximize compatability.

##### h264
*  'avc1.42001f' - base profile, most comptable, supports up to 720p
*  'avc1.42003e' - base profile, level 6.2 (supports up to 8k)
*  'avc1.4d0034' - main profile, level 5.2 (supports up to 4K)   
*  'avc1.64003e' - high profile - level 6.2 (supports up to 8k)



##### vp9
* 'vp9.00.10.08.00' - basic, most compatible, level 1
* 'vp9.00.61.08.00' - level 6 
* 'vp9.00.50.08.00' - level 5  
* 'vp9.00.40.08.00' - level 4  



###  How to choose a codec string


#### MediaBunny

The easiest way is to use [MediaBunny](https://mediabunny.dev), where you don't have to choose a codec string. MediaBunny handles this for you internally.


```javascript

import { Output, Mp4OutputFormat,
BufferTarget, VideoSampleSource, VideoSample} from 'mediabunny';

const output = new Output({
    format: new Mp4OutputFormat(),
    target: new BufferTarget(),
});

const videoSource = new VideoSampleSource({   
    codec: 'avc', // You just specify avc/h264, MediaBunny handles codec string
    bitrate: QUALITY_HIGH,
});

output.addVideoTrack(videoSource, { frameRate: 30 });

for (const frame of frames){
    videoSource.add(new VideoSample(frame))
}

```


#### Good enough option

If you don't want to ue MediaBunny, and just want some code that works and mimimizes the chance of issues,  you can also just specify a bunch of options (best quality /least supported to worst quality/best supported), and pick the first one that is supported.

##### H264

```javascript

let codec_string;

const codecs =['avc1.64003e', 'avc1.4d0034',  'avc1.42003e', 'avc1.42001f'];

for(const test_codec of codecs){

    const videoEncoderConfig = {
        codec: test_codec,
        width,
        height,
        bitrate,
        framerate
    };

    const isSupported = await VideoEncoder.isConfigSupported(videoEncoderConfig);

    if(isSupported.supported){
        codec_string = test_codec;
        break;
    }
}


```

##### VP9


```javascript

let codec_string;

const codecs =['avc1.64003e', 'avc1.4d0034',  'avc1.42003e', 'avc1.42001f'];

for(const test_codec of codecs){

    const videoEncoderConfig = {
        codec: test_codec,
        width,
        height,
        bitrate,
        framerate
    };

    const isSupported = await VideoEncoder.isConfigSupported(videoEncoderConfig);

    if(isSupported.supported){
        codec_string = test_codec;
        break;
    }
}


```


####  Look up

If you want something more formal/precise, and don't want to use MediaBunny, you can use a lookup table (taken from [MediaBunny source](https://github.com/Vanilagy/mediabunny/blob/main/src/codec.ts))

<details>
<summary>Lookup table utility function</summary>

```javascript

function buildVideoCodecString (codec, width, height, bitrate)  {

        // https://en.wikipedia.org/wiki/Advanced_Video_Coding
    const AVC_LEVEL_TABLE = [
        { maxMacroblocks: 99, maxBitrate: 64000, level: 0x0A }, // Level 1
        { maxMacroblocks: 396, maxBitrate: 192000, level: 0x0B }, // Level 1.1
        { maxMacroblocks: 396, maxBitrate: 384000, level: 0x0C }, // Level 1.2
        { maxMacroblocks: 396, maxBitrate: 768000, level: 0x0D }, // Level 1.3
        { maxMacroblocks: 396, maxBitrate: 2000000, level: 0x14 }, // Level 2
        { maxMacroblocks: 792, maxBitrate: 4000000, level: 0x15 }, // Level 2.1
        { maxMacroblocks: 1620, maxBitrate: 4000000, level: 0x16 }, // Level 2.2
        { maxMacroblocks: 1620, maxBitrate: 10000000, level: 0x1E }, // Level 3
        { maxMacroblocks: 3600, maxBitrate: 14000000, level: 0x1F }, // Level 3.1
        { maxMacroblocks: 5120, maxBitrate: 20000000, level: 0x20 }, // Level 3.2
        { maxMacroblocks: 8192, maxBitrate: 20000000, level: 0x28 }, // Level 4
        { maxMacroblocks: 8192, maxBitrate: 50000000, level: 0x29 }, // Level 4.1
        { maxMacroblocks: 8704, maxBitrate: 50000000, level: 0x2A }, // Level 4.2
        { maxMacroblocks: 22080, maxBitrate: 135000000, level: 0x32 }, // Level 5
        { maxMacroblocks: 36864, maxBitrate: 240000000, level: 0x33 }, // Level 5.1
        { maxMacroblocks: 36864, maxBitrate: 240000000, level: 0x34 }, // Level 5.2
        { maxMacroblocks: 139264, maxBitrate: 240000000, level: 0x3C }, // Level 6
        { maxMacroblocks: 139264, maxBitrate: 480000000, level: 0x3D }, // Level 6.1
        { maxMacroblocks: 139264, maxBitrate: 800000000, level: 0x3E }, // Level 6.2
    ];

    // https://en.wikipedia.org/wiki/High_Efficiency_Video_Coding
    const HEVC_LEVEL_TABLE = [
        { maxPictureSize: 36864, maxBitrate: 128000, tier: 'L', level: 30 }, // Level 1 (Low Tier)
        { maxPictureSize: 122880, maxBitrate: 1500000, tier: 'L', level: 60 }, // Level 2 (Low Tier)
        { maxPictureSize: 245760, maxBitrate: 3000000, tier: 'L', level: 63 }, // Level 2.1 (Low Tier)
        { maxPictureSize: 552960, maxBitrate: 6000000, tier: 'L', level: 90 }, // Level 3 (Low Tier)
        { maxPictureSize: 983040, maxBitrate: 10000000, tier: 'L', level: 93 }, // Level 3.1 (Low Tier)
        { maxPictureSize: 2228224, maxBitrate: 12000000, tier: 'L', level: 120 }, // Level 4 (Low Tier)
        { maxPictureSize: 2228224, maxBitrate: 30000000, tier: 'H', level: 120 }, // Level 4 (High Tier)
        { maxPictureSize: 2228224, maxBitrate: 20000000, tier: 'L', level: 123 }, // Level 4.1 (Low Tier)
        { maxPictureSize: 2228224, maxBitrate: 50000000, tier: 'H', level: 123 }, // Level 4.1 (High Tier)
        { maxPictureSize: 8912896, maxBitrate: 25000000, tier: 'L', level: 150 }, // Level 5 (Low Tier)
        { maxPictureSize: 8912896, maxBitrate: 100000000, tier: 'H', level: 150 }, // Level 5 (High Tier)
        { maxPictureSize: 8912896, maxBitrate: 40000000, tier: 'L', level: 153 }, // Level 5.1 (Low Tier)
        { maxPictureSize: 8912896, maxBitrate: 160000000, tier: 'H', level: 153 }, // Level 5.1 (High Tier)
        { maxPictureSize: 8912896, maxBitrate: 60000000, tier: 'L', level: 156 }, // Level 5.2 (Low Tier)
        { maxPictureSize: 8912896, maxBitrate: 240000000, tier: 'H', level: 156 }, // Level 5.2 (High Tier)
        { maxPictureSize: 35651584, maxBitrate: 60000000, tier: 'L', level: 180 }, // Level 6 (Low Tier)
        { maxPictureSize: 35651584, maxBitrate: 240000000, tier: 'H', level: 180 }, // Level 6 (High Tier)
        { maxPictureSize: 35651584, maxBitrate: 120000000, tier: 'L', level: 183 }, // Level 6.1 (Low Tier)
        { maxPictureSize: 35651584, maxBitrate: 480000000, tier: 'H', level: 183 }, // Level 6.1 (High Tier)
        { maxPictureSize: 35651584, maxBitrate: 240000000, tier: 'L', level: 186 }, // Level 6.2 (Low Tier)
        { maxPictureSize: 35651584, maxBitrate: 800000000, tier: 'H', level: 186 }, // Level 6.2 (High Tier)
    ];

    // https://en.wikipedia.org/wiki/VP9
    const VP9_LEVEL_TABLE = [
        { maxPictureSize: 36864, maxBitrate: 200000, level: 10 }, // Level 1
        { maxPictureSize: 73728, maxBitrate: 800000, level: 11 }, // Level 1.1
        { maxPictureSize: 122880, maxBitrate: 1800000, level: 20 }, // Level 2
        { maxPictureSize: 245760, maxBitrate: 3600000, level: 21 }, // Level 2.1
        { maxPictureSize: 552960, maxBitrate: 7200000, level: 30 }, // Level 3
        { maxPictureSize: 983040, maxBitrate: 12000000, level: 31 }, // Level 3.1
        { maxPictureSize: 2228224, maxBitrate: 18000000, level: 40 }, // Level 4
        { maxPictureSize: 2228224, maxBitrate: 30000000, level: 41 }, // Level 4.1
        { maxPictureSize: 8912896, maxBitrate: 60000000, level: 50 }, // Level 5
        { maxPictureSize: 8912896, maxBitrate: 120000000, level: 51 }, // Level 5.1
        { maxPictureSize: 8912896, maxBitrate: 180000000, level: 52 }, // Level 5.2
        { maxPictureSize: 35651584, maxBitrate: 180000000, level: 60 }, // Level 6
        { maxPictureSize: 35651584, maxBitrate: 240000000, level: 61 }, // Level 6.1
        { maxPictureSize: 35651584, maxBitrate: 480000000, level: 62 }, // Level 6.2
    ];

    // https://en.wikipedia.org/wiki/AV1
    const AV1_LEVEL_TABLE = [
        { maxPictureSize: 147456, maxBitrate: 1500000, tier: 'M', level: 0 }, // Level 2.0 (Main Tier)
        { maxPictureSize: 278784, maxBitrate: 3000000, tier: 'M', level: 1 }, // Level 2.1 (Main Tier)
        { maxPictureSize: 665856, maxBitrate: 6000000, tier: 'M', level: 4 }, // Level 3.0 (Main Tier)
        { maxPictureSize: 1065024, maxBitrate: 10000000, tier: 'M', level: 5 }, // Level 3.1 (Main Tier)
        { maxPictureSize: 2359296, maxBitrate: 12000000, tier: 'M', level: 8 }, // Level 4.0 (Main Tier)
        { maxPictureSize: 2359296, maxBitrate: 30000000, tier: 'H', level: 8 }, // Level 4.0 (High Tier)
        { maxPictureSize: 2359296, maxBitrate: 20000000, tier: 'M', level: 9 }, // Level 4.1 (Main Tier)
        { maxPictureSize: 2359296, maxBitrate: 50000000, tier: 'H', level: 9 }, // Level 4.1 (High Tier)
        { maxPictureSize: 8912896, maxBitrate: 30000000, tier: 'M', level: 12 }, // Level 5.0 (Main Tier)
        { maxPictureSize: 8912896, maxBitrate: 100000000, tier: 'H', level: 12 }, // Level 5.0 (High Tier)
        { maxPictureSize: 8912896, maxBitrate: 40000000, tier: 'M', level: 13 }, // Level 5.1 (Main Tier)
        { maxPictureSize: 8912896, maxBitrate: 160000000, tier: 'H', level: 13 }, // Level 5.1 (High Tier)
        { maxPictureSize: 8912896, maxBitrate: 60000000, tier: 'M', level: 14 }, // Level 5.2 (Main Tier)
        { maxPictureSize: 8912896, maxBitrate: 240000000, tier: 'H', level: 14 }, // Level 5.2 (High Tier)
        { maxPictureSize: 35651584, maxBitrate: 60000000, tier: 'M', level: 15 }, // Level 5.3 (Main Tier)
        { maxPictureSize: 35651584, maxBitrate: 240000000, tier: 'H', level: 15 }, // Level 5.3 (High Tier)
        { maxPictureSize: 35651584, maxBitrate: 60000000, tier: 'M', level: 16 }, // Level 6.0 (Main Tier)
        { maxPictureSize: 35651584, maxBitrate: 240000000, tier: 'H', level: 16 }, // Level 6.0 (High Tier)
        { maxPictureSize: 35651584, maxBitrate: 100000000, tier: 'M', level: 17 }, // Level 6.1 (Main Tier)
        { maxPictureSize: 35651584, maxBitrate: 480000000, tier: 'H', level: 17 }, // Level 6.1 (High Tier)
        { maxPictureSize: 35651584, maxBitrate: 160000000, tier: 'M', level: 18 }, // Level 6.2 (Main Tier)
        { maxPictureSize: 35651584, maxBitrate: 800000000, tier: 'H', level: 18 }, // Level 6.2 (High Tier)
        { maxPictureSize: 35651584, maxBitrate: 160000000, tier: 'M', level: 19 }, // Level 6.3 (Main Tier)
        { maxPictureSize: 35651584, maxBitrate: 800000000, tier: 'H', level: 19 }, // Level 6.3 (High Tier)
    ];

    //helper function
    function last(arr){
	    return arr && arr[arr.length - 1];
    };

	if (codec === 'avc') {
		const profileIndication = 0x64; // High Profile
		const totalMacroblocks = Math.ceil(width / 16) * Math.ceil(height / 16);

		// Determine the level based on the table
		const levelInfo = AVC_LEVEL_TABLE.find(
			level => totalMacroblocks <= level.maxMacroblocks && bitrate <= level.maxBitrate,
		) ?? last(AVC_LEVEL_TABLE);
		const levelIndication = levelInfo ? levelInfo.level : 0;

		const hexProfileIndication = profileIndication.toString(16).padStart(2, '0');
		const hexProfileCompatibility = '00';
		const hexLevelIndication = levelIndication.toString(16).padStart(2, '0');

		return `avc1.${hexProfileIndication}${hexProfileCompatibility}${hexLevelIndication}`;
	} else if (codec === 'hevc') {
		const profilePrefix = ''; // Profile space 0
		const profileIdc = 1; // Main Profile

		const compatibilityFlags = '6'; // Taken from the example in ISO 14496-15

		const pictureSize = width * height;
		const levelInfo = HEVC_LEVEL_TABLE.find(
			level => pictureSize <= level.maxPictureSize && bitrate <= level.maxBitrate,
		) ?? last(HEVC_LEVEL_TABLE);

		const constraintFlags = 'B0'; // Progressive source flag

		return 'hev1.'
			+ `${profilePrefix}${profileIdc}.`
			+ `${compatibilityFlags}.`
			+ `${levelInfo.tier}${levelInfo.level}.`
			+ `${constraintFlags}`;
	} else if (codec === 'vp8') {
		return 'vp8'; // Easy, this one
	} else if (codec === 'vp9') {
		const profile = '00'; // Profile 0

		const pictureSize = width * height;
		const levelInfo = VP9_LEVEL_TABLE.find(
			level => pictureSize <= level.maxPictureSize && bitrate <= level.maxBitrate,
		) ?? last(VP9_LEVEL_TABLE);

		const bitDepth = '08'; // 8-bit

		return `vp09.${profile}.${levelInfo.level.toString().padStart(2, '0')}.${bitDepth}`;
	} else if (codec === 'av1') {
		const profile = 0; // Main Profile, single digit

		const pictureSize = width * height;
		const levelInfo = AV1_LEVEL_TABLE.find(
			level => pictureSize <= level.maxPictureSize && bitrate <= level.maxBitrate,
		) ?? last(AV1_LEVEL_TABLE);
		const level = levelInfo.level.toString().padStart(2, '0');

		const bitDepth = '08'; // 8-bit

		return `av01.${profile}.${level}${levelInfo.tier}.${bitDepth}`;
	}

	// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
	throw new TypeError(`Unhandled codec '${codec}'.`);
};


```

</details>

### Comprehensive list of codec strings

See [here](./tbd)

### Device support

<build data set>
