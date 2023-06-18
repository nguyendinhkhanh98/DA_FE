<template>
  <div v-if="showChart" class="mb-1">
    <div class="ml-2 text-bold" v-if="mode != 'define'">{{ title }}</div>
    <a-row :gutter="16">
      <a-col :span="12">
        <div class="ml-2 text-bold" v-if="mode == 'define'">{{ $t("engineer_skill") }}</div>
        <apexchart type="bar" height="200" :options="eSkillChartOptions" :series="listESkill"
      /></a-col>
      <a-col :span="12">
        <div class="ml-2 text-bold" v-if="mode == 'define'">{{ $t("business_skill") }}</div>
        <apexchart type="bar" height="200" :options="bSkillChartOptions" :series="listBSkill"
      /></a-col>
    </a-row>
  </div>
</template>

<script>
const SUCCESS_COLOR = "#28a745";
const WARN_COLOR = "#ffc107";
const SK = "sk";
const BSK = "bsk";
let eaw = require("eastasianwidth");
export default {
  props: {
    title: String,
    series: Array,
    labels: Array,
    mode: {
      type: String,
      required: true,
      validator: function (value) {
        // The value must match one of these strings
        return ["define", "fit", "gap"].indexOf(value) !== -1;
      }
    }
  },
  data() {
    return {
      listESkill: [
        {
          data: []
        }
      ],
      listBSkill: [
        {
          data: []
        }
      ],
      eSkillChartOptions: {
        title: {
          align: "left",
          margin: 10,
          offsetX: 0,
          offsetY: 0,
          floating: false,
          style: {
            fontSize: "14px",
            fontWeight: "bold",
            color: "#263238"
          }
        },
        chart: {
          type: "bar",
          toolbar: {
            show: false
          }
        },
        colors: [
          "#E8005E",
          "#68E42B",
          "#D800E8",
          "#00FA97",
          "#FF6BFF",
          "#F7E800",
          "#0031B8",
          "#FFEA3C",
          "#0069F3",
          "#C9FB7B"
        ],
        plotOptions: {
          bar: {
            columnWidth: "45%",
            distributed: true
          }
        },
        dataLabels: {
          enabled: true
        },
        legend: {
          show: false
        },
        xaxis: {
          categories: [],
          labels: {
            style: {
              fontSize: "12px",
              colors: []
            },
            formatter: value => this.truncate(value || "", 20),
            rotate: 0
          }
        },
        yaxis: {
          tickAmount: 4,
          min: 0,
          max: 4,
          labels: {
            minWidth: 40,
            formatter: value => {
              return value;
            }
          }
        },
        tooltip: {
          enabled: true,
          y: {
            title: {
              formatter: (value, { series, seriesIndex, dataPointIndex, w }) => "Level:"
            }
          },
          x: {
            formatter: (value, { series, seriesIndex, dataPointIndex, w }) => value
          }
        }
      },
      bSkillChartOptions: {
        title: {
          align: "left",
          margin: 10,
          offsetX: 0,
          offsetY: 0,
          floating: false,
          style: {
            fontSize: "14px",
            fontWeight: "bold",
            color: "#263238"
          }
        },
        chart: {
          type: "bar",
          toolbar: {
            show: false
          }
        },
        colors: [
          "#9E40C6",
          "#008900",
          "#FF6DFF",
          "#006600",
          "#006EF7",
          "#FF5F00",
          "#0083FF",
          "#EE0013",
          "#00FFFF",
          "#FF0084"
        ],
        plotOptions: {
          bar: {
            columnWidth: "45%",
            distributed: true
          }
        },
        dataLabels: {
          enabled: true
        },
        legend: {
          show: false
        },
        xaxis: {
          categories: [],
          labels: {
            style: {
              fontSize: "12px",
              colors: []
            },
            formatter: value => this.truncate(value || "", 20),
            rotate: 0
          }
        },
        yaxis: {
          tickAmount: 4,
          min: 0,
          max: 4,
          labels: {
            minWidth: 40,
            formatter: value => {
              return value;
            }
          }
        },
        tooltip: {
          enabled: true,
          y: {
            title: {
              formatter: (value, { series, seriesIndex, dataPointIndex, w }) => "Level:"
            }
          },
          x: {
            formatter: (value, { series, seriesIndex, dataPointIndex, w }) => value
          }
        }
      },
      showChart: false
    };
  },
  methods: {
    truncate(str, n) {
      let firstCharIsFullWidth = str.length ? [...str].findIndex(char => eaw.characterLength(char) === 2) != -1 : false;
      let maxLength = firstCharIsFullWidth ? n / 2 : n;
      if (str.length <= maxLength) {
        return str;
      }
      const subString = str.substr(0, maxLength - 1); // the original check
      return subString + "...";
    }
  },
  created() {
    this.listESkill[0].data = this.series.filter(item => item.x == SK);
    this.listBSkill[0].data = this.series.filter(item => item.x == BSK);
    this.eSkillChartOptions.xaxis.categories = this.labels.filter(item => item.type == SK).map(item => item.name);
    this.bSkillChartOptions.xaxis.categories = this.labels.filter(item => item.type == BSK).map(item => item.name);

    if (this.mode == "fit") {
      const colors = this.series.map(item => SUCCESS_COLOR);
      this.eSkillChartOptions.xaxis.labels.style.colors = colors;
      this.bSkillChartOptions.xaxis.labels.style.colors = colors;
    } else if (this.mode == "gap") {
      const colors = this.series.map(item => WARN_COLOR);
      this.eSkillChartOptions.xaxis.labels.style.colors = colors;
      this.bSkillChartOptions.xaxis.labels.style.colors = colors;
    }

    this.showChart = true;
  }
};
</script>
