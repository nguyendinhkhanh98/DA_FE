<template>
  <apexchart ref="apexchart-pie" v-bind="chartOptions"></apexchart>
</template>

<script>
export default {
  props: {
    dataSource: Array
  },
  data() {
    return {
      chartOptions: {
        width: "500",
        options: {
          title: {
            text: this.$t("total_man_hour") + " (%)",
            align: "left"
          },
          chart: {
            type: "pie"
          },
          dataLabels: {
            enabled: true
          },
          labels: []
        },
        series: []
      }
    };
  },
  mounted() {
    let categories = this.dataSource.map(item => item[0]);
    let series = this.dataSource.map(item => item[1]);
    this.updateChartWithLabelsOptions("pie", categories, series);
  },
  methods: {
    async getBase64ApexChart() {
      let chart = this.$refs["apexchart-pie"];
      let { imgURI } = await chart.dataURI();
      return imgURI;
    },
    async updateChartWithLabelsOptions(type, categories, series) {
      let apexchart = this.$refs["apexchart-pie"];

      // this.chartOptions.options.chart.type = type;
      this.chartOptions.options.labels = categories;
      this.chartOptions.series = series;

      await apexchart.updateOptions(this.chartOptions.options);
      await apexchart.updateSeries(this.chartOptions.series);
    }
  }
};
</script>
