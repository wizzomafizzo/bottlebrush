export const ROLE = {
    controller: "controller",
    web: "web",
};

export const COMMAND = {
    identify: "identify",
    statusUpdate: "statusUpdate",
    startStation: "startStation",
    stopStation: "stopStation",
};

export interface Message {
    command: string;
}

export interface ControllerStatus extends Message {
    date: string;
    temperature: number;
    pressure: number;
    solenoids: boolean[];
}

export interface Identity extends Message {
    role: string;
}

export interface StartStation extends Message {
    stationId: number;
}

export interface StopStation extends Message {
    stationId: number;
}
