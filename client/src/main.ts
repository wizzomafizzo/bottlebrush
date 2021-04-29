import { createApp } from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router";

import { Button } from "vant";
import { Col, Row } from "vant";
import { Switch } from "vant";
import { Cell, CellGroup } from "vant";
import { Icon } from "vant";
import { Tabbar, TabbarItem } from "vant";
import "vant/lib/index.css";

const app = createApp(App);
app.use(store);
app.use(router);
app.use(Button);
app.use(Col);
app.use(Row);
app.use(Switch);
app.use(Cell);
app.use(CellGroup);
app.use(Icon);
app.use(Tabbar);
app.use(TabbarItem);
app.mount("#app");
