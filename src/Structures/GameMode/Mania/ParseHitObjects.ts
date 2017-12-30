import {Beatmap} from "../../Beatmap";
import {Vector2} from "../../../Utils/Vector2";
import {HitType} from "../../../Enums/HitType";
import {Hold} from "./HitObjects/Hold";
import {Single} from "./HitObjects/Single";
import {BaseHitObject} from "../../BaseHitObject";
import {PlayMode} from "../../../Enums/PlayMode";

// TODO: Work on conversion function, better than trying to natively parse different game modes
/**
 * Parses lines from the HitObject Section to usable hit objects for the Osu!Mania mode
 * @param {string[]} lines
 * @param {Beatmap} beatmap
 * @returns {Promise<BaseHitObject[]>}
 */
export async function ParseHitObjects(lines: string[], beatmap: Beatmap): Promise<(Hold|Single)[]> {
    let hitObjects: (Hold|Single)[] = [];
    for(const line of lines) {
        let [x, y, time, type, ...additional] = line.split(',');
        let hitType = parseInt(type, 10) & ~HitType.ColourHax;
        hitType = hitType & ~HitType.NewCombo;
        let timeStart = parseInt(time, 10);
        const pos = new Vector2(parseInt(x, 10), parseInt(y, 10));
        if((hitType & HitType.Normal) > 0) {
            hitObjects.push(new Single(
                pos,
                timeStart,
                hitType
            ));
        } else {
            if(beatmap.General.Mode === PlayMode.mania) {
                let [end] = additional[1].split(':');
                let timeEnd = parseInt(end, 10);
                hitObjects.push(new Hold(
                    pos,
                    timeStart,
                    timeEnd,
                    hitType
                ));
            }
        }
    }
    return hitObjects.sort((a,b) => a.startTime - b.endTime);
}