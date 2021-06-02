import store from "@/store";

interface ControllerStatus {
    date: string;
    temperature: number;
    pressure: number;
    solenoids: boolean[];
}

export class Broker {
    url: string;
    status: ControllerStatus;
    ws: WebSocket;
    constructor() {
        this.url = "ws://127.0.0.1:8999/";
        this.status = {
            date: "",
            temperature: 0,
            pressure: 0,
            solenoids: [],
        };
        this.ws = new WebSocket(this.url);
        this.ws.onmessage = (message) => this.messageHandler(message);
        this.ws.onopen = (event) => {
            this.ws.send(
                JSON.stringify({
                    command: 0,
                    role: 1,
                })
            );
            console.log("Connected");
        };
    }
    messageHandler(message: MessageEvent) {
        const msg = JSON.parse(message.data);

        switch (msg.command) {
            case 1:
                this.status = {
                    date: msg.date,
                    temperature: msg.temperature,
                    pressure: msg.pressure,
                    solenoids: [...msg.solenoids],
                };
                this.updateStore();
                break;
            default:
                break;
        }
    }
    setStation(id: number, status: boolean) {
        this.updatePendingSolenoids(true);
        let command = 3;
        if (status) {
            command = 2;
        }
        this.ws.send(
            JSON.stringify({
                command: command,
                stationId: id,
            })
        );
        // TODO: this should be triggered based on a response from controller
        setTimeout(() => this.updatePendingSolenoids(false), 1500);
    }
    updatePendingSolenoids(status: boolean) {
        store.dispatch("setPendingSolenoids", status);
    }
    updateStore() {
        store.dispatch("setDate", new Date(this.status.date));
        if (!store.state.pendingSolenoids) {
            store.dispatch("setSolenoids", this.status.solenoids);
        }
    }
}
