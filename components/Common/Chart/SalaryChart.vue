<script>
import Vue from "vue";
import VueChartJs from "vue-chartjs";
import { mapState } from "vuex";
export default Vue.component("lineChart", {
  extends: VueChartJs.Line,
  props: ["data"],
  mounted() {
    let labels = this.data.map(v => {
      return v.month;
    });
    let salaries = this.data.map(v => {
      return v.salaryaday / 1000;
    });
    this.renderChart(
      {
        labels: labels,
        datasets: [
          {
            label: this.$t("salary"),
            backgroundColor: "#f87979",
            data: salaries
          }
        ]
      },
      {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              display: true,
              scaleLabel: {
                display: true,
                labelString: this.$t("month")
              },
              ticks: {
                major: {
                  fontStyle: "bold",
                  fontColor: "#FF0000"
                }
              }
            }
          ],
          yAxes: [
            {
              display: true,
              scaleLabel: {
                display: true,
                labelString: this.$t("salary")
              },
              ticks: {
                min: 0,
                // max: 200,
                stepSize: 50,
                reverse: false,
                beginAtZero: true
              }
            }
          ]
        }
      }
    );
  },
  computed: {
    ...mapState({
      lang: state => state.lang
    })
  },
  watch: {
    lang() {
      let labels = this.data.map(v => {
        return v.month;
      });
      let salaries = this.data.map(v => {
        return v.salaryaday / 1000;
      });
      this.renderChart(
        {
          labels: labels,
          datasets: [
            {
              label: this.$t("salary"),
              backgroundColor: "#f87979",
              data: salaries
            }
          ]
        },
        {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            xAxes: [
              {
                display: true,
                scaleLabel: {
                  display: true,
                  labelString: this.$t("month")
                },
                ticks: {
                  major: {
                    fontStyle: "bold",
                    fontColor: "#FF0000"
                  }
                }
              }
            ],
            yAxes: [
              {
                display: true,
                scaleLabel: {
                  display: true,
                  labelString: this.$t("salary")
                },
                ticks: {
                  min: 0,
                  // max: 200,
                  stepSize: 50,
                  reverse: false,
                  beginAtZero: true
                }
              }
            ]
          }
        }
      );
    },
    data() {
      let labels = this.data.map(v => {
        return v.month;
      });
      let salaries = this.data.map(v => {
        return v.salaryaday / 1000;
      });
      this.renderChart(
        {
          labels: labels,
          datasets: [
            {
              label: this.$t("salary"),
              backgroundColor: "#f87979",
              data: salaries
            }
          ]
        },
        {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            xAxes: [
              {
                display: true,
                scaleLabel: {
                  display: true,
                  labelString: this.$t("month")
                },
                ticks: {
                  major: {
                    fontStyle: "bold",
                    fontColor: "#FF0000"
                  }
                }
              }
            ],
            yAxes: [
              {
                display: true,
                scaleLabel: {
                  display: true,
                  labelString: this.$t("salary")
                },
                ticks: {
                  min: 0,
                  // max: 200,
                  stepSize: 50,
                  reverse: false,
                  beginAtZero: true
                }
              }
            ]
          }
        }
      );
    }
  }
});
</script>