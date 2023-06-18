<template>
  <div v-if="showChartPreview" class="wrapper-chart">
    <apexchart type="rangeBar" :height="heightChart" :width="widthChart" :options="chartOptions" :series="series" />
  </div>
</template>

<script>
import * as CONST from "@/constants/index.js";

export default {
  props: {
    projectInfo: Object
  },
  data() {
    return {
      showChartPreview: false,
      heightChart: 120,
      widthChart: 500,
      chartOptions: {
        chart: {
          type: "rangeBar",
          events: {
            click: (event, chartContext, config) => {
              let invoiceName = config.globals.labels[config.dataPointIndex];
              this.$emit("show-detail", invoiceName);
            }
          }
        },
        plotOptions: {
          bar: {
            horizontal: true,
            distributed: true,
            dataLabels: {
              hideOverflowingLabels: false
            }
          }
        },
        dataLabels: {
          enabled: true,
          formatter: (val, opts) => {
            let a = this.$moment(val[0]);
            let b = this.$moment(val[1]);
            let diff = b.diff(a, "days");
            return `${diff + 1} ${this.$t("days")}`;
          },
          style: {
            colors: ["#f3f4f5", "#fff"]
          }
        },
        xaxis: {
          type: "datetime"
        },
        yaxis: {
          show: true
        },
        grid: {
          row: {
            colors: ["#f3f4f5", "#fff"],
            opacity: 1
          }
        }
      },
      series: []
    };
  },
  created() {
    let series = this.extractDataPreview();
    this.series = series;
    this.showChartPreview = true;
  },
  methods: {
    extractDataPreview() {
      let invoices = this.projectInfo.invoices;
      let series = [{ name: "Invoice", data: [] }];
      invoices.forEach(invoice => {
        let stepInvoice = series.find(x => x.name == "Invoice");
        let startDate = this.getTimeBy(invoice.start_date);
        let endDate = this.getTimeBy(invoice.end_date);
        stepInvoice.data.push({
          x: invoice.name,
          y: [startDate, endDate]
        });
      });
      let totalRows = series[0].data.length;
      this.scaleChartByRows(totalRows);
      return series;
    },
    getTimeBy(dateStr) {
      return this.$moment(dateStr, CONST.DATE_FORMAT_AND_TIME).valueOf();
    },
    scaleChartByRows(rows) {
      if (rows == 1) {
        this.widthChart = 600;
        this.heightChart = 200;
        return;
      }
      this.widthChart *= rows;
      this.heightChart *= rows;
    }
  }
};
</script>

<style lang="less">
.wrapper-chart {
  overflow-x: auto;
  overflow-y: hidden;

  & > div:first-child {
    div.apexcharts-canvas {
      margin: auto !important;
    }
  }
}
</style>
