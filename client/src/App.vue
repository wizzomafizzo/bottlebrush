<template>
    <router-view />
    <van-tabbar route>
        <van-tabbar-item replace to="/controller" icon="home-o"
            >Controller</van-tabbar-item
        >
    </van-tabbar>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "App",
    components: {},
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
