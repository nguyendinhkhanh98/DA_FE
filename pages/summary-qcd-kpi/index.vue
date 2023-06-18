<template>
  <a-card class="shadow">
    <h1>{{ $t("summary_qcd_kpi") }}</h1>

    <a-row>
      <a-col v-bind="wrapperContainerCol">
        <a-form v-bind="formItemLayout" @submit.prevent="handleSearch">
          <a-form-item :label="$t('project')" :colon="false">
            <a-select
              v-model="filters.project"
              mode="multiple"
              optionFilterProp="optionFilterProp"
              @change="setRefreshQCD(true)"
            >
              <a-select-option
                v-for="project of aggregateProjectListFromAllURLs"
                :key="project.key"
                :value="`${project.jiraUrl}~${project.key}`"
                :optionFilterProp="project.name"
              >
                <img
                  :src="project.avatarUrls['16x16']"
                  height="16"
                  width="16"
                  border="0"
                  align="absmiddle"
                  :alt="project.name"
                />
                {{ project.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item :label="$t('duration')" :colon="false">
            <a-row>
              <a-col class="pr-1" :span="12">
                <a-date-picker
                  class="w-100"
                  v-model="duration.startDate"
                  placeholder="Start date"
                  :format="dateFormat"
                  :allowClear="true"
                  @change="setRefreshQCD(true)"
                />
              </a-col>
              <a-col class="pl-1" :span="12">
                <a-date-picker
                  class="w-100"
                  v-model="duration.endDate"
                  placeholder="End date"
                  :format="dateFormat"
                  :allowClear="true"
                  @change="setRefreshQCD(true)"
                />
              </a-col>
            </a-row>
            <a-row>
              <span style="color: #a2a2a2;">Filter all issues which logged time within this duration</span>
            </a-row>
          </a-form-item>

          <a-form-item :wrapper-col="actionCol" class="text-center" :colon="false">
            <a-button type="primary" html-type="submit" class="mb-1" :loading="loading">
              <i class="fas fa-search mr-1"></i>
              {{ $t("search") }}
            </a-button>
          </a-form-item>
        </a-form>
      </a-col>
    </a-row>

    <a-row v-if="showDataPreview">
      <a-col :span="12" :offset="12" style="text-align: end;">
        <a-button class="mb-1" type="primary" ghost :loading="loading" @click="handleExportExcel">
          <i class="fas fa-file-excel mr-1 ml-1" style="color: green;"></i>
          {{ $t("export_excel") }}
        </a-button>

        <span id="view-type" class="ml-2">
          {{ $t("view_type") }}
          <a-button class="mb-1" type="primary" :disabled="!viewChartMode" @click="viewChartMode = false">
            <i class="fas fa-table"></i>
          </a-button>
          <a-button class="mb-1" type="primary" :disabled="viewChartMode" @click="viewChartMode = true">
            <i class="fas fa-chart-line"></i>
          </a-button>
        </span>
      </a-col>
    </a-row>

    <template v-if="showDataPreview">
      <a-row v-if="!viewChartMode">
        <TablePreview :dataTablePreview="dataTablePreview" />
      </a-row>
      <template v-else>
        <a-row>
          <a-col :span="12">
            <TotalManHourBarChartPreview :data-source="dataChartPreview" ref="apexchart-total-manhour-bar-chart" />
          </a-col>
          <a-col :span="12">
            <TotalManHourPieChartPreview :data-source="dataChartPreview" ref="apexchart-total-manhour-pie-chart" />
          </a-col>
        </a-row>

        <a-row>
          <a-col :span="12">
            <QualityCombineBugRaioPreview :data-source="dataChartPreview" ref="apexchart-quality-combine-bug-ratio" />
          </a-col>

          <a-col :span="12">
            <CostAgainstEstimationPreview :data-source="dataChartPreview" ref="apexchart-cost-against-estimation" />
          </a-col>
        </a-row>

        <a-row>
          <a-col :span="12">
            <DeliveryMeetRatioChartPreview :data-source="dataChartPreview" ref="apexchart-delivery-meet-ratio" />
          </a-col>
        </a-row>
      </template>
    </template>
  </a-card>
</template>

<script>
import * as CONST from "@/constants/index.js";
import { mapState, mapMutations, mapActions } from "vuex";
import * as Excel from "exceljs/dist/exceljs.min.js";
import * as FileSaver from "file-saver";
import { appendDetailTableWorklogToWorksheet, resortDataExcel, divide } from "./const";
import TablePreview from "@/components/SummaryQcdKpi/TablePreview";
import TotalManHourBarChartPreview from "@/components/SummaryQcdKpi/TotalManHourBarChartPreview";
import TotalManHourPieChartPreview from "@/components/SummaryQcdKpi/TotalManHourPieChartPreview";
import QualityCombineBugRaioPreview from "@/components/SummaryQcdKpi/QualityCombineBugRaioPreview";
import CostAgainstEstimationPreview from "@/components/SummaryQcdKpi/CostAgainstEstimationPreview";
import DeliveryMeetRatioChartPreview from "@/components/SummaryQcdKpi/DeliveryMeetRatioChartPreview";

const baseOption = {
  project: [],
  issuetype: [],
  status: [],
  sprint: [],
  assignee: []
};

export default {
  name: "SummaryQcdKpi",
  components: {
    TablePreview,
    TotalManHourBarChartPreview,
    TotalManHourPieChartPreview,
    QualityCombineBugRaioPreview,
    CostAgainstEstimationPreview,
    DeliveryMeetRatioChartPreview
  },
  data() {
    return {
      loading: false,
      formItemLayout: {
        labelCol: CONST.LABEL_COLUMN_SINGLE,
        wrapperCol: CONST.WRAPPER_COLUMN_SINGLE
      },
      wrapperContainerCol: CONST.WRAPPER_COLUMN_CONTAINER_SINGLE,
      actionCol: CONST.ACTION_COLUMN_SINGLE,
      dateFormat: CONST.DATE_FORMAT,
      filters: {
        project: [],
        issuetype: [],
        status: [],
        sprint: [],
        assignee: []
      },
      duration: {
        startDate: null,
        endDate: null
      },
      chartOptions: {
        width: "500",
        options: {
          chart: {
            id: "vuechart-example",
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
      },
      showDataPreview: false,
      dataTablePreview: [],
      dataChartPreview: [],
      viewChartMode: false
    };
  },
  computed: {
    ...mapState({
      listJiraProject: state => state.modules["jira-project"].listJiraProject,
      aggregateProjectListFromAllURLs: state => state.modules["jira-project"].aggregateProjectListFromAllURLs
    }),
    durationFormat() {
      let duration = [];
      if (this.duration.startDate && this.duration.endDate) {
        duration[0] = this.duration.startDate.format("YYYY-MM-DD");
        duration[1] = this.duration.endDate.format("YYYY-MM-DD");
      } else duration = null;
      return duration;
    }
  },
  watch: {
    listJiraProject() {
      this.getAggregateProjectListFromAllURLs();
    }
  },
  created() {
    if (this.listJiraProject.length) {
      this.getAggregateProjectListFromAllURLs();
    }
  },
  methods: {
    ...mapActions({
      getProjectSummaryData: "modules/summary-qcd-kpi/getProjectSummaryData",
      getProjectSummaryDegration: "modules/summary-qcd-kpi/getProjectSummaryDegration",
      getAggregateProjectListFromAllURLs: "modules/jira-project/getAggregateProjectListFromAllURLs"
    }),
    async handleSearch() {
      this.loading = true;
      let result = [];
      let filters = _.cloneDeep(this.filters);
      let listOptions = this.decodeFilterOption(filters);

      if (!listOptions.length) {
        this.$notification.error({
          message: this.$t("project_required"),
          description: this.$t("project_required_summary_qcd"),
          duration: 2.5
        });
        this.loading = false;
        return;
      }

      this.$notification.info({
        message: this.$t("searching"),
        description: this.$t("searching_summary_qcd_description"),
        duration: 0,
        key: "notification-qcd-summary"
      });

      for (let index = 0; index < listOptions.length; index++) {
        const project = listOptions[index];
        let projectData = await this.getProjectSummaryData(project);
        let degration = await this.getProjectSummaryDegration(project);
        result.push({ project, data: projectData, degration: degration.data });
      }
      let dataExcelFile = this.handleDataExportSummaryKpi(result);
      this.dataTablePreview = dataExcelFile;
      this.dataChartPreview = resortDataExcel(dataExcelFile);

      this.$notification.close("notification-qcd-summary");
      this.loading = false;
      this.showDataPreview = true;
    },
    async handleExportExcel() {
      this.loading = true;
      this.viewChartMode = true;
      await this.$nextTick();

      let workbookSummaryKpi = await this.getWorkBookWithTableSummaryKpi(this.dataTablePreview);

      // Generate Excel File
      workbookSummaryKpi.xlsx.writeBuffer().then(data => {
        const blob = new Blob([data], { type: CONST.EXCEL_TYPE });
        FileSaver.saveAs(
          blob,
          `${this.duration.startDate.format("YYYYMMDD")}_${this.duration.endDate.format(
            "YYYYMMDD"
          )}_QCD_Summary_KPI.xlsx`
        );
      });

      this.loading = false;
    },
    handleDataExportSummaryKpi(listDataProject) {
      return listDataProject.map(project => {
        let { quality, delivery, cost } = project.data;
        let bugRatioByNumber = divide(quality.bugRatioByNumber.count, quality.bugRatioByNumber.total);
        let bugRatioByHour = divide(quality.bugRatioByHour.bugHour, quality.bugRatioByHour.issueHour);
        let costRatio = divide(cost.actualManhour - cost.estimateManhour, cost.estimateManhour);
        let deliveryRatio = divide(delivery.issueBeforeDuedate, delivery.totalIssue);
        let totalManHour = cost.actualManhour;
        let degrateIssues = project.degration.filter(item => item.degrate);
        let degrateByHour = degrateIssues.reduce((sum, issue) => (sum += issue.actualManhour), 0);
        let degrateRatioByNumber = divide(degrateIssues.length, delivery.totalIssue) * 100;
        let degrateRatioByHour = divide(degrateByHour, totalManHour) * 100;

        let clone = {
          name: project.project.name,
          totalIssue: delivery.totalIssue,
          totalManHour: +totalManHour.toFixed(0),
          bugRatioByNumber: +(bugRatioByNumber * 100).toFixed(1),
          bugRatioByHour: +(bugRatioByHour * 100).toFixed(1),
          degrateByNumber: +degrateRatioByNumber.toFixed(1),
          degrateByHour: +degrateRatioByHour.toFixed(1),
          cost: +(costRatio * 100).toFixed(1),
          delivery: +(deliveryRatio * 100).toFixed(1)
        };

        return clone;
      });
    },
    async getWorkBookWithTableSummaryKpi(dataExcelFile) {
      // Create workbook and worksheet
      let workbook = new Excel.Workbook();

      // Set Workbook Properties
      workbook.creator = "Web";
      workbook.lastModifiedBy = "Web";
      workbook.created = new Date();
      workbook.modified = new Date();
      workbook.lastPrinted = new Date();
      let worksheet = workbook.addWorksheet("Sheet 1");

      let columns = [
        { name: "Project", width: 20 },
        { name: "Total Man-hours(H)", width: 20 },
        { name: "Bug Ratio by number(%)", width: 20 },
        { name: "Bug Ratio by hour(%)", width: 20 },
        { name: "Degration Ratio by number(%)", width: 20 },
        { name: "Degration Ratio by hour(%)", width: 20 },
        { name: "Cost against estimation Ratio(%)", width: 20 },
        { name: "Delivery meet Ratio(%)", width: 20 }
      ];

      let rows = resortDataExcel(dataExcelFile);

      worksheet = appendDetailTableWorklogToWorksheet(worksheet, columns, rows, this.durationFormat);
      [workbook, worksheet] = await this.appendBarChartTotalManHour(workbook, worksheet, rows);
      [workbook, worksheet] = await this.appendPieChartTotalManHour(workbook, worksheet, rows);
      [workbook, worksheet] = await this.appendBarChartQualityAndBugRaio(workbook, worksheet, rows);
      [workbook, worksheet] = await this.appendCostAgainstEstimation(workbook, worksheet, rows);
      [workbook, worksheet] = await this.appendDeliveryMeetRatio(workbook, worksheet, rows);

      return workbook;
    },
    setRefreshQCD() {
      this.showDataPreview = false;
    },
    decodeFilterOption(filters) {
      let listOptions = [];
      filters.project.forEach(project => {
        let projectInfo = project.split("~");
        let originProject = this.aggregateProjectListFromAllURLs.find(
          item => item.jiraUrl == projectInfo[0] && item.key == projectInfo[1]
        );

        let projectOptions = {
          name: originProject.name,
          jiraUrl: projectInfo[0],
          duration: this.durationFormat,
          filters: { ...baseOption, project: [projectInfo[1]] }
        };
        listOptions.push(projectOptions);
      });
      return listOptions;
    },
    appendImageToWorkSheet(workbook, worksheet, base64, option) {
      const imageId2 = workbook.addImage({
        base64: base64,
        extension: "png"
      });
      worksheet.addImage(imageId2, option);
      return [workbook, worksheet];
    },
    async appendBarChartTotalManHour(workbook, worksheet, rows) {
      let chart = this.$refs["apexchart-total-manhour-bar-chart"];
      let base64Data = await chart.getBase64ApexChart();
      let dimensions = await this.getImageDimensions(base64Data);
      [workbook, worksheet] = this.appendImageToWorkSheet(workbook, worksheet, base64Data, {
        tl: { col: 0, row: 10 },
        ext: dimensions
      });
      return [workbook, worksheet];
    },
    async appendPieChartTotalManHour(workbook, worksheet, rows) {
      let chart = this.$refs["apexchart-total-manhour-pie-chart"];
      let base64Data = await chart.getBase64ApexChart();
      let dimensions = await this.getImageDimensions(base64Data);

      [workbook, worksheet] = this.appendImageToWorkSheet(workbook, worksheet, base64Data, {
        tl: { col: 4, row: 10 },
        ext: dimensions
      });
      return [workbook, worksheet];
    },
    async appendBarChartQualityAndBugRaio(workbook, worksheet) {
      let chart = this.$refs["apexchart-quality-combine-bug-ratio"];
      let base64Data = await chart.getBase64ApexChart();
      let dimensions = await this.getImageDimensions(base64Data);

      [workbook, worksheet] = this.appendImageToWorkSheet(workbook, worksheet, base64Data, {
        tl: { col: 0, row: 35 },
        ext: dimensions
      });
      return [workbook, worksheet];
    },
    async appendCostAgainstEstimation(workbook, worksheet) {
      let chart = this.$refs["apexchart-cost-against-estimation"];
      let base64Data = await chart.getBase64ApexChart();
      let dimensions = await this.getImageDimensions(base64Data);

      [workbook, worksheet] = this.appendImageToWorkSheet(workbook, worksheet, base64Data, {
        tl: { col: 4, row: 35 },
        ext: dimensions
      });
      return [workbook, worksheet];
    },
    async appendDeliveryMeetRatio(workbook, worksheet) {
      let chart = this.$refs["apexchart-delivery-meet-ratio"];
      let base64Data = await chart.getBase64ApexChart();
      let dimensions = await this.getImageDimensions(base64Data);

      [workbook, worksheet] = this.appendImageToWorkSheet(workbook, worksheet, base64Data, {
        tl: { col: 0, row: 55 },
        ext: dimensions
      });
      return [workbook, worksheet];
    },
    getImageDimensions(srcImage) {
      return new Promise(function(resolved, rejected) {
        var i = new Image();
        i.onload = function() {
          let { width, height } = i;
          resolved({ width, height });
        };
        i.src = srcImage;
      });
    }
  }
};
</script>
