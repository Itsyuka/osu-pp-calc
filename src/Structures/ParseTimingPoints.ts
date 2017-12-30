import {TimingPoint} from "./TimingPoint";

export async function ParseTimingPoints(lines: string[]): Promise<TimingPoint[]> {
    let timingPoints: TimingPoint[] = [];
    for(const line of lines) {
        let args = line.split(',');
        let time = parseFloat(args[0]);
        let beatLength = parseFloat(args[1]);
        let meter = 4;
        let sampleType = 0;
        let sampleSet = 0;
        let volume = 100;
        let isInherited = false;
        let isKiai = false;

        if(args.length >= 2) {
            meter = parseInt(args[2].trim(), 10);
        }
        if(args.length >= 3) {
            sampleType = parseInt(args[3].trim(), 10);
        }
        if(args.length >= 4) {
            sampleSet = parseInt(args[4].trim(), 10);
        }
        if(args.length >= 5) {
            volume = parseInt(args[5].trim(), 10);
        }

        if(args.length >= 7) {
            isInherited = args[6].trim() === "0";
        }
        if(args.length >= 8) {
            isKiai = args[7].trim() === "0";
        }

        timingPoints.push(new TimingPoint(
            time,
            beatLength,
            meter,
            sampleType,
            sampleSet,
            volume,
            isInherited,
            isKiai
        ));
    }

    return timingPoints.sort((a,b) => a.time - b.time);
}