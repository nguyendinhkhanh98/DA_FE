<template>
  <apexchart height="400" type="donut" :options="chartOptions" :series="series"></apexchart>
</template>

<script>
export default {
  props: {
    dataSource: Object
  },
  data() {
    return {
      series: [50, 50],
      chartOptions: {
        chart: {
          toolbar: {
            show: true
          }
        },
        title: {
          position: "bottom",
          text: "Issue type"
        },
        labels: ["Team A", "Team B"],
        colors: ["#77B6EA", "#545454"],
        plotOptions: {
          pie: {
            donut: {
              labels: {
                show: true,
                total: {
                  show: true,
                  showAlways: true,
                  label: "Total",
                  fontSize: "22px",
                  fontFamily: "Helvetica, Arial, sans-serif",
                  fontWeight: 600,
                  color: "#373d3f",
                  formatter: function(w) {
                    return w.globals.seriesTotals.reduce((a, b) => {
                      return a + b;
                    }, 0);
                  }
                }
              }
            }
          }
        }
      }
    };
  },
  watch: {
    dataSource() {
      this.handleIssueType();
    }
  },
  mounted() {
    this.handleIssueType();
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
    handleIssueType() {
      if (!_.isEmpty(this.dataSource)) {
        let labels = _.uniq(this.dataSource.issues.map(issue => issue.fields.issuetype.name));
        labels = _.sortBy(labels, function(item) {
          return item === "Bug" ? 0 : 1;
        });
        let series = labels.map(
          item => this.dataSource.issues.filter(issue => issue.fields.issuetype.name === item).length
        );
        let colors = _.map(labels, o => {
          let color;
          switch (o) {
            case "Story":
            case "Improvement":
            case "New Feature":
              color = "#66b945";
              break;
            case "Bug":
            case "Atv Internal Bug":
            case "Sub-task":
            case "Internal Bug":
              color = "#e34b40";
              break;
            case "Epic":
            case "UI spec":
              color = "#9054df";
              break;
            case "Q&A":
            case "Clarification-Needed":
              color = "#f6923f";
              break;
            case "Task":
            case "Coding & Unit Test":
            case "Research-task":
            case "Test":
              color = "#50aee6";
              break;
            case "Technical task":
              color = "#989898";
              break;
          }
          return color;
        });

        labels = labels.map((item, index) => item + ": " + series[index]);
        this.chartOptions = {
          ...this.chartOptions,
          ...{ labels },
          ...{ colors },
          ...{
            tooltip: {
              custom({ series, seriesIndex, dataPointIndex, w }) {
                return '<div class="arrow_box">' + "<span>" + w.globals.labels[seriesIndex] + "</span>" + "</div>";
              }
            }
          }
        };
        this.series = series;
      }
    }
  }
};
</script>

<style>
.arrow_box {
  padding: 4px 8px;
}
</style>
