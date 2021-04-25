import * as dotenv from "dotenv";
import * as express from "express";
import * as http from "http";
import * as WebSocket from "ws";
import { v4 as uuid } from "uuid";
import {
    Message,
    Identity,
    ControllerStatus,
    StartStation,
    StopStation,
    Role,
    Command,
    parseMessage,
} from "./messages";
import { Logging, Category, Level } from "./logging";
import Weather from "./weather";
import { inspect } from "util";

dotenv.config();

const logger = new Logging(Category.System);
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, clientTracking: true });
const weather = new Weather();

interface BBWebSocket extends WebSocket {
    id?: string;
    role?: Role;
    logger?: Logging;
}

function getAllClients(): BBWebSocket[] {
    let clients: BBWebSocket[] = [];
    wss.clients.forEach(function (ws) {
        clients.push(<BBWebSocket>ws);
    });
    return clients;
}

function getClient(id: string): BBWebSocket | null {
    let client: BBWebSocket | null;
    getAllClients().forEach(function (ws) {
        if (ws.id === id) {
            client = ws;
        }
    });
    return client;
}

function getClientsByRole(role: Role): BBWebSocket[] {
    let clients: BBWebSocket[] = [];
    getAllClients().forEach(function (ws) {
        if (ws.role === role) {
            clients.push(ws);
        }
    });
    return clients;
}

function doIdentify(ws: BBWebSocket, message: Identity): void {
    if (!("role" in message)) {
        throw Error("Missing 'role' in message");
    } else if (!(message.role in Role)) {
        throw Error(`Role '${message.role}' does not exist`);
    }

    ws.role = message.role;
    if (ws.role === Role.Controller) {
        ws.logger = new Logging(Category.Controller);
    }
    logger.log(
        Level.INFO,
        `Assigned role '${Role[message.role]}' to '${ws.id}'`
    );
}

function doStatusUpdate(ws: BBWebSocket, message: ControllerStatus): void {
    // TODO: Check types on these too
    if (!("date" in message)) {
        throw Error("Missing 'date' in message");
    } else if (!("temperature" in message)) {
        throw Error("Missing 'temperature' in message");
    } else if (!("pressure" in message)) {
        throw Error("Missing 'pressure' in message");
    } else if (!("solenoids" in message)) {
        throw Error("Missing 'solenoids' in message");
    }

    const webClients = getClientsByRole(Role.WebClient);
    webClients.forEach((ws) => ws.send(JSON.stringify(message)));
    ws.logger.logController(message);
}

function doStartStation(ws: BBWebSocket, message: StartStation) {
    const controllers = getClientsByRole(Role.Controller);
    controllers.forEach((ws) => ws.send(JSON.stringify(message)));
    logger.log(
        Level.INFO,
        `Started station ${message.stationId} on controllers`
    );
}

function doStopStation(ws: BBWebSocket, message: StopStation) {
    const controllers = getClientsByRole(Role.Controller);
    controllers.forEach((ws) => ws.send(JSON.stringify(message)));
    logger.log(
        Level.INFO,
        `Stopped station ${message.stationId} on controllers`
    );
}

function messageHandler(ws: BBWebSocket, message: Message): void {
    switch (message.command) {
        case Command.Identify:
            doIdentify(ws, <Identity>message);
            break;
        case Command.StatusUpdate:
            doStatusUpdate(ws, <ControllerStatus>message);
            break;
        case Command.StartStation:
            doStartStation(ws, <StartStation>message);
            break;
        case Command.StopStation:
            doStopStation(ws, <StopStation>message);
            break;
        default:
            logger.log(Level.WARN, `Unknown command: ${message.command}`);
    }
}

wss.on("connection", (ws: BBWebSocket, req: http.IncomingMessage) => {
    logger.log(Level.INFO, `Client connected: ${req.socket.remoteAddress}`);
    const id = uuid();
    logger.log(Level.INFO, `Assigning id: ${id}`);
    ws.id = id;

    ws.send(JSON.stringify({ command: Command.Identify, id: id }));

    ws.on("message", (data) => {
        try {
            const message = parseMessage(data);
            messageHandler(ws, message);
        } catch (e) {
            logger.log(Level.ERROR, `Malformed message: ${data}`);
            logger.log(Level.ERROR, e);
        }
    });
});

server.listen(parseInt(process.env.WS_PORT), "0.0.0.0", () => {
    logger.log(Level.INFO, `Server started on port ${process.env.WS_PORT}`);
    // weather.getForecast().then((v) => logger.log(Level.INFO, inspect(v, {showHidden: false, depth: null})));
});
