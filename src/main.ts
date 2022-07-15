import { createApp } from 'vue'
import './index.css'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import mitt from 'mitt';
import router from "./router/index"

const emitter = mitt();
const app = createApp(App)
app.config.globalProperties.emitter = emitter;
app.use(router)
.use(PrimeVue)
.mount('#app')
