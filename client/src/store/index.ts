import { createStore, Store } from "vuex";
import { Broker } from "@/broker";

interface StoreState {
    broker: Broker;
    date: Date;
    temperature: number;
    pressure: number;
    solenoids: boolean[];
    pendingSolenoids: boolean;
}

export default createStore({
    state: <StoreState>{
        broker: new Broker(),
        date: new Date(),
        temperature: 0,
        pressure: 0,
        solenoids: [],
        pendingSolenoids: false,
    },
    mutations: {
        setDate(state, date: Date) {
            state.date = date;
        },
        setTemperature(state, temperature: number) {
            state.temperature = temperature;
        },
        setPressure(state, pressure: number) {
            state.pressure = pressure;
        },
        setSolenoids(state, solenoids: boolean[]) {
            state.solenoids = [...solenoids];
        },
        setStation(
            state: StoreState,
            station: { id: number; status: boolean }
        ) {
            const ss = [...state.solenoids];
            ss[0] = station.status;
            ss[station.id] = station.status;
            state.solenoids = ss;
            state.broker.setStation(station.id, station.status);
        },
        setPendingSolenoids(state: StoreState, status: boolean) {
            state.pendingSolenoids = status;
        }
    },
    actions: {
        setDate(context, date: Date) {
            context.commit("setDate", date);
        },
        setTemperature(context, temperature: number) {
            context.commit("setTemperature", temperature);
        },
        setPressure(context, pressure: number) {
            context.commit("setPressure", pressure);
        },
        setSolenoids(context, solenoids: boolean[]) {
            context.commit("setSolenoids", solenoids);
        },
        setStation(context, station: { id: number; status: boolean }) {
            context.commit("setStation", station);
        },
        setPendingSolenoids(context, status: boolean) {
            context.commit("setPendingSolenoids", status);
        },
    },
    modules: {},
});
