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
            text: this.$t("chart_combine_quality_bug") + " (%)",
            align: "left"
          },
          chart: {
            type: "bar"
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
    let bugRatioByNumber = {
      name: "Bug Ratio by number(%)",
      data: this.dataSource.map(item => item[2])
    };
    let bugRatioByHour = {
      name: "Bug Ratio by hour(%)",
      data: this.dataSource.map(item => item[3])
    };
    let degrateByNumber = {
      name: "Degration Ratio by number(%)",
      data: this.dataSource.map(item => item[4])
    };
    let degrateByHour = {
      name: "Degration Ratio by hour(%)",
      data: this.dataSource.map(item => item[5])
    };
    let categories = this.dataSource.map(item => item[0]);
    let series = [bugRatioByNumber, bugRatioByHour, degrateByNumber, degrateByHour];

    this.updateChartWithLabelsOptions(categories, series);
  },
  methods: {
    async getBase64ApexChart() {
      let chart = this.$refs["apexchart"];
      let { imgURI } = await chart.dataURI();
      return imgURI;
    },
    async updateChartWithLabelsOptions(categories, series) {
      let apexchart = this.$refs["apexchart"];

      this.chartOptions.options.labels = categories;
      this.chartOptions.series = series;

      await apexchart.updateOptions(this.chartOptions.options);
      await apexchart.updateSeries(this.chartOptions.series);
    }
  }
};
</script>
