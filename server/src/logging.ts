import * as dotenv from "dotenv";
import { format, formatDistanceToNow, formatISO } from "date-fns";
import { existsSync, mkdirSync, appendFileSync } from "fs";
import { ControllerStatus } from "./messages";

dotenv.config();

export enum Device {
    System = "system",
    Controller = "controller",
}

export enum Level {
    ERROR,
    WARN,
    INFO,
    DEBUG
}

export class Logging {
    device: Device;
    path: string;
    file: string;
    lastLogged: number;
    constructor(device: Device) {
        this.device = device;
        let path = `${process.env.LOG_PATH}/${device}`;
        if (!existsSync(process.env.LOG_PATH)) {
            mkdirSync(process.env.LOG_PATH);
        } else if (!existsSync(path)) {
            mkdirSync(path);
        }
        this.path = path;
        let timestamp = format(new Date(), "yyyy-MM-dd")
        this.file = `${path}/${timestamp}.log`;
        this.lastLogged = 0; 
    }
    log(level: Level, data: string) {
        let timestamp = formatISO(new Date());
        let message = `${timestamp} - ${Level[level]}  - ${data}`;
        console.log(message);
        if (level < Level.DEBUG) {
            appendFileSync(this.file, message + "\n");
        }
    }
    logController(data: ControllerStatus) {
        let now = new Date();
        // TODO: Configure time in env file
        if (now.getTime() - this.lastLogged > 60000) {
            appendFileSync(this.file, JSON.stringify(data) + "\n");
            this.lastLogged = now.getTime();
        }
    }
}

// TODO: Function to compress old logs
