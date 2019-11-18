import Vue from 'vue'
import App from './App.vue'

const Octokit = require("@octokit/rest")
const octokit = new Octokit({
	auth: process.env.VUE_APP_PERSONAL_AUTH,
	userAgent: "gitVisual 1.0 by leomcclean"
})

Vue.prototype.$query = octokit

Vue.config.productionTip = false

new Vue(
{
	render: h => h(App),
}).$mount('#app')
