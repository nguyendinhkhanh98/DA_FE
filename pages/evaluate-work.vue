<template>
  <a-card class="shadow">
    <h1>{{ $t("employee_task_history") }}</h1>
    <a-row>
      <a-col v-bind="wrapperContainerCol">
        <a-form v-bind="formItemLayout" @submit.prevent="getWorklogs">
          <!-- Last week -->
          <a-form-item :label="$t('last_month')" :colon="false">
            <a-checkbox v-model="checkedLastWeek" @change="onChangeLastWeek" />
          </a-form-item>
          <!-- Duration -->
          <a-form-item :label="$t('duration')" :colon="false">
            <a-row>
              <a-col class="pr-1" :span="12">
                <a-date-picker
                  class="w-100"
                  v-model="startDate"
                  :disabled="checkedLastWeek"
                  :format="dateFormat"
                  :allowClear="true"
                  @change="hiddenTable"
                />
              </a-col>
              <a-col class="pl-1" :span="12">
                <a-date-picker
                  class="w-100"
                  v-model="endDate"
                  :disabled="checkedLastWeek"
                  :format="dateFormat"
                  :allowClear="true"
                  @change="hiddenTable"
                />
              </a-col>
            </a-row>
          </a-form-item>

          <!-- Project -->
          <!-- <a-form-item :label="$t('project')" :colon="false">
            <a-select mode="multiple" v-model="selectedProjects" @change="hiddenTable">
              <a-select-option
                v-for="project of aggregateProjectListFromAllURLs"
                :key="project.key"
                :value="project.key"
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
          </a-form-item> -->
          <!-- Assignee -->
          <!-- <a-form-item :label="$t('member')" :colon="false">
            <a-select v-model="authors" mode="multiple" @change="hiddenTable">
              <a-select-option v-for="assignee of assigneeList" :key="assignee.accountId" :value="assignee.displayName">
                <img
                  :src="assignee.avatarUrls['16x16']"
                  height="16"
                  width="16"
                  border="0"
                  align="absmiddle"
                  :alt="assignee.displayName"
                />
                {{ assignee.displayName }}
              </a-select-option>
            </a-select>
          </a-form-item> -->
          <!-- Button search -->
          <a-form-item :wrapper-col="actionCol" class="text-center">
            <a-button type="primary" html-type="submit" :loading="loading">
              <i class="fas fa-search mr-1"></i>
              {{ $t("search") }}
            </a-button>
          </a-form-item>
        </a-form>
      </a-col>
    </a-row>

    <a-row type="flex" align="bottom" justify="space-between" v-if="userTaskEvaluate.length && isShowTable">
      <span class="text-bold">{{ $t("total_result") }}: {{ userTaskEvaluate.length }}</span>
      <span style="float: right">
        <a-button class="mb-1" type="primary" ghost @click="handleExportByDate">
          <i class="fas fa-file-excel mr-1 ml-1" style="color: green"></i>
          {{ $t("export_detail_by_date") }}
        </a-button>
        <a-button class="mb-1" type="primary" ghost @click="handleExportByTask">
          <i class="fas fa-file-excel mr-1 ml-1" style="color: green"></i>
          {{ $t("export_detail_by_task") }}
        </a-button>
      </span>
    </a-row>
    <a-table
      bordered
      :columns="columns"
      v-if="userTaskEvaluate.length && isShowTable"
      :dataSource="userTaskEvaluate"
      :rowKey="(record, index) => (pagination.current - 1) * pagination.pageSize + index + 1"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <template v-for="column of columns" :slot="column.slots.title">{{ $t(column.slots.title) }}</template>
      <template slot="no" slot-scope="text, record, index">
        {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
      </template>
      <template slot="fullName" slot-scope="text, record">
        {{ record.fullName }}
      </template>
      <template slot="allTaskOntime" slot-scope="text, record">
        {{ record.allTaskOntime }}
      </template>
      <template slot="allTask" slot-scope="text, record">
        {{ record.allTask }}
      </template>
      <template slot="pointEvaluate" slot-scope="text, record">
        {{ record.averageEvaluateScore }}
      </template>
      <template slot="rankEvaluate" slot-scope="text, record">
        <a-tag
          :color="
            mapColorScoreEvaluateTag(
              record.averageEvaluateScore == 0
                ? 'notEvaluate'
                : record.averageEvaluateScore > 0 && record.averageEvaluateScore <= 5
                ? 'bad'
                : record.averageEvaluateScore > 5 && record.averageEvaluateScore < 8
                ? 'average'
                : record.averageEvaluateScore >= 8 && record.averageEvaluateScore < 9
                ? 'good'
                : 'excellent'
            )
          "
        >
          {{
            record.averageEvaluateScore == 0
              ? "Chưa đánh giá"
              : record.averageEvaluateScore > 0 && record.averageEvaluateScore <= 5
              ? "Bad"
              : record.averageEvaluateScore > 5 && record.averageEvaluateScore < 8
              ? "Medium"
              : record.averageEvaluateScore >= 8 && record.averageEvaluateScore < 9
              ? "Good"
              : "Excellent"
          }}
        </a-tag>
      </template>

      <template slot="expandedRowRender" slot-scope="text">
        <a-table
          class="mt-1 mb-1"
          :columns="userColumns"
          :dataSource="text.worklogs"
          :pagination="false"
          :rowKey="(record, index) => index"
        >
          <template v-for="column of userColumns" :slot="column.slots.title">
            {{ $t(column.slots.title) }}
          </template>
          <template slot="no" slot-scope="text, record, index">
            {{ index + 1 }}
          </template>
          <!-- <template slot="dateRender" slot-scope="text">
            {{ text.substr(11, 5) }}
          </template> -->
          <template slot="projectName" slot-scope="text, record">
            {{ record.projectName }}
          </template>
          <template slot="countTaskOntime" slot-scope="text, record">
            {{ record.countTaskOntime }}
          </template>
          <template slot="totalTask" slot-scope="text, record">
            {{ record.totalTask }}
          </template>
          <template slot="qualityScore" slot-scope="text, record">
            {{ record.qualityScore }}
          </template>
          <template slot="roleName" slot-scope="text, record">
            {{ record.roleName }}
          </template>
        </a-table>
      </template>
    </a-table>
  </a-card>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
import moment from "moment";
import * as CONST from "@/constants/index.js";
import * as Excel from "exceljs/dist/exceljs.min.js";
import * as FileSaver from "file-saver";
import {
  columns,
  userColumns,
  excelColumns,
  excelColumnsByTask,
  mapColorScoreEvaluateTag
} from "./worklog-detail-by-user/const";

const EXCEL_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";

export default {
  data() {
    return {
      columns: columns,
      userColumns,
      excelColumns,
      excelColumnsByTask,
      pagination: {
        pageSize: 15,
        total: 0,
        current: 1,
        showSizeChanger: true,
        pageSizeOptions: ["15", "35", "50"]
      },
      loading: false,
      dateFormat: CONST.DATE_FORMAT,
      formItemLayout: {
        labelCol: CONST.LABEL_COLUMN_SINGLE,
        wrapperCol: CONST.WRAPPER_COLUMN_SINGLE
      },
      authors: [],
      selectedProjects: [],
      checkedLastWeek: true,
      startDate: this.$moment().subtract(1, "months").startOf("month"),
      endDate: this.$moment().subtract(1, "months").endOf("month"),
      wrapperContainerCol: CONST.WRAPPER_COLUMN_CONTAINER_SINGLE,
      actionCol: CONST.ACTION_COLUMN_SINGLE,
      isShowTable: false,
      mapColorScoreEvaluateTag
    };
  },
  computed: {
    ...mapState({
      userWorklogs: state => state.modules["worklog-detail-by-user"].userWorklogs,
      assigneeList: state => state.modules["summary-report-by-issue"].assigneeList,
      uniqueInstances: state => state.modules["worklog-detail-by-user"].uniqueInstances,
      userInfo: state => state.userInfo,
      jiraUrl: state => state.jiraUrl,
      aggregateProjectListFromAllURLs: state => state.modules["jira-project"].aggregateProjectListFromAllURLs,
      userTaskEvaluate: state => state.modules["worklog-summary-by-user"].userTaskEvaluate
    })
  },
  watch: {
    async jiraUrl(newValue, oldValue) {
      if (newValue) {
        this.isShowTable = false;
        this.authors = [];
        this.selectedProjects = [];
        await this.getAggregateProjectListFromAllURLs();
        this.getAllUsersAssignableToProjectsAPI();
      }
    }
  },
  async mounted() {
    if (this.jiraUrl) {
      await this.getAggregateProjectListFromAllURLs();
      this.getAllUsersAssignableToProjectsAPI();
    }
  },
  methods: {
    ...mapMutations({
      setAssigneeList: "modules/summary-report-by-issue/setAssigneeList",
      resetWorklogs: "modules/worklog-detail-by-user/resetWorklogs",
      setUserWorklogs: "modules/worklog-detail-by-user/setUserWorklogs",
      setUserTaskEvaluate: "modules/worklog-summary-by-user/setUserTaskEvaluate"
    }),
    ...mapActions({
      getUserWorklogs: "modules/worklog-detail-by-user/getUserWorklogs",
      getAllUsersAssignableToProjects: "modules/summary-report-by-issue/getAllUsersAssignableToProjects",
      getAggregateProjectListFromAllURLs: "modules/jira-project/getAggregateProjectListFromAllURLs",
      getAllEvaluateTask: "modules/worklog-summary-by-user/getAllEvaluateTask"
    }),
    moment,
    async getAllUsersAssignableToProjectsAPI() {
      let projects = this.aggregateProjectListFromAllURLs;

      let projectsWithURL = projects.map(p => ({ key: p.key, jiraUrl: p.jiraUrl }));
      let uniqueProjectURLs = [...new Set(projectsWithURL.map(project => project.jiraUrl))];

      let aggregateUserIDList = [];
      let res = await Promise.all(
        uniqueProjectURLs.map(url => {
          let projects = projectsWithURL.filter(p => p.jiraUrl == url).map(p => p.key);
          return this.getAllUsersAssignableToProjects({
            project: projects.join(","),
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

      this.setAssigneeList(aggregateUserList);
    },
    async getWorklogs() {
      this.loading = true;
      this.isShowTable = false;
      let payload = {
        filters: {
          project: this.selectedProjects.length ? this.selectedProjects : undefined
        },
        authors: this.authors,
        since: moment(this.startDate).format("YYYY-MM-DD HH:mm:ss"),
        until: moment(this.endDate).format("YYYY-MM-DD HH:mm:ss"),
        jiraUrl: this.jiraUrl
      };

      // let payloads = [];
      // let projectsWithURL =
      //   payload.filters.project
      //     ?.map(p => this.aggregateProjectListFromAllURLs.find(prj => prj.key == p))
      //     ?.map(p => ({ key: p.key, jiraUrl: p.jiraUrl })) ?? [];
      // let uniqueProjectURLs = [...new Set(projectsWithURL.map(project => project.jiraUrl))];

      // if (!uniqueProjectURLs.length)
      //   uniqueProjectURLs = [...new Set(this.aggregateProjectListFromAllURLs.map(project => project.jiraUrl))];

      // uniqueProjectURLs.forEach(url => {
      //   let innerPayload = _.cloneDeep(payload);
      //   if (payload.filters.project !== undefined)
      //     innerPayload.filters.project = projectsWithURL.filter(p => p.jiraUrl == url).map(p => p.key);
      //   innerPayload.jiraUrl = url;
      //   payloads.push(innerPayload);
      // });
      // this.resetWorklogs();
      // for (let index = 0; index < payloads.length; index++) {
      //   await this.getUserWorklogs(payloads[index]);
      // }
      // this.setUserWorklogs();
      // console.log("this.uniqueInstances", this.uniqueInstances);
      await this.getAllEvaluateTask(payload);
      this.setUserTaskEvaluate();
      this.isShowTable = true;
      this.loading = false;
    },
    onChangeLastWeek(e) {
      let { checked } = e.target;
      if (checked) {
        this.startDate = this.$moment().subtract(1, "months").startOf("month");
        this.endDate = this.$moment().subtract(1, "months").endOf("month");
      } else {
        this.startDate = moment().startOf("month");
        this.endDate = moment();
      }
    },
    handleTableChange(pagination) {
      this.pagination = pagination;
    },
    handleExportByTask() {
      const columns = this.excelColumnsByTask.map((item, index) => {
        return {
          name: item.slots ? this.$t(item.slots.title) : item.title,
          width: item.width
        };
      });

      var rows = [];
      let userWorklogsByTask = [];
      let userWorklogs = _.cloneDeep(this.userWorklogs);
      userWorklogs.forEach(item => {
        let indexExistObj = _.findIndex(userWorklogsByTask, obj => {
          return obj.issueKey === item.issueKey && obj.author && obj.author.displayName === item.author.displayName;
        });
        if (indexExistObj > -1) {
          userWorklogsByTask[indexExistObj].timeSpentSeconds += item.timeSpentSeconds;
        } else {
          userWorklogsByTask.push(item);
        }
      });
      userWorklogsByTask.forEach((item, index) => {
        let row = [];
        row.push(index + 1);
        row.push(item.author.displayName);
        row.push({
          hyperlink: `${this.jiraUrl}/browse/${item.issueKey}`,
          text: item.issueKey,
          tooltip: item.issueKey
        });
        row.push(item.summary);
        row.push(Math.round((item.timeSpentSeconds / 3600) * 100) / 100);
        rows.push(row);
      });

      // Create workbook and worksheet
      let workbook = new Excel.Workbook();

      // Set Workbook Properties
      workbook.creator = "Web";
      workbook.lastModifiedBy = "Web";
      workbook.created = new Date();
      workbook.modified = new Date();
      workbook.lastPrinted = new Date();

      // Add a Worksheet
      let worksheet = workbook.addWorksheet("Timesheet Detail");

      worksheet.addTable({
        name: "UsersWorklogsTask",
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
          `${this.startDate.format("YYYYMMDD")}_${this.endDate.format("YYYYMMDD")}_Timesheet_By_User_Task_Detail.xlsx`
        );
      });
    },
    handleExportByDate() {
      const columns = this.excelColumns.map((item, index) => {
        return {
          name: item.slots ? this.$t(item.slots.title) : item.title,
          width: item.width
        };
      });

      var rows = [];
      let userWorklogs = _.cloneDeep(this.userWorklogs);
      userWorklogs.forEach((item, index) => {
        let row = [];
        row.push(index + 1);
        row.push(item.author.displayName);
        row.push(moment(item.created).format("YYYY-MM-DD HH:mm:ss"));
        row.push({
          hyperlink: `${this.jiraUrl}/browse/${item.issueKey}`,
          text: item.issueKey,
          tooltip: item.issueKey
        });
        row.push(item.summary);
        row.push(Math.round((item.timeSpentSeconds / 3600) * 100) / 100);
        rows.push(row);
      });

      // Create workbook and worksheet
      let workbook = new Excel.Workbook();

      // Set Workbook Properties
      workbook.creator = "Web";
      workbook.lastModifiedBy = "Web";
      workbook.created = new Date();
      workbook.modified = new Date();
      workbook.lastPrinted = new Date();

      // Add a Worksheet
      let worksheet = workbook.addWorksheet("Timesheet Detail");

      worksheet.addTable({
        name: "UsersWorklogs",
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
          `${this.startDate.format("YYYYMMDD")}_${this.endDate.format("YYYYMMDD")}_Timesheet_By_User_Date_Detail.xlsx`
        );
      });
    },
    hiddenTable() {
      this.isShowTable = false;
    }
  }
};
</script>
<style scoped>
@import url("./worklog-detail-by-user/style.css");
</style>
