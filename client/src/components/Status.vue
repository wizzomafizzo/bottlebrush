<template>
  <div>
    <van-cell-group title="Controller">
      <van-cell title="Date" v-bind:icon="dateIcon()" v-bind:value="getDate()" />
      <van-cell title="Temperature" v-bind:icon="temperatureIcon()" v-bind:value="getTemperature() + ' °C'" />
      <van-cell title="Pressure" v-bind:icon="pressureIcon()" v-bind:value="getPressure() + ' hPa'" />
      <div class="van-hairline--top"></div>
      <div class="solenoids">
        <van-row>
          <van-col span="6">
            <div class="solenoid-heading">M</div>
            <van-switch
              v-model="solenoids[0]"
              disabled
              v-bind:loading="pendingSolenoids"
            />
          </van-col>
          <van-col span="6">
            <div class="solenoid-heading">1</div>
            <van-switch
              v-model="solenoids[1]"
              v-bind:loading="pendingSolenoids"
              v-on:change="(s) => setStation(1, s)"
            />
          </van-col>
          <van-col span="6">
            <div class="solenoid-heading">2</div>
            <van-switch
              v-model="solenoids[2]"
              v-bind:loading="pendingSolenoids"
              v-on:change="(s) => setStation(2, s)"
            />
          </van-col>
          <van-col span="6">
            <div class="solenoid-heading">3</div>
            <van-switch
              v-model="solenoids[3]"
              v-bind:loading="pendingSolenoids"
              v-on:change="(s) => setStation(3, s)"
            />
          </van-col>
        </van-row>
      </div>
    </van-cell-group>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import store from "@/store";

export default defineComponent({
  name: "Status",
  computed: {
    solenoids: {
      get() {
        return store.state.solenoids;
      },
      set() {
        return;
      },
    },
    pendingSolenoids: () => store.state.pendingSolenoids,
  },
  methods: {
    getDate(): string {
      let date = store.state.date;
      return date.toLocaleString("en-AU");
    },
    getTemperature(): string {
      return store.state.temperature.toFixed(1).toString();
    },
    getPressure(): string {
      return store.state.pressure.toFixed(2).toString();
    },
    printSolenoid(state: boolean): string {
      if (state === true) {
        return "On";
      } else {
        return "Off";
      }
    },
    setStation(id: number, status: any) {
      store.dispatch("setStation", { id: id, status: status });
    },
    getSolenoids(): boolean[] {
      return [...store.state.solenoids];
    },
    dateIcon() {
      return require("@/assets/calendar.svg");
    },
    temperatureIcon() {
      return require("@/assets/thermometer.svg");
    },
    pressureIcon() {
      return require("@/assets/cloud.svg");
    }
  },
});
</script>

<style scoped>
.solenoids {
  padding-top: 13px;
  padding-bottom: 13px;
  text-align: center;
}

.solenoid-heading {
  font-weight: 500;
}
</style>
