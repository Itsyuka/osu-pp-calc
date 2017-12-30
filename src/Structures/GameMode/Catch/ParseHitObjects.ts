import {Beatmap} from "../../Beatmap";
import {Vector2} from "../../../Utils/Vector2";
import {HitType} from "../../../Enums/HitType";
import {BaseHitObject} from "../../BaseHitObject";
import {PlayMode} from "../../../Enums/PlayMode";
import {Fruit} from "./HitObjects/Fruit";
import {Slider} from "./HitObjects/Slider";
import {Banana} from "./HitObjects/Banana";

// TODO: Work on conversion function, better than trying to natively parse different game modes
/**
 * Parses lines from the HitObject Section to usable hit objects for the Osu!Catch mode
 * @param {string[]} lines
 * @param {Beatmap} beatmap
 * @returns {Promise<BaseHitObject[]>}
 */
export async function ParseHitObjects(lines: string[], beatmap: Beatmap): Promise<(any)[]> {
    let hitObjects: (any)[] = [];
    for(const line of lines) {
        let [x, y, time, type, ...additional] = line.split(',');
        let hitType = parseInt(type, 10) & ~HitType.ColourHax;
        let newCombo = (hitType & HitType.NewCombo) > 0;
        hitType = hitType & ~HitType.NewCombo;
        let timeStart = parseInt(time, 10);
        const pos = new Vector2(parseInt(x, 10), parseInt(y, 10));
        if((hitType & HitType.Normal) > 0) {
            hitObjects.push(new Fruit(
                pos,
                timeStart,
                hitType,
                newCombo
            ));
        } else if((hitType & HitType.Slider) > 0) {
            let [curveType, ...sliderPointsRaw] = additional[1].split('|');
            let sliderPoints = sliderPointsRaw.map((point: string) => {
                let [x, y] = point.trim().split(':').map(point => parseInt(point, 10));
                return new Vector2(x, y);
            });
            let repetitions = parseInt(additional[2], 10);
            let sliderLength = parseFloat(additional[3]);
            hitObjects.push(new Slider(
                pos,
                timeStart,
                hitType,
                newCombo,
                sliderPoints,
                repetitions,
                sliderLength
            ));
        } else {
            let timeEnd = parseInt(additional[1], 10);
            hitObjects.push(new Banana(
                pos,
                timeStart,
                timeEnd,
                hitType,
                newCombo
            ));
        }
    }
    return hitObjects.sort((a,b) => a.startTime - b.endTime);
}