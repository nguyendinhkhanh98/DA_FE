const { parsed } = require("dotenv").config({
  path: "environments/.env" + (process.env.NODE_ENV == "development" ? "" : "." + process.env.NODE_ENV)
});

export default {
  ssr: false,
  /*
   ** Headers of the page
   */
  head: {
    title: process.env.TITLE || "DATN",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1" },
      {
        hid: "description",
        name: "description",
        content: process.env.DESCRIPTION || "DATN"
      }
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: false,
  /*
   ** Global CSS
   */
  css: [
    { src: "ant-design-vue/dist/antd.less", lang: "less" },
    { src: "vuesax/dist/vuesax.css", lang: "css" },
    { src: "fullcalendar/dist/fullcalendar.min.css", lang: "css" },
    // "ant-design-vue/dist/antd.css",
    "@/css/main.css",
    "@/css/spacer.css",
    "@/css/text.css",
    "@fortawesome/fontawesome-free/css/all.css",
    { src: "@/css/mixin.less", lang: "less" }
  ],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    "@/plugins/index",
    "@/plugins/antd-ui",
    "@/plugins/axios",
    "@/plugins/i18n",
    "@/plugins/request",
    "@/plugins/vee-validate",
    "@/plugins/vuesax",
    "@/plugins/clientHelper.js",
    "@/plugins/full-calendar.js",
    "@/plugins/vue-number-currency.js",
    "@/plugins/helper-plugin",
    { src: "@/plugins/vue-html2pdf", mode: "client" }
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [],
  /*
   ** Nuxt.js modules
   */
  modules: [
    "@nuxtjs/moment",
    // Doc: https://axios.nuxtjs.org/usage
    "@nuxtjs/axios",
    // Doc: https://github.com/nuxt-community/dotenv-module
    "@nuxtjs/dotenv"
  ],
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {
    baseURL: process.env.API_URL
  },
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {},
    loaders: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          "primary-color": "rgb(0, 82, 204);"
        }
      }
    }
  },
  env: { ...parsed },
  server: {
    port: 3200
  },
  router: {
    middleware: ["lang"]
  }
};
