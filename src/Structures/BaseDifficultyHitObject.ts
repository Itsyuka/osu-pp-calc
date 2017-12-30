
export class BaseDifficultyHitObject {
    object: any;
    startTime: number;
    endTime: number;

    constructor(hitObject: any, timeRate: number) {
        this.object = hitObject;
        this.startTime = Math.floor(hitObject.startTime / timeRate);
        this.endTime = Math.floor(hitObject.endTime / timeRate);
    }
}