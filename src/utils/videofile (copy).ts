import MP4Box, {MP4File, MP4Info, MP4MediaTrack, MP4ArrayBuffer, MP4Sample, MP4Track, DataStream} from 'mp4box'


export interface TrackData {
    duration: number,
    audio?: AudioTrackData
    video?: VideoTrackData
}

export interface AudioTrackData {
    codec: string,
    sampleRate: number ,
    numberOfChannels: number
}

export interface VideoTrackData {
    codec: string,
    codedHeight: number,
    codedWidth: number,
    description: Uint8Array,
    frameRate: number
}


export interface MP4Data {
    mp4: MP4File,
    trackData: TrackData,
    info: MP4Info
}



function description(mp4:MP4File,  track: MP4MediaTrack): Uint8Array {

    const trak = mp4.getTrackById(track.id);

    for (const entry of trak.mdia.minf.stbl.stsd.entries) {
        const box = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C;
        if (box) {
            const stream = new DataStream(undefined, 0, DataStream.BIG_ENDIAN);
            box.write(stream);
            return new Uint8Array(stream.buffer, 8);  // Remove the box header.
        }
    }
    throw new Error("avcC, hvcC, vpcC, or av1C box not found");
}



function getAudioTrack(mp4: MP4File,  info: MP4Info): MP4Track | null{
    if(info.audioTracks.length > 0){
        return info.audioTracks[0];
    }
    return  null;
}

function getVideoTrack(mp4: MP4File,  info: MP4Info): MP4Track | null{
    if(info.videoTracks.length > 0){
        return info.videoTracks[0];
    }
    return  null;
}


function getTrackData(mp4: MP4File, info: MP4Info): TrackData {

    const trackData: TrackData = {
        duration: info.duration/info.timescale,
    };

    if(info.videoTracks.length > 0){

        const  videoTrack = info.videoTracks[0];

        trackData.video = {
            codec: videoTrack.codec,
            codedHeight: videoTrack.video.height,
            codedWidth: videoTrack.video.width,
            description: description(mp4, videoTrack),
            frameRate: videoTrack.nb_samples/(videoTrack.samples_duration/videoTrack.timescale)
        }

    }

    const audioTrack = getAudioTrack(mp4, info);

    if(audioTrack){

        let sample_rate;
        let channel_count;

        if(audioTrack.audio){
            const audio = audioTrack.audio;
            if(audio.sample_rate)  sample_rate = audio.sample_rate;
            if(audio.channel_count)  channel_count = audio.channel_count;
        }


        if(!sample_rate) sample_rate = audioTrack.timescale;
        if(!channel_count) channel_count = 2;

        trackData.audio = {
            codec: audioTrack.codec,
            sampleRate: sample_rate,
            numberOfChannels: channel_count
        }

    }

    return trackData;

}




function getMeta(file: File): Promise <MP4Data> {

    return new Promise(function (resolve, reject){
    
        const reader =  file.stream().getReader();

        let offset = 0;

        const mp4 = MP4Box.createFile(false);

        let ready = false;


        mp4.onReady = async function (info: MP4Info){

            ready = true;
            const trackData = getTrackData(mp4, info);

            resolve({
                info,
                trackData,
                mp4
            });
        }

        mp4.onError = function (err: any){
            reject(err);
        }

        reader.read().then(async function getNextChunk({done, value}): Promise<any> {
            if (done) {

                if(!ready){
                    return reject(new Error("Not a valid mp4 file"));
                }
                return  mp4.flush();
            }

            if(ready){
                reader.releaseLock();
                return mp4.flush();
            }



            const copy = <MP4ArrayBuffer> value.buffer;
            copy.fileStart = offset;
            offset += value.length;

            postMessage({ request_id: 'load_progress',  res: offset/file.size});

            mp4.appendBuffer(copy);

            if(offset < file.size){
                return  reader.read().then(getNextChunk).catch(function (){
                    console.warn("Err")
                });
            } else {
                mp4.flush();

                if(!ready){
                    return reject(new Error("Not a valid mp4 file"));
                }
            }


      
        })

    });


}


function extractSegment(file: File, mp4Data: MP4Data, track: string, start: number, end: number): Promise <EncodedVideoChunk[] | EncodedAudioChunk[]> {


    const {mp4, info, trackData} = mp4Data;

    return new Promise(function (resolve, reject) {


        let offset = 0;
        let finished = false;

        let track_id = 0;

        const EncodedChunk = track === 'audio' ? EncodedAudioChunk : EncodedVideoChunk;

        const chunks: EncodedVideoChunk[] | EncodedAudioChunk[]  = [];

        mp4.onSamples = function (id:number, user: any, samples: MP4Sample[]) {

            for (const sample of samples) {

                if (sample.cts / sample.timescale < end) {

                    chunks.push(new EncodedChunk({
                        type: sample.is_sync ? "key" : "delta",
                        timestamp: 1e6 * sample.cts / sample.timescale,
                        duration: 1e6 * sample.duration / sample.timescale,
                        data: sample.data
                    }));

                }
            }

            mp4.releaseUsedSamples(track_id, samples[samples.length-1].number);

            if(chunks.length > 1){

                const lastChunk = chunks[chunks.length - 1];
                if (Math.abs(lastChunk.timestamp / 1e6 - end) < .5  || lastChunk.timestamp / 1e6 > end) {


                    finished = true;
                    mp4.stop();
                    mp4.releaseUsedSamples(track_id, samples[samples.length-1].number);
                    mp4.flush();

                    resolve(chunks);

                }
            }



        }


        for (const trackId in info.tracks){

            const track = info.tracks[trackId];
            mp4.unsetExtractionOptions(track.id);
            mp4.unsetExtractionOptions(track.id);

        }





        const trackToUse = track === 'audio'? getAudioTrack(mp4, info): getVideoTrack(mp4, info);

        if(!trackToUse){
            return resolve([]);
        }

        track_id = trackToUse.id;


        if (!end) end = info.duration / info.timescale - .1; // If you want the whole track, specify start 0, end 0, and then we use the last sample as duration - 0.1 seconds

        end = Math.min(end, info.duration / info.timescale -0.1) // Make sure don't overshoot the video, to prevent forever waiting for new samples that don't exist

        mp4.setExtractionOptions(track_id, null, {nbSamples: 100});

        const seek = mp4.seek(start, true);

        offset = seek.offset;

        const contentReader = file.slice(seek.offset).stream().getReader();

        contentReader.read().then(async function getNextChunk({done, value}): Promise<any > {

            if (done) {
                return mp4.flush();
            }

            if(finished){
                contentReader.releaseLock();
                return mp4.flush()
            }

            const copy = <MP4ArrayBuffer> value.buffer;
            copy.fileStart = offset;
            offset += value.length;
            mp4.appendBuffer(copy);
            return contentReader.read().then(getNextChunk).catch(reject);
        })



        mp4.start();


        mp4.onError = function (err: any) {
            reject(err);
        }



    });

}



let cached: MP4Data | null = null;



async function extractSegmentFromFile(file: File, track: 'audio'|'video', start: number, end: number){
    if (!cached) cached = await getMeta(file);
    return await extractSegment(file, cached, track, start, end);
}