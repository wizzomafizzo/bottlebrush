import * as express from "express";
import * as http from "http";
import * as WebSocket from "ws";
import { v4 as uuid } from "uuid";
import { AddressInfo } from "net";

const port = 8999;

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, clientTracking: true });

const ROLE = {
    controller: "controller",
    web: "web",
};

const COMMAND = {
    identify: "identify",
    statusUpdate: "statusUpdate",
    startStation: "startStation",
    stopStation: "stopStation",
};

interface Message {
    command: string;
}

interface ControllerStatus extends Message {
    date: string;
    temperature: number;
    pressure: number;
    solenoids: boolean[];
}

interface Identity extends Message {
    role: string;
}

interface StartStation extends Message {
    stationId: number;
}

interface StopStation extends Message {
    stationId: number;
}

interface SIWebSocket extends WebSocket {
    id?: string;
    role?: string;
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

function getClientsByRole(role: string): SIWebSocket[] {
    let clients: SIWebSocket[] = [];
    getAllClients().forEach(function (ws) {
        if (ws.role === role) {
            clients.push(ws);
        }
    });
    return clients;
}

function parseMessage(data: any): Message {
    const message: Message = JSON.parse(data);
    if (!("command" in message)) {
        throw Error("Missing 'command' in message");
    }
    return message;
}

function doIdentify(id: string, message: Identity): void {
    // TODO: Check types on properties
    if (!("role" in message)) {
        throw Error("Missing 'role' in message");
    } else if (!Object.values(ROLE).includes(message.role)) {
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

    const webClients = getClientsByRole(ROLE.web);
    webClients.forEach((ws) => ws.send(JSON.stringify(message)));
    console.log("Sent controller status update to web clients");
}

function doStartStation(id: string, message: StartStation) {
    const controllers = getClientsByRole(ROLE.controller);
    controllers.forEach((ws) => ws.send(JSON.stringify(message)));
    console.log(`Started station ${message.stationId} on controllers`);
}

function doStopStation(id: string, message: StopStation) {
    const controllers = getClientsByRole(ROLE.controller);
    controllers.forEach((ws) => ws.send(JSON.stringify(message)));
    console.log(`Stopped station ${message.stationId} on controllers`);
}

function messageHandler(id: string, message: Message): void {
    switch (message.command) {
        case COMMAND.identify:
            doIdentify(id, <Identity>message);
            break;
        case COMMAND.statusUpdate:
            doStatusUpdate(id, <ControllerStatus>message);
            break;
        case COMMAND.startStation:
            doStartStation(id, <StartStation>message);
            break;
        case COMMAND.stopStation:
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
    ws.send(JSON.stringify({ id: id }));

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

server.listen(port, "0.0.0.0", () => {
    console.log(`Server started on port ${port}`);
});
