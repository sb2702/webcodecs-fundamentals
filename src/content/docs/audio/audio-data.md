---
title: AudioData
description: Why WebCodecs is harder than it looks
---

`AudioData` is the class used by WebCodecs to represent raw audio information. 

![](/src/assets/content/audio/audio-data/AudioData.png)

When decoding audio from an audio track in WebCodecs, the decoder will provide `AudioData` objects, with each `AudioData` object typically representing less than 0.5 seconds of audio.

Likewise, you'd need to feed raw audio in the form of `AudioData` to an `AudioEncoder` in order to encode audio to write into a destination video file or stream.

In this section we'll cover the basics of audio, and how to read and understand raw data from `AudioData` objects, how to manipulate raw audio samples and how to write them to `AudioData` objects.


## A quick review of audio


##### Sound

As you might be aware, sound is made of pressure waves in air, and when sound reaches a human ear or microphone, it vibrates a membrane back and forth. If you plotted this vibration over time, you'd get something that looks like this:

![](/src/assets/content/audio/audio-data/raw-audio.svg)

If you've heard of the term "sound wave" or "audio signal" or "audio waveform", that's what this is. The vibrating membrane in our ear is converted to an electrical signal which our brain interprets as music, or speech or dogs barking, or whatever the sounds is, which is how we "hear" things.

##### Digital Audio
When a microphone records sound, it measures this vibration ~ 44,000 times per second, producing a digital audio signal that looks like this:

![](/src/assets/content/audio/audio-data/waveform.png)

Where, for every second of audio, you have around ~44,000 `float32` numbers ranging from `-1.0000` to `1.0000`.

Each one of these `float32` numbers is called an *audio sample*, and the number of samples per second is called the *sample rate*. The most typical value for *sample rate* is 44,100, which was chosen from the limits of human hearing.

Speakers or headphones do the reverse, they move a membrane according to this digital audio signal, recreating pressure waves that our ears can listen to and interpret as the original sound.

##### Sterio vs mono


Humans typically have 2 ears [[citation needed](https://xkcd.com/285/)], and our brains can intepret slight differences in sound coming in each ear to "hear" where a sound is coming from. 


Most software and hardware that deal with digital audio are therefore built to support two audio signals, which we call "channels". 


Audio tracks with just one channel are called *mono*, and audio tracks with two channels are called *stereo*. In stereo audio, you might see the two channels referred to as *left*  and *right*  channels, and *stereo* audio is the default.


Digital music or movies will often have slightly different signals in each channel for an immersive effect. Here's an example from [Big Buck Buny](https://peach.blender.org/), where there's a sound effect created by two objects hitting a tree on the left side of the screen:

<video src="/src/assets/content/audio/audio-data/bbb-exerpt.mp4" controls> </video>

You can see this in the actual audio data, by noticing that the left channel has this sound effect and right channel doesn't.


| Left Channel | Right Channel |
|---|---|
| ![Left waveform](/src/assets/content/audio/audio-data/bbb-left.png) | ![Right waveform](/src/assets/content/audio/audio-data/bbb-right.png) |
| <audio controls><source src="/src/assets/content/audio/audio-data/bbb-left-2.mp3" type="audio/mpeg"></audio> | <audio controls><source src="/src/assets/content/audio/audio-data/bbb-right-2.mp3" type="audio/mpeg"></audio> |


Practically speaking, plan to work with two audio channels by default, though some audio files will only have one channel.


##### Audio Size


Raw audio is more compact than raw video, but it's styll pretty big. Per second of audio in a typical file, you'd have:

```
44,100 samples/sec × 2 channels × 4 bytes = 352,800 bytes = ~344 KB
```

This equates to ~1.27GB of memory for an hour of typical audio. Audio is entirely on the CPU, so there's no need to worry about video memory, but it's still a lot of memory for a single application.


At 128kbps (the most common bitrate for compressed audio), an hour of compressed audio would only take ~58MB.


Practically speaking, we still do need to manage memory, and decode audio in chunks, though audio is more lenient. Whereas just 10 seconds of raw video might be enough to crash your application, you could typically store 10 minutes of raw stereo audio in memory without worrying about crashes.





### Audio Data objects

** frames
** planes


### How to read audio data


### Manipulating audio data

##### Scaling audio


##### Mixing audio


### How to write audio data


