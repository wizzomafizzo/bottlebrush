import * as WebSocket from "ws";
import { COMMAND, ControllerStatus, Identity, ROLE } from "./messages";

const ws = new WebSocket("ws://localhost:8999/");
var statusInterval: NodeJS.Timeout;

ws.on("open", function () {
    ws.send(
        JSON.stringify(<Identity>{
            command: COMMAND.identify,
            role: ROLE.controller,
        })
    );
    statusInterval = setInterval(
        () => ws.send(JSON.stringify(generateStatus())),
        1000
    );
});

function generateStatus(): ControllerStatus {
    return {
        command: COMMAND.statusUpdate,
        date: new Date().getTime().toString(),
        temperature: 5 * Math.random() + 20,
        pressure: 25 * Math.random() + 1000,
        solenoids: [false, false, false, false, false],
    };
}
