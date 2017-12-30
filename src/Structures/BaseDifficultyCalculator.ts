import {Beatmap} from "./Beatmap";
import {Mods} from "../Enums/Mods";
import {Score} from "./Score";
import {hasType} from "../Utils/hasType";

export class BaseDifficultyCalculator {
    beatmap: Beatmap;
    mods: Mods;

    aimDifficulty: number = 0;
    speedDifficulty: number = 0;
    strainDifficulty: number = 0;
    starDifficulty: number = 0;

    constructor(beatmap: Beatmap, mods: Mods) {
        this.beatmap = beatmap;
        this.mods = mods;
    }

    async calculate() {
        // Not implemented
    }

    get circleSize() {
        return this.beatmap.Difficulty.CircleSize;
    }

    get overallDifficulty() {
        return this.beatmap.Difficulty.OverallDifficulty;
    }

    get approachRate() {
        return this.beatmap.Difficulty.ApproachRate;
    }

    get hpDrainRate() {
        return this.beatmap.Difficulty.HPDrainRate;
    }

    get timeRate() {
        let rate = 1;
        if(hasType(this.mods, Mods.DoubleTime) || hasType(this.mods, Mods.Nightcore)) {
            rate *= 1.5;
        } else if(hasType(this.mods, Mods.HalfTime)) {
            rate *= 0.75;
        }
        return rate;
    }

    performance(score: Score) {
        return null;
    }
}