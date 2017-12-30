import {readFile} from "fs";

export function ReadFile(path: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        readFile(path, (err, data) => {
            if(err) return reject(err);
            resolve(data);
        })
    });
}