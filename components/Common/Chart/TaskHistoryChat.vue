<template>
  <div>
    <a-row class="chart-margin-title" type="flex" align="middle" justify="space-between">
      <a-col>
        <span class="h1">{{ "Biểu đồ tổng hợp trạng thái công việc" }}</span>
      </a-col>
    </a-row>
    <Bar
      :chart-options="chartOptions"
      :chart-data="chartData"
      :chart-id="chartId"
      :dataset-id-key="datasetIdKey"
      :plugins="plugins"
      :css-classes="cssClasses"
      :styles="styles"
      :width="width"
      :height="height"
      v-if="loaded"
    />
  </div>
</template>

<script>
import { Bar } from "vue-chartjs/legacy";

import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from "chart.js";
import { mapState, mapActions, mapMutations } from "vuex";
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default {
  name: "BarChart",
  components: {
    Bar
  },
  props: {
    chartId: {
      type: String,
      default: "bar-chart"
    },
    datasetIdKey: {
      type: String,
      default: "label"
    },
    width: {
      type: Number,
      default: 500
    },
    height: {
      type: Number,
      default: 500
    },
    cssClasses: {
      default: "",
      type: String
    },
    styles: {
      type: Object,
      default: () => {}
    },
    plugins: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      chartData: null,
      chartOptions: {
        responsive: false,
        maintainAspectRatio: false
      },
      loaded: false
    };
  },
  methods: {
    ...mapActions({
      getAllHistoryByTaskId: "modules/management-task/getAllHistoryByTaskId"
    }),
    ...mapMutations({
      setIsChangeTask: "modules/management-task/setIsChangeTask"
    })
  },
  computed: {
    ...mapState({
      listTaskHistories: state => state.modules["management-task"].listTaskHistories,
      isChangeTask: state => state.modules["management-task"].isChangeTask
    })
  },
  async created() {
    const routeId = this.$route.params.id;
    const data = await this.getAllHistoryByTaskId(routeId);
    const totalTaskNew = data?.data.filter(item => item?.status == "new")?.length || 0;
    const totalTaskWorking = data?.data.filter(item => item?.status == "working")?.length || 0;
    const totalTaskDone = data?.data.filter(item => item?.status == "done")?.length || 0;
    this.chartData = {
      labels: ["Task New", "Task Working", "Task Done"],
      datasets: [
        {
          label: "Biểu đồ tổng hợp công việc",
          backgroundColor: ["#4dbd74", "#ffc107", "#c3c3c3"],
          data: [totalTaskNew, totalTaskWorking, totalTaskDone]
        }
      ]
    };
    this.loaded = true;
  },
  watch: {
    async listTaskHistories() {
      this.loaded = false;
      const totalTaskNew = this.listTaskHistories.filter(item => item?.status == "new")?.length || 0;
      const totalTaskWorking = this.listTaskHistories.filter(item => item?.status == "working")?.length || 0;
      const totalTaskDone = this.listTaskHistories.filter(item => item?.status == "done")?.length || 0;
      this.chartData = {
        labels: ["Task New", "Task Working", "Task Done"],
        datasets: [
          {
            label: "Biểu đồ tổng hợp công việc",
            backgroundColor: ["#4dbd74", "#ffc107", "#c3c3c3"],
            data: [totalTaskNew, totalTaskWorking, totalTaskDone]
          }
        ]
      };
      this.loaded = true;
      this.setIsChangeTask(false);
      this.$forceUpdate();
    }
  }
};
</script>
<style>
.chart-margin-title {
  margin-bottom: 20px;
}
</style>
