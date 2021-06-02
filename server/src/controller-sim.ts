import * as dotenv from "dotenv";
import * as WebSocket from "ws";
import {
    Role,
    ControllerStatus,
    Identity,
    Command,
    Message,
    StartStation,
    parseMessage,
} from "./messages";

console.log(dotenv.config());

const ws = new WebSocket(
    `ws://${process.env.WS_HOST}:${process.env.WS_PORT}${process.env.WS_PATH}`
);
var statusInterval: NodeJS.Timeout;
var solenoids = [false, false, false, false, false];

ws.on("open", function () {
    ws.send(
        JSON.stringify(<Identity>{
            command: Command.Identify,
            role: Role.Controller,
        })
    );

    statusInterval = setInterval(
        () => ws.send(JSON.stringify(generateStatus())),
        1000
    );

    ws.on("message", function (data) {
        let message: Message = parseMessage(data);
        switch (message.command) {
            case Command.StartStation:
                let cmd = <StartStation>message;
                for (let i = 0; i < solenoids.length; i++) {
                    solenoids[i] = false;
                }
                solenoids[0] = true;
                solenoids[cmd.stationId] = true;
                break;
            case Command.StopStation:
                for (let i = 0; i < solenoids.length; i++) {
                    solenoids[i] = false;
                }
                break;
            default:
                break;
        }
    });
});

function generateStatus(): ControllerStatus {
    return {
        command: Command.StatusUpdate,
        date: new Date().toISOString(),
        solenoids: solenoids,
    };
}
