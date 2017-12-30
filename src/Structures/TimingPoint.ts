export class TimingPoint {
    time: number;
    beatLength: number;
    meter: number;
    sampleType: number;
    sampleSet: number;
    volume: number;
    isInherited: boolean;
    isKiai: boolean;

    constructor(time: number, beatLength: number, meter: number, sampleType: number, sampleSet: number, volume: number, isInherited: boolean = false, isKiai: boolean = false) {
        this.time = time;
        this.beatLength = beatLength;
        this.meter = meter;
        this.sampleType = sampleType;
        this.sampleSet = sampleSet;
        this.volume = volume;
        this.isInherited = isInherited;
        this.isKiai = isKiai;
    }
}