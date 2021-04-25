import * as dotenv from "dotenv";
import { format, formatISO } from "date-fns";
import { existsSync, mkdirSync, appendFileSync } from "fs";
import { ControllerStatus } from "./messages";

dotenv.config();

export enum Category {
    System = "system",
    Controller = "controller",
}

export enum Level {
    ERROR,
    WARN,
    INFO,
    DEBUG,
}

export class Logging {
    category: Category;
    path: string;
    file: string;
    lastLogged: number;
    constructor(category: Category) {
        this.category = category;
        let path = `${process.env.LOG_PATH}/${category}`;
        if (!existsSync(process.env.LOG_PATH)) {
            mkdirSync(process.env.LOG_PATH);
        }
        if (!existsSync(path)) {
            mkdirSync(path);
        }
        this.path = path;
        let timestamp = format(new Date(), "yyyy-MM-dd");
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
