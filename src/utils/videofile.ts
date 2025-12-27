import MP4Box, {
    MP4File,
    MP4Info,
    MP4MediaTrack,
    MP4ArrayBuffer,
    MP4Sample,
    MP4Track,
    DataStream,
  } from "mp4box";
  
  // Types
  export interface TrackData {
    duration: number;
    audio?: AudioTrackData;
    video?: VideoTrackData;
  }
  
  export interface AudioTrackData {
    codec: string;
    sampleRate: number;
    numberOfChannels: number;
  }
  
  export interface VideoTrackData {
    codec: string;
    codedHeight: number;
    codedWidth: number;
    description: Uint8Array;
    frameRate: number;
  }
  
  export interface MP4Data {
    mp4: MP4File;
    trackData: TrackData;
    info: MP4Info;
  }
  
  // Constants
  const CHUNK_SIZE = 100; // Samples per extraction batch
  const FRAME_RATE_THRESHOLD = 0.5; // Seconds tolerance for frame rate calculation
  const DURATION_BUFFER = 0.1; // Prevent reading beyond actual duration
  
  /**
   * Extract codec description box from MP4 track.
   * Handles avcC (H.264), hvcC (HEVC), vpcC (VP8/VP9), and av1C (AV1).
   */
  function extractCodecDescription(
    mp4: MP4File,
    track: MP4MediaTrack
  ): Uint8Array {
    const trak = mp4.getTrackById(track.id);
  
    for (const entry of trak.mdia.minf.stbl.stsd.entries) {
      const box = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C;
      if (box) {
        const stream = new DataStream(
          undefined,
          0,
          DataStream.BIG_ENDIAN
        );
        box.write(stream);
        // Skip 8-byte box header (4 bytes size + 4 bytes type)
        return new Uint8Array(stream.buffer, 8);
      }
    }
  
    throw new Error(
      "Codec description box (avcC, hvcC, vpcC, or av1C) not found"
    );
  }
  
  /**
   * Extract track metadata from MP4 file.
   * Returns duration, codec, dimensions, and frame rate for both audio and video.
   */
  function extractTrackData(mp4: MP4File, info: MP4Info): TrackData {
    const trackData: TrackData = {
      duration: info.duration / info.timescale,
    };
  
    // Video track
    if (info.videoTracks.length > 0) {
      const videoTrack = info.videoTracks[0];
      const sampleDurationInSeconds =
        videoTrack.samples_duration / videoTrack.timescale;
  
      trackData.video = {
        codec: videoTrack.codec,
        codedHeight: videoTrack.video.height,
        codedWidth: videoTrack.video.width,
        description: extractCodecDescription(mp4, videoTrack),
        frameRate: videoTrack.nb_samples / sampleDurationInSeconds,
      };
    }
  
    // Audio track
    if (info.audioTracks.length > 0) {
      const audioTrack = info.audioTracks[0];
      const sampleRate =
        audioTrack.audio?.sample_rate ?? audioTrack.timescale;
      const channelCount = audioTrack.audio?.channel_count ?? 2;
  
      trackData.audio = {
        codec: audioTrack.codec,
        sampleRate,
        numberOfChannels: channelCount,
      };
    }
  
    return trackData;
  }
  
  /**
   * Stream an MP4 file and extract metadata.
   * Reads file in chunks and reports progress via postMessage.
   * Resolves when MP4Box signals readiness.
   */
  async function parseMP4Metadata(file: File): Promise<MP4Data> {
    return new Promise((resolve, reject) => {
      const reader = file.stream().getReader();
      let offset = 0;
      const mp4 = MP4Box.createFile(false);
      let metadataReady = false;
  
      mp4.onReady = (info: MP4Info) => {
        metadataReady = true;
        const trackData = extractTrackData(mp4, info);
        resolve({ info, trackData, mp4 });
      };
  
      mp4.onError = (err: unknown) => {
        reject(
          new Error(
            `MP4Box parsing error: ${err instanceof Error ? err.message : String(err)}`
          )
        );
      };
  
      const readNextChunk = async (): Promise<void> => {
        try {
          const { done, value } = await reader.read();
  
          if (done) {
            if (!metadataReady) {
              throw new Error("Invalid MP4 file: metadata not available");
            }
            mp4.flush();
            return;
          }
  
          if (metadataReady) {
            // Once metadata is ready, stop reading more chunks
            reader.releaseLock();
            mp4.flush();
            return;
          }
  
          const buffer = value.buffer as MP4ArrayBuffer;
          buffer.fileStart = offset;
          offset += value.length;
  
          // Report progress
          postMessage({
            request_id: "load_progress",
            res: offset / file.size,
          });
  
          mp4.appendBuffer(buffer);
  
          // Continue reading
          if (offset < file.size) {
            return readNextChunk();
          } else {
            mp4.flush();
            if (!metadataReady) {
              throw new Error("Invalid MP4 file: metadata not available");
            }
          }
        } catch (error) {
          reject(error);
        }
      };
  
      readNextChunk().catch(reject);
    });
  }
  
  /**
   * Extract encoded samples (audio or video) from a time range.
   * Uses MP4Box's extraction API to get chunks efficiently.
   * Handles message passing for progress reporting.
   */
  async function extractEncodedSegment(
    file: File,
    mp4Data: MP4Data,
    trackType: "audio" | "video",
    startTime: number,
    endTime: number
  ): Promise<EncodedVideoChunk[] | EncodedAudioChunk[]> {
    const { mp4, info } = mp4Data;
  
    return new Promise((resolve, reject) => {
      let fileOffset = 0;
      let extractionFinished = false;
      let trackId = 0;
  
      const EncodedChunk =
        trackType === "audio" ? EncodedAudioChunk : EncodedVideoChunk;
      const chunks: (EncodedVideoChunk | EncodedAudioChunk)[] = [];
  
      // Find the appropriate track
      const selectedTrack =
        trackType === "audio"
          ? info.audioTracks[0] ?? null
          : info.videoTracks[0] ?? null;
  
      if (!selectedTrack) {
        resolve([]);
        return;
      }
  
      trackId = selectedTrack.id;
  
      // Normalize time bounds
      const maxDuration = info.duration / info.timescale - DURATION_BUFFER;
      const normalizedEnd = Math.min(endTime || maxDuration, maxDuration);
  
      // Clear previous extraction options for all tracks
      for (const trackIdStr in info.tracks) {
        const track = info.tracks[trackIdStr];
        mp4.unsetExtractionOptions(track.id);
      }
  
      // Set up sample extraction callback
      mp4.onSamples = (id: number, _user: unknown, samples: MP4Sample[]) => {
        for (const sample of samples) {
          const sampleTime = sample.cts / sample.timescale;
  
          // Only include samples within the requested time range
          if (sampleTime < normalizedEnd) {
            chunks.push(
              new EncodedChunk({
                type: sample.is_sync ? "key" : "delta",
                timestamp: Math.round(1e6 * sampleTime),
                duration: Math.round(
                  1e6 * (sample.duration / sample.timescale)
                ),
                data: sample.data,
              })
            );
          }
        }
  
        // Release processed samples to free memory
        if (samples.length > 0) {
          mp4.releaseUsedSamples(trackId, samples[samples.length - 1].number);
        }
  
        // Check if we've reached the end
        if (chunks.length > 0) {
          const lastChunk = chunks[chunks.length - 1];
          const lastChunkTime = lastChunk.timestamp / 1e6;
  
          if (
            Math.abs(lastChunkTime - normalizedEnd) < FRAME_RATE_THRESHOLD ||
            lastChunkTime > normalizedEnd
          ) {
            extractionFinished = true;
            mp4.stop();
            mp4.flush();
            resolve(chunks);
          }
        }
      };
  
      mp4.onError = (err: unknown) => {
        reject(
          new Error(
            `Extraction error: ${err instanceof Error ? err.message : String(err)}`
          )
        );
      };
  
      // Configure extraction: request 100 samples at a time
      mp4.setExtractionOptions(trackId, null, { nbSamples: CHUNK_SIZE });
  
      // Seek to start position
      const seekResult = mp4.seek(startTime, true);
  
      // Stream the file starting from seek position
      const contentReader = file
        .slice(seekResult.offset)
        .stream()
        .getReader();
      fileOffset = seekResult.offset;
  
      const readNextSegment = async (): Promise<void> => {
        try {
          const { done, value } = await contentReader.read();
  
          if (done || extractionFinished) {
            contentReader.releaseLock();
            mp4.flush();
            return;
          }
  
          const buffer = value.buffer as MP4ArrayBuffer;
          buffer.fileStart = fileOffset;
          fileOffset += value.length;
  
          mp4.appendBuffer(buffer);
          return readNextSegment();
        } catch (error) {
          reject(error);
        }
      };
  
      mp4.start();
      readNextSegment().catch(reject);
    });
  }
  
  // Cache for parsed MP4 data to avoid re-parsing the same file
  let cachedMP4Data: MP4Data | null = null;
 
  /**
   * Extract encoded samples from an MP4 file.
   * Caches parsed metadata to avoid re-parsing on multiple extractions.
   * @param file - The MP4 file to extract from
   * @param trackType - "audio" or "video"
   * @param startTime - Start time in seconds
   * @param endTime - End time in seconds (0 or undefined = entire track)
   */
  export async function extractMP4Segment(
    file: File,
    trackType: "audio" | "video",
    startTime: number,
    endTime: number
  ): Promise<EncodedVideoChunk[] | EncodedAudioChunk[]> {
    // Parse metadata if not cached or file changed
    if (!cachedMP4Data) {
      cachedMP4Data = await parseMP4Metadata(file);
    }
  
    return extractEncodedSegment(file, cachedMP4Data, trackType, startTime, endTime);
  }