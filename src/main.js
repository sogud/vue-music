import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import fastclick from 'fastclick'
import VueLazyload from 'vue-lazyload'
import store from './store'
import defaultImg from 'common/image/default.png'

import 'common/stylus/index.styl'

/* eslint-disable no-unused-vars */
// import vConsole from 'vconsole'

fastclick.attach(document.body)

const app = createApp(App)

app.use(router)
app.use(store)
app.use(VueLazyload, {
  loading: defaultImg
})

app.mount('#app')
