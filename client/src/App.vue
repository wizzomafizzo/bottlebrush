<template>
  <Status />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Status from "./components/Status.vue";

export default defineComponent({
  name: "App",
  components: {
    Status,
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
