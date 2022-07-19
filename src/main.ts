import { createApp } from 'vue'
import './index.css'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import mitt from 'mitt';
import router from "./router/index"
import 'primevue/resources/themes/saga-blue/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import { vue3Debounce } from 'vue-debounce'

const emitter = mitt();
const app = createApp(App)
app.config.globalProperties.emitter = emitter;
app.use(router)
.directive('debounce', vue3Debounce({ lock: true }))
.use(PrimeVue)
.mount('#app')
