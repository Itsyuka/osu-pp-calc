import {Beatmap} from "../../Beatmap";
import {Vector2} from "../../../Utils/Vector2";
import {HitType} from "../../../Enums/HitType";
import {BaseHitObject} from "../../BaseHitObject";
import {Circle} from "./HitObjects/Circle";
import {Drumroll} from "./HitObjects/Drumroll";
import {Shaker} from "./HitObjects/Shaker";
import {hasType} from "../../../Utils/hasType";

// TODO: Work on conversion function, better than trying to natively parse different game modes
/**
 * Parses lines from the HitObject Section to usable hit objects for the Osu!Taiko mode
 * @param {string[]} lines
 * @param {Beatmap} beatmap
 * @returns {Promise<BaseHitObject[]>}
 */
export async function ParseHitObjects(lines: string[], beatmap: Beatmap): Promise<(any)[]> {
    let hitObjects: (any)[] = [];
    for(const line of lines) {
        let [x, y, time, type, sound, ...additional] = line.split(',');
        let hitType = parseInt(type, 10) & ~HitType.ColourHax;
        hitType = hitType & ~HitType.NewCombo;
        let hitSound = parseInt(sound, 10); // Only use this in taiko? GG peppy
        let timeStart = parseInt(time, 10);
        const pos = new Vector2(parseInt(x, 10), parseInt(y, 10));
        if(hasType(hitType, HitType.Normal)) {
            hitObjects.push(new Circle(
                pos,
                timeStart,
                hitType,
                hitSound
            ));
        } else if(hasType(hitType, HitType.Slider)) {
            let repetitions = parseInt(additional[1], 10);
            let pixelLength = parseFloat(additional[2]);
            hitObjects.push(new Drumroll(
                pos,
                timeStart,
                hitType,
                hitSound,
                repetitions*pixelLength
            ));
        } else if(hasType(hitType, HitType.Spinner)) {
            let endTime = parseInt(additional[0]);
            hitObjects.push(new Shaker(
                pos,
                timeStart,
                endTime,
                hitType,
                hitSound
            ));
        }
    }
    return hitObjects.sort((a,b) => a.startTime - b.endTime);
}