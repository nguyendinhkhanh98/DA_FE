<template>
  <apexchart ref="apexchart" type="bar" height="350" :options="chartOptions" :series="series"></apexchart>
</template>

<script>
export default {
  props: {
    dataSource: Array
  },
  data() {
    return {
      series: [
        {
          name: this.$t("cost_against_estimation_ratio"),
          data: []
        }
      ],
      chartOptions: {
        title: {
          text: this.$t("cost_against_estimation_ratio") + " (%)",
          align: "left"
        },
        chart: {
          type: "bar",
          height: 350
        },
        plotOptions: {
          bar: {
            colors: {
              ranges: [
                {
                  from: -100,
                  to: -46,
                  color: "#F15B46"
                },
                {
                  from: -45,
                  to: 0,
                  color: "#FEB019"
                }
              ]
            },
            columnWidth: "80%",
            horizontal: true
          }
        },
        dataLabels: {
          enabled: false
        },
        xaxis: {
          categories: [],
          labels: {
            rotate: -90
          }
        }
      }
    };
  },
  mounted() {
    let categories = this.dataSource.map(item => item[0]);
    let series = this.dataSource.map(item => item[6]);
    this.updateChartWithCategoriesOptions(categories, series);
  },
  methods: {
    async getBase64ApexChart() {
      let chart = this.$refs["apexchart"];
      let { imgURI } = await chart.dataURI();
      return imgURI;
    },
    async updateChartWithCategoriesOptions(categories, series) {
      let apexchart = this.$refs["apexchart"];

      this.chartOptions.xaxis.categories = categories;
      this.series[0].data = series;

      await apexchart.updateOptions(this.chartOptions);
      await apexchart.updateSeries(this.series);
    }
  }
};
</script>
