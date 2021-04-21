import * as dotenv from "dotenv";
import * as express from "express";
import * as http from "http";
import * as WebSocket from "ws";
import { v4 as uuid } from "uuid";
import { AddressInfo } from "net";
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

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, clientTracking: true });

interface SIWebSocket extends WebSocket {
    id?: string;
    role?: Role;
}

function getAllClients(): SIWebSocket[] {
    let clients: SIWebSocket[] = [];
    wss.clients.forEach(function (ws) {
        clients.push(<SIWebSocket>ws);
    });
    return clients;
}

function getClient(id: string): SIWebSocket | null {
    let client: SIWebSocket | null;
    getAllClients().forEach(function (ws) {
        if (ws.id === id) {
            client = ws;
        }
    });
    return client;
}

function getClientsByRole(role: Role): SIWebSocket[] {
    let clients: SIWebSocket[] = [];
    getAllClients().forEach(function (ws) {
        if (ws.role === role) {
            clients.push(ws);
        }
    });
    return clients;
}

function doIdentify(id: string, message: Identity): void {
    // TODO: Check types on properties
    if (!("role" in message)) {
        throw Error("Missing 'role' in message");
    } else if (!(message.role in Role)) {
        throw Error(`Role '${message.role}' does not exist`);
    }

    const client = getClient(id);
    if (!client) {
        throw Error("Client id does not exist");
    }

    client.role = message.role;
    console.log(`Assigned role '${message.role}' to '${id}'`);
}

function doStatusUpdate(id: string, message: ControllerStatus): void {
    // TODO: Check types on properties
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
    console.log("Sent controller status update to web clients");
}

function doStartStation(id: string, message: StartStation) {
    const controllers = getClientsByRole(Role.Controller);
    controllers.forEach((ws) => ws.send(JSON.stringify(message)));
    console.log(`Started station ${message.stationId} on controllers`);
}

function doStopStation(id: string, message: StopStation) {
    const controllers = getClientsByRole(Role.Controller);
    controllers.forEach((ws) => ws.send(JSON.stringify(message)));
    console.log(`Stopped station ${message.stationId} on controllers`);
}

function messageHandler(id: string, message: Message): void {
    switch (message.command) {
        case Command.Identify:
            doIdentify(id, <Identity>message);
            break;
        case Command.StatusUpdate:
            doStatusUpdate(id, <ControllerStatus>message);
            break;
        case Command.StartStation:
            doStartStation(id, <StartStation>message);
            break;
        case Command.StopStation:
            doStopStation(id, <StopStation>message);
            break;
        default:
            console.log(`Unknown command: ${message.command}`);
    }
}

wss.on("connection", (ws: SIWebSocket, req: http.IncomingMessage) => {
    // TODO: This is the server ip, not client
    const { address, port } = req.socket.address() as AddressInfo;
    console.log(`Client connected: ${address}:${port}`);
    const id = uuid();
    console.log(`Assigning id: ${id}`);
    ws.id = id;
    ws.send(JSON.stringify({ command: Command.Identify, id: id }));

    ws.on("message", function incoming(data) {
        try {
            const message = parseMessage(data);
            messageHandler(id, message);
        } catch (e) {
            console.log(`Malformed message: ${data}`);
            console.error(e);
        }
    });
});

server.listen(parseInt(process.env.WS_PORT), "0.0.0.0", () => {
    console.log(`Server started`);
});
