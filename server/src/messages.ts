export enum Role {
    Controller,
    WebClient
}

export enum Command {
    Identify,
    StatusUpdate,
    StartStation,
    StopStation,
}

export interface Message {
    command: Command;
}

export interface ControllerStatus extends Message {
    date: string;
    temperature: number;
    pressure: number;
    solenoids: boolean[];
}

export interface Identity extends Message {
    role: Role;
}

export interface StartStation extends Message {
    stationId: number;
}

export interface StopStation extends Message {
    stationId: number;
}

export function parseMessage(data: any): Message {
    const message: Message = JSON.parse(data);
    if (!("command" in message)) {
        throw Error("Missing 'command' in message");
    }
    return message;
}
