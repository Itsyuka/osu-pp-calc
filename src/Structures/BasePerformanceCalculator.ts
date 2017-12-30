import {Score} from "./Score";
import {Mods} from "../Enums/Mods";
import {hasType} from "../Utils/hasType";

export class BasePerformanceCalculator {
    difficulty: any;
    score: Score;

    aimValue: number = 0;
    speedValue: number = 0;
    accuracyValue: number = 0;
    strainValue: number = 0;
    totalPerformanceValue: number = 0;

    constructor(difficulty: any, score: Score) {
        this.difficulty = difficulty;
        this.score = score;
    }

    hasMod(mod: Mods) {
        return hasType(this.difficulty.mods, mod);
    }
}