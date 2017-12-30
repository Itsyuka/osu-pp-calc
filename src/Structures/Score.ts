import {Beatmap} from "./Beatmap";
import {PlayMode} from "../Enums/PlayMode";

export class Score {
    playMode: PlayMode;
    scoreVersion: number = 0;
    score: number = 0;
    combo: number = 0;

    count300: number = 0;
    count100: number = 0;
    count50: number = 0;
    countMiss: number = 0;
    countKatu: number = 0;
    countGeki: number = 0;

    static from(beatmap: Beatmap): Score {
        return new Score({
            playMode: beatmap.General.Mode,
            score: 1000000,
            combo: beatmap.maxCombo,
            count300: beatmap.countObjects
        })
    }

    constructor(data = {}) {
        Object.assign(this, data);
    }

    get accuracy() {
        switch(this.playMode) {
            case PlayMode.standard: {
                let total = this.count300 + this.count100 + this.count50 + this.countMiss;
                return total === 0 ? 0 : ((this.count300*6 + this.count100*2 + this.count50)/(total*6));
            }
            case PlayMode.taiko: {
                let total = this.count300 + this.count100 + this.countMiss;
                return total === 0 ? 0 : ((this.count300*2 + this.count100)/(total * 2));
            }
            case PlayMode.ctb: {
                let total = this.count300 + this.count100 + this.countKatu + this.count50 + this.countMiss;
                return total === 0 ? 0 : (this.count300 + this.count100 + this.count50)/total;
            }
            case PlayMode.mania: {
                let total = this.countGeki + this.countKatu + this.count300 + this.count100 + this.count50;
                return total === 0 ? 0 : (((this.countGeki + this.count300) * 6 + this.countKatu * 4 + this.count100 * 2 + this.count50) / (total*6));
            }
            default:
                return 0;
        }
    }

}