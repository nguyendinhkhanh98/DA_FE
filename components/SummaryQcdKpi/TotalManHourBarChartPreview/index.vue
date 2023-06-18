<template>
  <apexchart ref="apexchart" v-bind="chartOptions"></apexchart>
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
            text: this.$t("total_man_hour") + " (h)",
            align: "left"
          },
          chart: {
            type: "bar"
          },
          dataLabels: {
            enabled: true
          },
          xaxis: {
            categories: []
          },
          labels: []
        },
        series: [
          {
            name: "Summary KPI",
            data: []
          }
        ]
      }
    };
  },
  mounted() {
    let categories = this.dataSource.map(item => item[0]);
    let series = this.dataSource.map(item => item[1]);
    this.updateChartWithCategoriesOptions("bar", categories, series);
  },
  methods: {
    async getBase64ApexChart() {
      let chart = this.$refs["apexchart"];
      let { imgURI } = await chart.dataURI();
      return imgURI;
    },
    async updateChartWithCategoriesOptions(type, categories, series) {
      let apexchart = this.$refs["apexchart"];

      this.chartOptions.options.chart.type = type;
      this.chartOptions.options.xaxis.categories = categories;
      this.chartOptions.series[0].data = series;

      await apexchart.updateOptions(this.chartOptions.options);
      await apexchart.updateSeries(this.chartOptions.series);
    }
  }
};
</script>
