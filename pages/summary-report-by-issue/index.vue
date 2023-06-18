<template>
  <a-card class="shadow">
    <!-- Form layout -->
    <h1>{{ $t("summary_report_by_issue") }}</h1>
    <a-row class="mb-5">
      <a-col v-bind="wrapperContainerCol">
        <a-form v-bind="formItemLayout" @submit.prevent="handleSearch">
          <a-row>
            <a-col :xs="24" :sm="12">
              <a-form-item :label="'Jira Workspace'" :colon="false">
                <SelectProject />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="12">
              <a-form-item :label="$t('sprint')" :colon="false">
                <a-select v-model="filters.sprint" mode="multiple" @change="setRefreshQCD(true)">
                  <a-select-option v-for="sprint of sprintList" :key="sprint.id" :value="sprint.name">{{
                    sprint.name
                  }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :xs="24" :sm="12">
              <a-form-item :label="$t('project')" :colon="false">
                <a-select
                  v-model="filters.project"
                  mode="multiple"
                  optionFilterProp="optionFilterProp"
                  @change="onSelectProjectChange"
                >
                  <a-select-option
                    v-for="project of allProject"
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
            </a-col>
            <a-col :xs="24" :sm="12">
              <a-form-item :label="$t('type')" :colon="false">
                <a-select v-model="filters.issuetype" mode="multiple" @change="setRefreshQCD(true)">
                  <a-select-option v-for="type of issueTypeList" :key="type.id" :value="type.name">
                    <img
                      :src="type.iconUrl"
                      height="16"
                      width="16"
                      border="0"
                      align="absmiddle"
                      :alt="type.name"
                      :title="type.name + ' - ' + type.description"
                    />
                    {{ type.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :xs="24" :sm="12">
              <a-form-item :label="$t('progress')" :colon="false">
                <a-select v-model="progress" @change="setRefreshQCD(true)">
                  <a-select-option value>{{ $t("all") }}</a-select-option>
                  <a-select-option value="ahead_of_schedule">{{ $t("ahead_of_schedule") }}</a-select-option>
                  <a-select-option value="behind_schedule">{{ $t("behind_schedule") }}</a-select-option>
                  <a-select-option value="on_schedule">{{ $t("on_schedule") }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="12">
              <a-form-item :label="$t('assignee')" :colon="false">
                <a-select v-model="filters.assignee" mode="multiple" @change="setRefreshQCD(true)">
                  <a-select-option
                    v-for="assignee of assigneeList"
                    :key="assignee.accountId"
                    :value="assignee.displayName"
                  >
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
              </a-form-item>
            </a-col>
          </a-row>

          <a-row>
            <!-- Duration -->
            <a-col :xs="24" :sm="12">
              <a-row>
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
                </a-form-item>
              </a-row>
              <a-row>
                <a-col v-bind="actionCol">
                  <span style="color: #a2a2a2">Filter all issues which logged time within this duration</span>
                </a-col>
              </a-row>
            </a-col>
            <a-col :xs="24" :sm="12">
              <a-form-item :label="$t('status')" :colon="false">
                <a-select v-model="filters.status" mode="multiple" @change="setRefreshQCD(true)">
                  <a-select-option v-for="status of statusList" :key="status.id" :value="status.name">
                    {{ status.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row class="mt-3">
            <a-col :xs="{ span: 24 }" :sm="{ span: 24, offset: 1 }" style="text-align: center">
              <a-button
                v-if="!viewChart"
                class="mb-1"
                type="primary"
                ghost
                :loading="loadingExportOriginData"
                @click="handleExportOriginData"
              >
                <i class="fas fa-file-excel mr-1 ml-1" style="color: green"></i>
                {{ $t("export_jira_origin_data") }}
              </a-button>
              <a-button
                v-if="!viewChart"
                class="mb-1"
                type="primary"
                ghost
                :loading="loadingExport"
                @click="handleExport"
              >
                <i class="fas fa-file-excel mr-1 ml-1" style="color: green"></i>
                {{ $t("export_qcd_summary") }}
              </a-button>
              <a-button type="primary" html-type="submit" class="mb-1" :loading="loading">
                <i class="fas fa-search mr-1"></i>
                {{ $t("search") }}
              </a-button>
            </a-col>
          </a-row>
        </a-form>
      </a-col>
    </a-row>
    <!-- Table result -->
    <a-row v-if="issueList && issueList.length > 0" type="flex" align="bottom" justify="space-between">
      <span v-if="!viewChart" class="text-bold">{{ $t("total_result") }}: {{ pagination.total }}</span>
      <span v-else></span>
      <span style="float: right">
        <ToggleColumn v-if="!viewChart" :columns="columns" @change="onChangeToggleColumn" />
        <span id="view-type" class="ml-2">
          {{ $t("view_type") }}
          <a-button class="mb-1" type="primary" :disabled="!viewChart" @click="viewChart = false">
            <i class="fas fa-table"></i>
          </a-button>
          <a-button class="mb-1" type="primary" :disabled="viewChart" @click="viewChart = true">
            <i class="fas fa-chart-line"></i>
          </a-button>
        </span>
      </span>
    </a-row>
    <span v-if="!viewChart">
      <a-table
        id="sars-issue-table"
        bordered
        :columns="currentColumns"
        :dataSource="issueList"
        :rowClassName="getRowClassName"
        :loading="loading"
        :rowKey="record => record.key"
        :pagination="pagination"
        :scroll="{ x: true }"
        @change="handleTableChange"
        v-if="issueList && issueList.length > 0"
      >
        <template slot="footer">
          <a-row>
            <span class="issue-warning-note"></span>&nbsp;:
            <small>{{ $t("issue_warning") }}</small>
            <span class="text-danger ml-3">{{ $t("red_text") }}</span
            >:
            <small>{{ $t("issue_danger") }}</small>
          </a-row>
        </template>

        <template v-for="column of currentColumns.filter(col => !col.customTitle)" :slot="column.slots.title">
          {{ $t(column.slots.title) }}
        </template>

        <template slot="no" slot-scope="text, record, index">
          {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
        </template>
        <template slot="type" slot-scope="text">
          <img
            :src="text.iconUrl"
            height="16"
            width="16"
            border="0"
            align="absmiddle"
            :alt="text.name"
            :title="text.name + ' - ' + text.description"
          />
        </template>
        <template slot="issueName" slot-scope="text">
          <a-tooltip
            placement="bottomLeft"
            :overlayStyle="{ 'max-width': 'fit-content' }"
            :title="text"
            :getPopupContainer="a => a.parentNode"
            >{{ text }}</a-tooltip
          >
        </template>
        <template slot="assignee" slot-scope="text" v-if="text">
          <img
            :src="text.avatarUrls['16x16']"
            height="16"
            width="16"
            border="0"
            align="absmiddle"
            :alt="text.displayName"
          />
          {{ text.displayName }}
        </template>
        <template slot="status" slot-scope="text">
          <span :class="text.statusCategory.colorName">{{ text.name.toString().toUpperCase() }}</span>
        </template>
        <template slot="progress" slot-scope="text">{{ $t(text) }}</template>
        <template slot="key" slot-scope="text">
          <a :href="`${userInfo.jiraUrl}/browse/${text}`" target="_blank">{{ text }}</a>
        </template>
      </a-table>
    </span>
    <span v-else>
      <a-spin :spinning="loadingChart">
        <a-row>
          <a-col :xs="24" :sm="12">
            <IssueReportTypeChart :dataSource="issueChartList" />
          </a-col>
          <a-col :xs="24" :sm="12">
            <IssueReportBugRatioChart :dataSource="issueChartList" />
          </a-col>
        </a-row>
      </a-spin>
    </span>
  </a-card>
</template>

<script>
import * as CONST from "@/constants/index.js";
import IssueReportTypeChart from "@/components/IssueReport/IssueReportTypeChart";
import IssueReportBugRatioChart from "@/components/IssueReport/IssueReportBugRatioChart";
import { mapState, mapMutations, mapActions } from "vuex";
import { columns } from "./const";
import ToggleColumn from "@/components/Common/ToggleColumn";
import SelectProject from "@/components/Common/SelectProject";

export default {
  components: { ToggleColumn, IssueReportTypeChart, IssueReportBugRatioChart, SelectProject },
  data() {
    return {
      columns,
      currentColumns: columns.filter(item => item.defaultChecked),
      loading: false,
      loadingExport: false,
      loadingExportOriginData: false,
      loadingChart: false,
      viewChart: false,
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
      // Nếu progress === "": get issue phân trang, nếu không thì get hết
      progress: "",
      pagination: {
        pageSize: 20,
        total: 0,
        current: 1
      },
      dateFormat: CONST.DATE_FORMAT,
      formItemLayout: {
        labelCol: CONST.LABEL_COLUMN_DOUBLE,
        wrapperCol: CONST.WRAPPER_COLUMN_DOUBLE
      },
      wrapperContainerCol: CONST.WRAPPER_COLUMN_CONTAINER_DOUBLE,
      actionCol: CONST.ACTION_COLUMN_DOUBLE
    };
  },
  computed: {
    ...mapState({
      issueList: state => state.modules["summary-report-by-issue"].issueList,
      allProject: state => state.modules["summary-report-by-issue"].allProject,
      statusList: state => state.modules["summary-report-by-issue"].statusList,
      assigneeList: state => state.modules["summary-report-by-issue"].assigneeList,
      issueTypeList: state => state.modules["summary-report-by-issue"].issueTypeList,
      sprintList: state => state.modules["summary-report-by-issue"].sprintList,
      issueChartList: state => state.modules["summary-report-by-issue"].issueChartList,
      userInfo: state => state.userInfo,
      jiraUrl: state => state.jiraUrl
    }),
    qcdForm() {
      let project = [];
      if (this.filters.project.length) {
        project = this.filters.project.map(item => {
          let found = _.find(this.allProject, p => p.key == item);
          return {
            name: found.name,
            key: found.key,
            avatar: found.avatarUrls["16x16"]
          };
        });
      } else
        project = this.allProject.map(item => ({ name: item.name, key: item.key, avatar: item.avatarUrls["16x16"] }));

      return {
        project,
        duration: this.durationFormat
      };
    },
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
    jiraUrl(newValue) {
      if (newValue) {
        this.getProjectListAPI();
        this.handleReset();
      }
    }
  },
  mounted() {
    if (this.jiraUrl) {
      this.getProjectListAPI();
      this.handleReset();
    }
  },
  methods: {
    ...mapMutations({
      setIssueList: "modules/summary-report-by-issue/setIssueList",
      setRefreshQCD: "modules/summary-report-by-issue/setRefreshQCD"
    }),
    ...mapActions({
      getIssueList: "modules/summary-report-by-issue/getIssueList",
      getCountIssueList: "modules/summary-report-by-issue/getCountIssueList",
      exportJiraQcdReport: "modules/summary-report-by-issue/exportJiraQcdReport",
      exportOriginData: "modules/summary-report-by-issue/exportOriginData",
      getAllIssueTypesToProjects: "modules/summary-report-by-issue/getAllIssueTypesToProjects",
      getProjectList: "modules/summary-report-by-issue/getProjectList",
      getStatusForProjectList: "modules/summary-report-by-issue/getStatusForProjectList",
      getAllSprintToProjects: "modules/summary-report-by-issue/getAllSprintToProjects",
      getIssueChartList: "modules/summary-report-by-issue/getIssueChartList",
      getAllUsersAssignableToProjects: "modules/summary-report-by-issue/getAllUsersAssignableToProjects",
      getQCD_KPI: "modules/summary-report-by-issue/getQCD_KPI",
      resetData: "modules/summary-report-by-issue/resetData"
    }),
    onSelectProjectChange(value) {
      this.setRefreshQCD(true);
      let projects = value.length ? value : this.allProject.map(item => item.key);

      this.getStatusForProjectListAPI(projects.join(","));
      this.getAllUsersAssignableToProjectsAPI(projects.join(","));
      this.getAllIssueTypesToProjectsAPI(projects.join(","));
      this.getAllSprintToProjectsAPI(projects.join(","));
    },
    handleSearch() {
      this.setRefreshQCD(true);
      this.getIssueListAPI();
      this.getCountIssueListAPI();
      this.getIssueChartListAPI();
    },
    handleReset() {
      this.setRefreshQCD(true);
      this.resetData();
      this.filters.project = [];
      this.filters.issuetype = [];
      this.filters.status = [];
      this.filters.sprint = [];
      this.filters.assignee = [];
    },
    onChangeToggleColumn(cols) {
      this.currentColumns = cols;
    },
    getRowClassName(record, index) {
      var className = [];
      if (record.progress === "behind_schedule") {
        if (record.status.name != "Resolved") className.push("text-danger");
      }
      if (record.answerDueDate && this.$moment(new Date(record.answerDueDate)).isSame(this.$moment(), "day")) {
        className.push("issue-warning");
      }
      return className.join(" ");
    },
    handleTableChange(pagination, filters, sorter) {
      this.pagination.current = pagination.current;
      if (!this.progress) {
        this.getIssueListAPI();
        this.getCountIssueListAPI();
      }
    },
    handleExportOriginData() {
      this.loadingExportOriginData = true;
      let filters = _.cloneDeep(this.filters);
      filters.project = filters.project?.length ? filters.project : this.allProject.map(item => item.key);

      this.exportOriginData({ filters, duration: this.durationFormat, jiraUrl: this.jiraUrl })
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
          this.loadingExportOriginData = false;
        })
        .catch(error => {
          console.log(error);
          this.loadingExportOriginData = false;
        });
    },
    handleExport() {
      this.loadingExport = true;
      let filters = _.cloneDeep(this.filters);
      filters.project = filters.project?.length ? filters.project : this.allProject.map(item => item.key);

      this.exportJiraQcdReport({
        filters,
        duration: this.durationFormat,
        progress: this.progress,
        jiraUrl: this.jiraUrl
      })
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
          this.loadingExport = false;
        })
        .catch(error => {
          console.log(error);
          this.loadingExport = false;
        });
    },

    // handle API
    async getProjectListAPI() {
      const { data } = await this.getProjectList({ jiraUrl: this.jiraUrl });
      let listProject = data.map(item => item.key);
      this.getStatusForProjectListAPI(listProject.join(","));
      this.getAllUsersAssignableToProjectsAPI(listProject.join(","));
      this.getAllIssueTypesToProjectsAPI(listProject.join(","));
      this.getAllSprintToProjectsAPI(listProject.join(","));
    },
    async getAllSprintToProjectsAPI(project) {
      await this.getAllSprintToProjects({
        project,
        jiraUrl: this.jiraUrl
      });
      this.filters.sprint = [];
    },
    async getAllIssueTypesToProjectsAPI(project) {
      await this.getAllIssueTypesToProjects({
        project,
        jiraUrl: this.jiraUrl
      });
      this.filters.issuetype = [];
    },
    async getAllUsersAssignableToProjectsAPI(project) {
      await this.getAllUsersAssignableToProjects({
        project,
        jiraUrl: this.jiraUrl
      });
      this.filters.assignee = [];
    },
    async getStatusForProjectListAPI(project) {
      await this.getStatusForProjectList({
        project,
        jiraUrl: this.jiraUrl
      });
      this.filters.status = [];
    },
    getCountIssueListAPI() {
      if (this.progress) return;

      let filters = _.cloneDeep(this.filters);
      filters.project = filters.project?.length ? filters.project : this.allProject.map(item => item.key);

      this.getCountIssueList({
        filters,
        progress: this.progress,
        duration: this.durationFormat,
        jiraUrl: this.jiraUrl
      })
        .then(response => {
          this.pagination.total = response.data;
        })
        .catch(error => {
          console.log(error.response);
        });
    },
    async getIssueChartListAPI() {
      this.loadingChart = true;
      let filters = _.cloneDeep(this.filters);
      filters.project = filters.project?.length ? filters.project : this.allProject.map(item => item.key);

      await this.getIssueChartList({ filters, jiraUrl: this.jiraUrl, duration: this.durationFormat });
      this.loadingChart = false;
    },
    getIssueListAPI() {
      this.loading = true;
      let filters = _.cloneDeep(this.filters);
      filters.project = filters.project?.length ? filters.project : this.allProject.map(item => item.key);

      const { current, pageSize } = this.pagination;

      this.getIssueList({
        page: current,
        limit: pageSize,
        progress: this.progress,
        filters,
        duration: this.durationFormat,
        jiraUrl: this.jiraUrl
      })
        .then(response => {
          this.setIssueList(response.data);
          if (this.progress) {
            this.pagination.total = response.data.length;
          }
          this.loading = false;
        })
        .catch(error => {
          this.$notification.error({
            message: error.response.statusText,
            description: error.response.data.errorMessages[0],
            duration: 2.5
          });
          this.loading = false;
        });
    },
    async getQCD_KPI_API() {
      await this.getQCD_KPI({
        progress: this.progress,
        filters: this.filters,
        duration: this.durationFormat,
        jiraUrl: this.jiraUrl
      });
      this.setRefreshQCD(false);
    }
  }
};
</script>

<style scoped>
@import url("./style.css");
</style>
