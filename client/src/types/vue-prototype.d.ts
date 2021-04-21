import Vue from "vue";
import { Broker } from "@/broker";

declare module "vue/types/vue" {
    interface VueConstructor {
        $broker: Broker;
    }
}
