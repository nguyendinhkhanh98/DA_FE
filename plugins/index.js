import Vue from "vue";
import lodash from "lodash";
import VueApexCharts from "vue-apexcharts";
import Print from "vue-print-nb";
import CKEditor from "ckeditor4-vue";
import { Network } from "vue-vis-network";

export default () => {
  Vue.use(VueApexCharts);
  Vue.component("apexchart", VueApexCharts);
  Vue.component("network", Network);
  Vue.use(lodash);
  Vue.use(Print);
  Vue.use(CKEditor);
};
