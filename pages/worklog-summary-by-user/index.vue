<template>
  <a-card class="shadow">
    <h1>{{ $t("worklog_summary_by_user") }}</h1>

    <a-row>
      <a-col v-bind="wrapperContainerCol">
        <a-form @submit.prevent="handleSearch">
          <a-form-item :label="$t('project')" :label-col="labelCol" :wrapper-col="wrapperCol" :colon="false">
            <a-select
              v-model="filters.project"
              mode="multiple"
              optionFilterProp="optionFilterProp"
              @focus="onFocusSelect"
            >
              <a-select-option
                v-for="project of aggregateProjectListFromAllURLs"
                :key="project.key"
                :value="project.key"
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

          <a-form-item :label="$t('user')" :label-col="labelCol" :wrapper-col="wrapperCol" :colon="false">
            <a-select v-model="filters.worklogAuthor" mode="multiple" @focus="onFocusSelect">
              <a-select-option v-for="user of userList" :key="user.accountId" :value="user.displayName">
                <img
                  :src="user.avatarUrls['16x16']"
                  height="16"
                  width="16"
                  border="0"
                  align="absmiddle"
                  :alt="user.displayName"
                />
                {{ user.displayName }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item :label="$t('duration')" :label-col="labelCol" :wrapper-col="wrapperCol" :colon="false">
            <a-row>
              <a-col class="pr-1" :span="12">
                <a-date-picker class="w-100" v-model="duration.startDate" :format="dateFormat" :allowClear="true" />
              </a-col>
              <a-col class="pl-1" :span="12">
                <a-date-picker class="w-100" v-model="duration.endDate" :format="dateFormat" :allowClear="true" />
              </a-col>
            </a-row>
          </a-form-item>

          <a-form-item :wrapper-col="actionCol" class="text-center" :colon="false">
            <a-button type="primary" ghost @click="handleExportMonthlyReport" :disabled="!canSearch" :loading="loading">
              <i class="fas fa-file-excel mr-1"></i>
              Export Report
            </a-button>

            <a-button type="primary" class="ml-1" html-type="submit" :disabled="!canSearch" :loading="loading">
              <i class="fas fa-search mr-1"></i>
              {{ $t("search") }}
            </a-button>
          </a-form-item>
        </a-form>
      </a-col>
    </a-row>

    <a-row class="mt-5" v-if="showData">
      <a-row type="flex" align="bottom" justify="space-between" class="mb-1">
        <!-- View table mode -->
        <span v-if="typeViewSelected == typeView.viewTable" class="text-bold"
          >{{ $t("total_result") }}: {{ dataSource.length }}</span
        >
        <span v-else></span>

        <span v-if="showExportButton" id="view-type" class="ml-2">
          <span v-if="typeViewSelected == typeView.viewTable">
            <a-button type="primary" ghost @click="handleToggleShowWeekend">
              <i class="fas fa-retweet mr-1"></i>
              {{ $t(showFullDate ? "hide_weekend" : "show_weekend") }}
            </a-button>

            <a-button v-if="false" type="primary" ghost @click="handleExportMonth">
              <i class="fas fa-file-excel mx-1" style="color: green"></i>
              {{ $t("export_by_month") }}
            </a-button>

            <a-button type="primary" ghost @click="handleExportAllVersion2">
              <i class="fas fa-file-excel mx-1" style="color: green"></i>
              {{ $t("export_all") }}
            </a-button>
          </span>

          {{ $t("view_type") }}
          <a-button
            type="primary"
            :disabled="typeViewSelected == typeView.viewTable"
            @click="typeViewSelected = typeView.viewTable"
          >
            <i class="fas fa-table"></i>
          </a-button>

          <a-button
            type="primary"
            :disabled="typeViewSelected == typeView.viewChart"
            @click="typeViewSelected = typeView.viewChart"
          >
            <i class="fas fa-chart-line"></i>
          </a-button>

          <a-button
            type="primary"
            :disabled="typeViewSelected == typeView.viewCalendarWeek"
            @click="typeViewSelected = typeView.viewCalendarWeek"
          >
            <i class="fas fa-calendar-week"></i>
          </a-button>
        </span>
      </a-row>

      <template v-if="typeViewSelected == typeView.viewTable">
        <WorklogSummaryByUserTable
          ref="tableWorklog"
          :columns="tableColumns"
          :dataSource="dataSource"
          :loading="loading"
          @setValueShowWeekend="e => (showFullDate = e)"
        />
      </template>

      <template v-if="typeViewSelected == typeView.viewChart">
        <a-spin :spinning="loading" class="w-100">
          <WorklogSummaryByUserChart :dataSource="dataSource" :columns="columns" />
        </a-spin>
      </template>

      <template v-if="typeViewSelected == typeView.viewCalendarWeek">
        <a-spin :spinning="loading">
          <WorklogSummaryByUserCalendarWeek
            @change-duration="handleChangeTimeDurationByCalendar"
            @export-all="handleExportAllVersion2"
          />
        </a-spin>
      </template>
    </a-row>
  </a-card>
</template>

<script>
import * as CONST from "@/constants/index.js";
import WorklogSummaryByUserTable from "@/components/WorklogSummaryByUser/WorklogSummaryByUserTable";
import WorklogSummaryByUserChart from "@/components/WorklogSummaryByUser/WorklogSummaryByUserChart";
import WorklogSummaryByUserCalendarWeek from "@/components/WorklogSummaryByUser/WorklogSummaryByUserCalendarWeek";
import { mapState, mapMutations, mapActions } from "vuex";
import {
  columns,
  typeView,
  handleDataForExportAllVersion2,
  appendDetailTableWorklogToWorksheet,
  handleDataSumarryForExportAllVersion2,
  appendSumarryTableWorklogToWorksheet,
  getListDateInDuration,
  getListColumn,
  getDataTable
} from "./const";
import * as Excel from "exceljs/dist/exceljs.min.js";
import * as FileSaver from "file-saver";

const EXCEL_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";

export default {
  components: { WorklogSummaryByUserChart, WorklogSummaryByUserTable, WorklogSummaryByUserCalendarWeek },
  data() {
    return {
      typeView,
      typeViewSelected: typeView.viewCalendarWeek,
      columns: [],
      filters: {
        project: [],
        worklogAuthor: []
      },
      dateFormat: CONST.DATE_FORMAT,
      dataSrc: null,
      loading: false,
      showData: false,
      showExportButton: false,
      labelCol: CONST.LABEL_COLUMN_SINGLE,
      wrapperCol: CONST.WRAPPER_COLUMN_SINGLE,
      wrapperContainerCol: CONST.WRAPPER_COLUMN_CONTAINER_SINGLE,
      actionCol: CONST.ACTION_COLUMN_SINGLE,
      canSearch: true,
      showFullDate: true
    };
  },
  computed: {
    ...mapState({
      allProject: state => state.modules["worklog-summary-by-user"].allProject,
      userList: state => state.modules["worklog-summary-by-user"].userList,
      dataSource: state => state.modules["worklog-summary-by-user"].dataSource,
      duration: state => state.modules["worklog-summary-by-user"].duration,
      jiraUrl: state => state.jiraUrl,
      aggregateProjectListFromAllURLs: state => state.modules["jira-project"].aggregateProjectListFromAllURLs
    }),
    projectInForm() {
      return this.filters.project;
    },
    worklogAuthorInForm() {
      return this.filters.worklogAuthor;
    },
    tableColumns() {
      return this.columns.filter(col => !col.canModify || col.isHiden == this.showFullDate);
    }
  },
  watch: {
    jiraUrl(newValue, oldValue) {
      if (newValue && oldValue) {
        this.filters.project = [];
        this.filters.worklogAuthor = [];
        this.showData = false;
        this.setDataSource([]);
      }
      this.getProjectListAPI();
    },
    projectInForm(newVal) {
      let normalizeObject = JSON.parse(JSON.stringify(newVal));
      this.setProjectToLocal(normalizeObject);
    },
    worklogAuthorInForm(newVal) {
      let normalizeObject = JSON.parse(JSON.stringify(newVal));
      this.setWorklogAuthorToLocal(normalizeObject);
    }
  },
  created() {
    this.filters.project = this.getProjectInLocal();
    this.filters.worklogAuthor = this.getWorklogAuthorInLocal();
  },
  mounted() {
    if (this.jiraUrl) this.getProjectListAPI();
  },
  methods: {
    ...mapMutations({
      setDataSource: "modules/worklog-summary-by-user/setDataSource",
      setUserList: "modules/worklog-summary-by-user/setUserList"
    }),
    ...mapActions({
      getProjectList: "modules/worklog-summary-by-user/getProjectList",
      getAllUsersToProject: "modules/worklog-summary-by-user/getAllUsersToProject",
      getWorklog: "modules/worklog-summary-by-user/getWorklog",
      getAllProjectArrow: "modules/worklog-summary-by-user/getAllProjectArrow",
      getAggregateProjectListFromAllURLs: "modules/jira-project/getAggregateProjectListFromAllURLs",
      exportMonthlyReport: "modules/worklog-summary-by-user/exportMonthlyReport"
    }),
    handleSearch() {
      this.getWorklogAPI();
    },
    handleChangeTimeDurationByCalendar() {
      this.getWorklogAPI();
    },
    handleData(dataSrc) {
      let listDate = getListDateInDuration(
        this.dateFormat,
        this.duration.startDate.clone(),
        this.duration.endDate.clone()
      );
      let dayColumns = getListColumn(columns, listDate);
      this.setDataSource([]);

      let dataTable = getDataTable(dayColumns, dataSrc, listDate);

      this.setDataSource(dataTable);
      this.columns = dayColumns;
    },
    handleExportAll() {
      if (this.dataSource.length == 0) {
        this.$notification.error({
          message: "Data empty",
          description: "Sorry, no data to export",
          duration: 2.5
        });
        return;
      }
      // Create workbook and worksheet
      let workbook = new Excel.Workbook();

      // Set Workbook Properties
      workbook.creator = "Web";
      workbook.lastModifiedBy = "Web";
      workbook.created = new Date();
      workbook.modified = new Date();
      workbook.lastPrinted = new Date();

      var columns = [
        { name: this.$t("no_"), width: 5 },
        { name: this.$t("user"), width: 20 },
        { name: this.$t("project"), width: 20 }
      ];
      for (let i = 3; i < this.columns.length; i++) {
        let date = this.columns[i].title;
        columns.push({ name: date, width: 11 });
      }
      columns.push({ name: "Total", width: 11 });
      var rows = [];
      this.dataSource.forEach((item, index) => {
        let row = [];
        row.push(index + 1);
        row.push(item.worklogAuthor);
        row.push(item.project);
        let total = 0;
        for (let i = 3; i < columns.length; i++) {
          if (i === columns.length - 1) {
            row.push(Math.round((total / 3600) * 100) / 100);
          } else {
            let itemValue = item[columns[i].name];
            if (itemValue && itemValue.value) {
              let timeSpentSeconds = itemValue.value;
              row.push(Math.round((timeSpentSeconds / 3600) * 100) / 100);
              total += timeSpentSeconds;
            } else {
              row.push("");
            }
          }
        }
        rows.push(row);
      });
      let lastRow = ["", "Total", ""];
      let totalSum = 0;
      for (let i = 3; i < rows[0].length - 1; i++) {
        let totalDay = 0;
        for (const row of rows) {
          if (row[i]) {
            totalDay += row[i];
          }
        }
        lastRow.push(totalDay);
        totalSum += totalDay;
      }
      lastRow.push(totalSum);
      rows.push(lastRow);

      let worksheet = workbook.addWorksheet("Sheet 1");
      worksheet.addTable({
        name: "AllWorklogs",
        ref: "A1",
        headerRow: true,
        columns: columns,
        rows: rows
      });

      columns.forEach((column, index) => {
        // column width
        worksheet.getColumn(index + 1).width = column.width;
      });

      // Generate Excel File
      workbook.xlsx.writeBuffer().then(data => {
        const blob = new Blob([data], { type: EXCEL_TYPE });
        FileSaver.saveAs(
          blob,
          `${this.duration.startDate.format("YYYYMMDD")}_${this.duration.endDate.format(
            "YYYYMMDD"
          )}_Timesheet_By_User.xlsx`
        );
      });
    },
    handleExportAllVersion2() {
      if (this.dataSource.length == 0) {
        this.$notification.error({
          message: "Data empty",
          description: "Sorry, no data to export",
          duration: 2.5
        });
        return;
      }
      // Create workbook and worksheet
      let workbook = new Excel.Workbook();

      // Set Workbook Properties
      workbook.creator = "Web";
      workbook.lastModifiedBy = "Web";
      workbook.created = new Date();
      workbook.modified = new Date();
      workbook.lastPrinted = new Date();
      let worksheet = workbook.addWorksheet("Sheet 1");

      let { columns, rows } = handleDataForExportAllVersion2(
        this,
        _.cloneDeep(this.columns),
        _.cloneDeep(this.dataSource)
      );
      worksheet = appendDetailTableWorklogToWorksheet(worksheet, columns, rows);

      let { sumarryColumns, sumarryRows, sumarryDuration } = handleDataSumarryForExportAllVersion2(columns, rows);
      worksheet = appendSumarryTableWorklogToWorksheet(
        worksheet,
        sumarryColumns,
        sumarryRows,
        sumarryDuration,
        rows.length + 10
      );

      // Generate Excel File
      workbook.xlsx.writeBuffer().then(data => {
        const blob = new Blob([data], { type: EXCEL_TYPE });
        FileSaver.saveAs(
          blob,
          `${this.duration.startDate.format("YYYYMMDD")}_${this.duration.endDate.format(
            "YYYYMMDD"
          )}_Timesheet_By_User.xlsx`
        );
      });
    },
    handleExportMonth() {
      // Create workbook and worksheet
      let workbook = new Excel.Workbook();

      // Set Workbook Properties
      workbook.creator = "Web";
      workbook.lastModifiedBy = "Web";
      workbook.created = new Date();
      workbook.modified = new Date();
      workbook.lastPrinted = new Date();

      var columnsAllSheet = [];
      for (let i = 3; i < this.columns.length; i++) {
        let date = this.columns[i].title;
        if (columnsAllSheet.length) {
          if (columnsAllSheet[columnsAllSheet.length - 1][2].name.substring(0, 8) === date.substring(0, 8)) {
            columnsAllSheet[columnsAllSheet.length - 1].push({
              name: date,
              width: 11
            });
          } else {
            let column = [
              {
                name: this.$t("no_"),
                width: 5
              },
              {
                name: this.$t("user"),
                width: 20
              },
              {
                name: this.$t("project"),
                width: 20
              }
            ];
            column.push({
              name: date,
              width: 11
            });
            columnsAllSheet.push(column);
          }
        } else {
          let column = [
            {
              name: this.$t("no_"),
              width: 5
            },
            {
              name: this.$t("user"),
              width: 20
            },
            {
              name: this.$t("project"),
              width: 20
            }
          ];
          column.push({
            name: date,
            width: 11
          });
          columnsAllSheet.push(column);
        }
      }
      for (const columns of columnsAllSheet) {
        columns.push({
          name: "Total",
          width: 11
        });
        var rows = [];
        this.dataSource.forEach((item, index) => {
          let row = [];
          row.push(index + 1);
          row.push(item.worklogAuthor);
          row.push(item.project);
          let total = 0;
          for (let i = 3; i < columns.length; i++) {
            if (i === columns.length - 1) {
              row.push(Math.round((total / 3600) * 100) / 100);
            } else {
              if (item[columns[i].name]) {
                const timeSpentSeconds = item[columns[i].name];
                row.push(Math.round((timeSpentSeconds / 3600) * 100) / 100);
                total += timeSpentSeconds;
              } else {
                row.push("");
              }
            }
          }
          rows.push(row);
        });

        // Add a Worksheet
        let worksheet = workbook.addWorksheet(columns[2].name.substring(0, 7).replace(/\//g, "-"));

        worksheet.getRow(1).values = columns.map(item => item.name);
        for (let i = 0; i < rows.length; i++) {
          worksheet.getRow(i + 2).values = rows[i];
        }

        worksheet.eachRow({ includeEmpty: false }, function (row, rowNumber) {
          if (rowNumber == 1) {
            row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFFF00" }
              };
            });
          }
        });

        columns.forEach((column, index) => {
          // column width
          worksheet.getColumn(index + 1).width = column.width;
        });
        var borderStyles = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" }
        };
        worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
          row.eachCell({ includeEmpty: true }, function (cell, colNumber) {
            cell.border = borderStyles;
          });
        });
      }

      // Generate Excel File
      workbook.xlsx.writeBuffer().then(data => {
        const blob = new Blob([data], { type: EXCEL_TYPE });
        FileSaver.saveAs(
          blob,
          `${this.duration.startDate.format("YYYYMMDD")}_${this.duration.endDate.format(
            "YYYYMMDD"
          )}_Timesheet_user_by_month.xlsx`
        );
      });
    },

    // handle API
    async getProjectListAPI() {
      this.canSearch = false;

      await this.getAggregateProjectListFromAllURLs();
      await this.getAllUsersToProjectAPI();

      this.canSearch = true;
    },
    async getAllUsersToProjectAPI() {
      let projects = this.aggregateProjectListFromAllURLs;

      let projectsWithURL = projects.map(p => ({ key: p.key, jiraUrl: p.jiraUrl }));
      let uniqueProjectURLs = [...new Set(projectsWithURL.map(project => project.jiraUrl))];

      let aggregateUserIDList = [];
      let res = await Promise.all(
        uniqueProjectURLs.map(url => {
          let projects = projectsWithURL.filter(p => p.jiraUrl == url).map(p => p.key);
          return this.getAllUsersToProject({
            projects,
            jiraUrl: url
          });
        })
      );
      let allUsers = [];
      res.forEach(r => {
        allUsers = allUsers.concat(r.data);
      });
      aggregateUserIDList = [...new Set(allUsers.map(acc => acc.accountId))];
      let aggregateUserList = aggregateUserIDList.map(uid => {
        let urls = allUsers.filter(u => u.accountId == uid).map(u => u.self.substr(0, u.self.indexOf(".net") + 4));
        let user = allUsers.find(u => u.accountId == uid);
        user.urls = urls;
        return user;
      });

      this.setUserList(aggregateUserList);
      return aggregateUserList;
    },
    async getWorklogAPI() {
      this.showExportButton = false;
      this.loading = true;
      this.showData = false;

      let payload = _.cloneDeep({ ...this.filters, ...this.duration });
      payload.project = payload.project.length
        ? payload.project
        : this.aggregateProjectListFromAllURLs.map(item => item.key);

      payload.worklogAuthor = payload.worklogAuthor.length
        ? payload.worklogAuthor
        : this.userList.map(item => item.displayName);
      let duration = [];
      duration[0] = payload.startDate?.format("YYYY-MM-DD");
      duration[1] = payload.endDate?.format("YYYY-MM-DD");
      if (!duration[0] || !duration[1]) {
        this.$notification.error({
          message: "Duration invalid",
          description: "Please select bold Start date and End date",
          duration: 2.5
        });
        this.loading = false;
        return;
      }

      let payloads = [];
      let projectsWithURL = payload.project
        .map(p => this.aggregateProjectListFromAllURLs.find(prj => prj.key == p))
        .map(p => ({ key: p.key, jiraUrl: p.jiraUrl }));
      let uniqueProjectURLs = [...new Set(projectsWithURL.map(project => project.jiraUrl))];

      uniqueProjectURLs.forEach(url => {
        let innerPayload = _.cloneDeep(payload);
        innerPayload.project = projectsWithURL.filter(p => p.jiraUrl == url).map(p => p.key);
        innerPayload.jiraUrl = url;
        payloads.push(innerPayload);
      });

      this.dataSource.issues = [];
      for (let index = 0; index < payloads.length; index++) {
        const data = await this.getWorklog({ filters: payloads[index], jiraUrl: payloads[index].jiraUrl, duration });
        this.dataSource.issues = this.dataSource.issues.concat(data.issues);
      }
      this.handleData(this.dataSource);
      this.loading = false;
      this.showExportButton = true;
      this.showData = true;
    },
    async onFocusSelect(e) {
      let listProjectIsEmpty =
        !this.aggregateProjectListFromAllURLs ||
        (this.aggregateProjectListFromAllURLs && !this.aggregateProjectListFromAllURLs.length);
      let listUserIsEmpty = !this.userList || (this.userList && !this.userList.length);
      if (listProjectIsEmpty || listUserIsEmpty) {
        //Call again project list
        console.log("Sorry, data source for select is empty, calling!");
        this.getProjectListAPI();
      }
    },
    getProjectInLocal() {
      let rawLocalData = localStorage.getItem(CONST.KEY_LOCAL_PROJECT_IN_WORKLOG_SUMMARY_BY_USER);

      try {
        let option = JSON.parse(rawLocalData);
        if (this.jiraUrl && option.jiraUrl.localeCompare(this.jiraUrl) != 0) return [];

        let data = option.project;
        return Array.isArray(data) ? data : [];
      } catch (e) {
        console.log(e);
        return [];
      }
    },
    getWorklogAuthorInLocal() {
      let rawLocalData = localStorage.getItem(CONST.KEY_LOCAL_WORKLOG_AUTHOR_IN_WORKLOG_SUMMARY_BY_USER);

      try {
        let option = JSON.parse(rawLocalData);
        if (this.jiraUrl && option.jiraUrl.localeCompare(this.jiraUrl) != 0) return [];

        let data = option.worklogAuthor;
        return Array.isArray(data) ? data : [];
      } catch (e) {
        console.log(e);
        return [];
      }
    },
    setProjectToLocal(value) {
      let option = {
        jiraUrl: this.jiraUrl,
        project: value
      };
      localStorage.setItem(CONST.KEY_LOCAL_PROJECT_IN_WORKLOG_SUMMARY_BY_USER, JSON.stringify(option));
    },
    setWorklogAuthorToLocal(value) {
      let option = {
        jiraUrl: this.jiraUrl,
        worklogAuthor: value
      };
      localStorage.setItem(CONST.KEY_LOCAL_WORKLOG_AUTHOR_IN_WORKLOG_SUMMARY_BY_USER, JSON.stringify(option));
    },
    handleToggleShowWeekend() {
      this.showFullDate = !this.showFullDate;
      this.$refs.tableWorklog.removeTdPadding();
    },
    handleExportMonthlyReport() {
      this.loading = true;
      let payload = _.cloneDeep({ ...this.filters, ...this.duration });
      let duration = [];
      duration[0] = payload.startDate?.format("YYYY/MM/DD");
      duration[1] = payload.endDate?.format("YYYY/MM/DD");
      if (!duration[0] || !duration[1]) {
        this.$notification.error({
          message: "Duration invalid",
          description: "Please select bold Start date and End date",
          duration: 2.5
        });
        this.loading = false;
        return;
      }

      let projects = payload.project.length
        ? payload.project
        : this.aggregateProjectListFromAllURLs.map(item => item.key);

      payload.worklogAuthor = payload.worklogAuthor.length
        ? payload.worklogAuthor
        : this.userList.map(item => item.displayName);

      payload.workspaces = [];
      let projectsWithURL = projects
        .map(p => this.aggregateProjectListFromAllURLs.find(prj => prj.key == p))
        .map(p => ({ key: p.key, jiraUrl: p.jiraUrl }));
      let uniqueProjectURLs = [...new Set(projectsWithURL.map(project => project.jiraUrl))];

      uniqueProjectURLs.forEach(url => {
        let prjs = projectsWithURL.filter(p => p.jiraUrl == url).map(p => p.key);
        let jiraUrl = url;
        payload.workspaces.push({ projects: prjs, jiraUrl: jiraUrl });
      });
      delete payload.project;
      delete payload.startDate;
      delete payload.endDate;
      payload.duration = duration;

      this.exportMonthlyReport(payload)
        .then(response => {
          const fileName = response.headers["content-disposition"].split("=")[1];
          const url = URL.createObjectURL(
            new Blob([response.data], {
              type: "application/vnd.ms-excel"
            })
          );
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", fileName);
          document.body.appendChild(link);
          link.click();
          this.loading = false;
        })
        .catch(error => {
          console.log(error);
          this.loading = false;
        });
    }
  }
};
</script>

<style>
@import url("./style.css");
</style>
