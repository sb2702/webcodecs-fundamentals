import { BlobSource, BufferTarget, Input, MP4, Mp4OutputFormat, Output, QUALITY_HIGH, VideoSampleSink, VideoSampleSource } from 'mediabunny';

async function transcodeFile(file: File): Promise<Blob> {

      const input = new Input({
        formats: [MP4],
        source: new BlobSource(file),
      });

      const output = new Output({
        format: new Mp4OutputFormat(),
        target: new BufferTarget(),
      });

      const videoSource = new VideoSampleSource({
        codec: 'avc',
        bitrate: QUALITY_HIGH,
        sizeChangeBehavior: 'passThrough'
      });

      output.addVideoTrack(videoSource, { frameRate: 30 });
      await output.start();

      const videoTrack = await input.getPrimaryVideoTrack();
      const sink = new VideoSampleSink(videoTrack);
      
      for await (const sample of sink.samples()) {
        videoSource.add(sample);
      }

      await output.finalize();

      const buffer = (output.target as BufferTarget).buffer;

      return new Blob([buffer], { type: 'video/mp4' });

}