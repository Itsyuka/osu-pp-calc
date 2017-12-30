import {BaseHitObject} from "../../../BaseHitObject";
import {Vector2} from "../../../../Utils/Vector2";
import {HitType} from "../../../../Enums/HitType";
import {HitSoundType} from "../../../../Enums/HitSoundType";

export class HitObject extends BaseHitObject {
    private _hitSound: HitSoundType; // Used for calculating color and size (weird method peppy)

    constructor(pos: Vector2, startTime: number, endTime: number, type: HitType, hitSound: HitSoundType) {
        super(pos, startTime, endTime, type);
        this._hitSound = hitSound;
    }

    get isBlue(): boolean {
        return (this._hitSound & HitSoundType.Clap) > 0 || (this._hitSound & HitSoundType.Whistle) > 0
    }

    get isLarge(): boolean {
        return (this._hitSound & HitSoundType.Finish) > 0;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            isBlue: this.isBlue,
            isLarge: this.isLarge
        }
    }
}