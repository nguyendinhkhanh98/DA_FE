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
          text: "Ratio for time spent"
        },
        labels: ["Bug", "Others"],
        colors: ["#eb3434", "#545454"],
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
                    return w.globals.seriesTotals
                      .reduce((a, b) => {
                        return a + b;
                      }, 0)
                      .toFixed(2);
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
    handleIssueType() {
      if (!_.isEmpty(this.dataSource)) {
        let labels = _.uniq(this.dataSource.issues.map(issue => issue.fields.issuetype.name));
        labels = _.sortBy(labels, function(item) {
          return item === "Bug" ? 0 : 1;
        });
        let series = labels.map(item => 0);
        labels.forEach((item, index) =>
          this.dataSource.issues.forEach(issue => {
            if (issue.fields.issuetype.name === item) {
              series[index] += issue.fields.timespent ? issue.fields.timespent / 3600 : 0;
            }
          })
        );
        series = series.map(item => +item.toFixed(2));
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
