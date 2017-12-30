import {Beatmap} from "../../Beatmap";
import {Vector2} from "../../../Utils/Vector2";
import {HitType} from "../../../Enums/HitType";
import {Circle} from "./HitObjects/Circle";
import {Slider} from "./HitObjects/Slider";
import {Spinner} from "./HitObjects/Spinner";
import {BaseHitObject} from "../../BaseHitObject";

/**
 * Parses lines from the HitObject Section to usable hit objects for the Osu!Standard mode
 * @param {string[]} lines
 * @param {Beatmap} beatmap
 * @returns {Promise<BaseHitObject[]>}
 */
export async function ParseHitObjects(lines: string[], beatmap: Beatmap): Promise<(Circle|Spinner|Slider)[]> {
    let hitObjects: (Circle|Spinner|Slider)[] = [];
    for(const line of lines) {
        let [x, y, time, type, ...additional] = line.split(',');
        let hitType = parseInt(type, 10) & ~HitType.ColourHax;
        let newCombo = (hitType & HitType.NewCombo) > 0;
        hitType = hitType & ~HitType.NewCombo; // We already know we have a new combo or not
        let timeStart = parseInt(time, 10);
        const pos = new Vector2(parseInt(x, 10), parseInt(y, 10));
        if((hitType & HitType.Normal) > 0) {
            hitObjects.push(new Circle(
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
                curveType,
                sliderPoints,
                repetitions,
                sliderLength
            ));
        } else {
            let timeEnd = parseInt(additional[1], 10);
            hitObjects.push(new Spinner(
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