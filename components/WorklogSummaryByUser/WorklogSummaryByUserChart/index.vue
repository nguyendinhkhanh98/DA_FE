<template>
  <div>
    <apexchart height="500" type="line" :options="chartOptions" :series="series"></apexchart>
  </div>
</template>

<script>
export default {
  props: {
    dataSource: Array,
    columns: Array
  },
  data() {
    return {
      series: [
        {
          name: "High - 2013",
          data: [28, 29, 33, 36, 32, 32, 33]
        },
        {
          name: "Low - 2013",
          data: [12, 11, 14, 18, 17, 13, 13]
        }
      ],
      chartOptions: {
        chart: {
          dropShadow: {
            enabled: true,
            color: "#000",
            top: 18,
            left: 7,
            blur: 10,
            opacity: 0.2
          },
          toolbar: {
            show: true
          }
        },
        colors: ["#77B6EA", "#545454"],
        dataLabels: {
          enabled: true
        },
        stroke: {
          width: 3,
          curve: "smooth"
        },
        title: {
          text: "Timesheet users worklog",
          align: "left"
        },
        grid: {
          borderColor: "#e7e7e7",
          row: {
            colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
            opacity: 0.5
          }
        },
        markers: {
          size: 1
        },
        legend: {
          position: "top",
          horizontalAlign: "right",
          floating: true,
          offsetY: -25,
          offsetX: -5
        },
        xaxis: {
          categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
          title: {
            text: "User"
          }
        },
        yaxis: {
          title: {
            text: "Worklog"
          }
        }
      }
    };
  },
  watch: {
    dataSource() {
      this.handleChartData();
    }
  },
  mounted() {
    this.handleChartData();
  },
  methods: {
    getRandomColor() {
      var letters = "0123456789ABCDEF";
      var color = "#";
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    },
    handleChartData() {
      let categories = this.columns.filter((item, index) => index > 1).map(item => item.title);
      let series = [];
      this.dataSource.forEach((item, index) => {
        let data = [];
        for (const categorie of categories) {
          if (item[categorie] && item[categorie].value) {
            data.push(Math.round((item[categorie].value / 3600) * 100) / 100);
          } else {
            data.push(0);
          }
        }
        series.push({ name: item.worklogAuthor, data: data });
      });
      let colors = [];
      series.forEach(item => {
        let color = this.getRandomColor();
        while (colors.includes(color)) {
          color = this.getRandomColor();
        }
        return colors.push(color);
      });
      this.series = series;
      this.chartOptions = {
        ...this.chartOptions,
        ...{
          xaxis: {
            categories: categories,
            title: {
              text: "User"
            }
          }
        },
        ...{ colors: colors }
      };
    }
  }
};
</script>

<style scoped></style>
