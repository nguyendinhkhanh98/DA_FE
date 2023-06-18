<template>
  <a-card class="shadow">
    <h1>{{ $t("qcd_report") }}</h1>
    <a-row class="mb-5">
      <a-col v-bind="wrapperContainerCol">
        <a-form v-bind="formItemLayout" @submit.prevent="handleSearch">
          <a-row>
            <a-col v-bind="gridCol">
              <a-form-item :label="$t('project')" :colon="false">
                <a-select
                  v-model="filters.project"
                  mode="multiple"
                  optionFilterProp="optionFilterProp"
                  @change="onSelectProjectChange"
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
            </a-col>
            <a-col v-bind="gridCol">
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
            <a-col v-bind="gridCol">
              <a-form-item :label="$t('progress')" :colon="false">
                <a-select v-model="progress" @change="setRefreshQCD(true)">
                  <a-select-option value>{{ $t("all") }}</a-select-option>
                  <a-select-option value="ahead_of_schedule">{{ $t("ahead_of_schedule") }}</a-select-option>
                  <a-select-option value="behind_schedule">{{ $t("behind_schedule") }}</a-select-option>
                  <a-select-option value="on_schedule">{{ $t("on_schedule") }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col v-bind="gridCol">
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
            <a-col v-bind="gridCol">
              <a-form-item :label="$t('status')" :colon="false">
                <a-select v-model="filters.status" mode="multiple" @change="setRefreshQCD(true)">
                  <a-select-option v-for="status of statusList" :key="status.id" :value="status.name">
                    {{ status.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col v-bind="gridCol">
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
            <a-col v-bind="gridCol">
              <a-row v-bind="gridCol">
                <a-form-item :label="$t('duration')" :colon="false">
                  <a-row :gutter="8">
                    <a-col :span="12">
                      <a-date-picker
                        v-model="duration.startDate"
                        placeholder="Start date"
                        :allowClear="true"
                        @change="setRefreshQCD(true)"
                      />
                    </a-col>
                    <a-col :span="12">
                      <a-date-picker
                        style="width: 100%;"
                        v-model="duration.endDate"
                        :allowClear="true"
                        placeholder="End date"
                        @change="setRefreshQCD(true)"
                      />
                    </a-col>
                  </a-row>
                </a-form-item>
              </a-row>
              <a-row>
                <a-col :xs="24" :sm="{ span: 16, offset: 8 }">
                  <span style="color: #a2a2a2;">Filter all issues which logged time within this duration</span>
                </a-col>
              </a-row>
            </a-col>
          </a-row>
          <a-row class="mt-3">
            <a-col style="text-align: center">
              <a-button type="primary" html-type="submit" class="mb-1" :loading="loading">
                <i class="fas fa-search mr-1"></i>
                {{ $t("search") }}
              </a-button>
            </a-col>
          </a-row>
        </a-form>
      </a-col>
    </a-row>
    <a-row>
      <a-col v-bind="wrapperContainerCol">
        <template v-if="!loading && qcd && !refresh">
          <QCDContent :qcd="qcd" :form="formFilterData">
            <a-button class="mb-1" type="primary" ghost :loading="downloadLoading" @click="ssrGenerateReport">
              <i class="far fa-file-pdf mr-1 ml-1"></i>
              <span>Export PDF</span>
            </a-button>
          </QCDContent>
        </template>
      </a-col>
    </a-row>
  </a-card>
</template>

<script>
import * as CONST from "@/constants/index.js";
import { mapState, mapMutations, mapActions } from "vuex";
import QCDContent from "@/components/IssueReport/QCD/QCDContent";

export default {
  name: "qcd-report",
  components: {
    QCDContent
  },
  data() {
    return {
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
      progress: "",
      loading: false,
      downloadLoading: false,
      gridCol: { xs: { span: 24 }, sm: { span: 12 } },
      formItemLayout: {
        labelCol: CONST.LABEL_COLUMN_DOUBLE,
        wrapperCol: CONST.WRAPPER_COLUMN_DOUBLE
      },
      wrapperContainerCol: CONST.WRAPPER_COLUMN_CONTAINER_DOUBLE,
      actionCol: CONST.ACTION_COLUMN_DOUBLE,
      formFilterData: []
    };
  },
  computed: {
    ...mapState({
      sprintList: state => state.modules["summary-report-by-issue"].sprintList,
      issueTypeList: state => state.modules["summary-report-by-issue"].issueTypeList,
      statusList: state => state.modules["summary-report-by-issue"].statusList,
      assigneeList: state => state.modules["summary-report-by-issue"].assigneeList,
      jiraUrl: state => state.jiraUrl,

      qcd: state => state.modules["summary-report-by-issue"].qcd.data,
      loadingQCD: state => state.modules["summary-report-by-issue"].qcd.loading,
      refresh: state => state.modules["summary-report-by-issue"].qcd.refresh,
      aggregateProjectListFromAllURLs: state => state.modules["jira-project"].aggregateProjectListFromAllURLs
    }),
    cost() {
      let diffrentHour = this.qcd.cost.actualManhour - this.qcd.cost.estimateManhour;
      let data = _.round((diffrentHour / this.qcd.cost.estimateManhour) * 100, 1);
      return isNaN(data) ? 0 : data;
    },
    delivery() {
      let data = _.round((this.qcd.delivery.issueBeforeDuedate / this.qcd.delivery.totalIssue) * 100, 1);
      return isNaN(data) ? 0 : data;
    },
    bugRatioByHour() {
      let data = _.round(
        (this.qcd.quality.bugRatioByHour.bugHour / this.qcd.quality.bugRatioByHour.issueHour) * 100,
        1
      );
      return isNaN(data) ? 0 : data;
    },
    bugRatioByNumber() {
      let data = _.round((this.qcd.quality.bugRatioByNumber.count / this.qcd.quality.bugRatioByNumber.total) * 100, 1);
      return isNaN(data) ? 0 : data;
    },
    degrate() {
      let data = _.round((this.qcd.quality.degrate.count / this.qcd.quality.degrate.total) * 100, 1);
      return isNaN(data) ? 0 : data;
    },
    degrationRatioByHour() {
      let data = _.round(
        (this.qcd.quality.degradationByHour.degradationHour / this.qcd.quality.degradationByHour.issueHour) * 100,
        1
      );
      return isNaN(data) ? 0 : data;
    },
    durationFormat() {
      let duration = [];
      if (this.duration.startDate && this.duration.endDate) {
        duration[0] = this.duration.startDate.format(CONST.DATE_FORMAT);
        duration[1] = this.duration.endDate.format(CONST.DATE_FORMAT);
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
      setRefreshQCD: "modules/summary-report-by-issue/setRefreshQCD",
      setStatusForProjectList: "modules/summary-report-by-issue/setStatusForProjectList",
      setAssigneeList: "modules/summary-report-by-issue/setAssigneeList",
      setIssueTypeList: "modules/summary-report-by-issue/setIssueTypeList",
      setSprintList: "modules/summary-report-by-issue/setSprintList",
      setQCD_KPI: "modules/summary-report-by-issue/setQCD_KPI"
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
      resetData: "modules/summary-report-by-issue/resetData",
      exportQCDToPDF: "modules/summary-report-by-issue/exportQCDToPDF",
      getAggregateProjectListFromAllURLs: "modules/jira-project/getAggregateProjectListFromAllURLs"
    }),
    handleSearch() {
      this.getQCD_KPI_API();
    },
    onSelectProjectChange() {
      this.setRefreshQCD(true);
    },

    async ssrGenerateReport() {
      this.downloadLoading = true;
      let projects = _.cloneDeep(this.filters.project);
      if (projects.length) {
        projects = projects.map(item => {
          let found = _.find(this.aggregateProjectListFromAllURLs, p => p.key == item);
          return {
            name: found.name,
            avatar: found.avatarUrls["16x16"]
          };
        });
      } else {
        projects = this.aggregateProjectListFromAllURLs.map(item => ({
          name: item.name,
          avatar: item.avatarUrls["16x16"]
        }));
      }

      let duration = this.durationFormat ? `${this.durationFormat[0]} ~ ${this.durationFormat[1]}` : "All time";

      let param = {
        ...this.qcd,
        costTotal: this.cost,
        deliveryTotal: this.delivery,
        bugRatioByNumber: this.bugRatioByNumber,
        bugRatioByHour: this.bugRatioByHour,
        degrateTotal: this.degrate,
        degrationRatioByHour: this.degrationRatioByHour,
        duration,
        projects
      };
      let data = await this.exportQCDToPDF(JSON.parse(JSON.stringify(param)));
      const blob = new Blob([data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const fileName = "QCD KPI Result.pdf";
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.downloadLoading = false;
    },

    async getQCD_KPI_API() {
      this.loading = true;

      let filters = _.cloneDeep(this.filters);
      filters.project = filters.project?.length
        ? filters.project
        : this.aggregateProjectListFromAllURLs.map(item => item.key);

      let payload = {
        progress: this.progress,
        filters,
        duration: this.durationFormat,
        jiraUrl: this.jiraUrl
      };

      let payloads = [];
      let projectsWithURL = filters.project
        .map(p => this.aggregateProjectListFromAllURLs.find(prj => prj.key == p))
        .map(p => ({ key: p.key, jiraUrl: p.jiraUrl }));
      let uniqueProjectURLs = [...new Set(projectsWithURL.map(project => project.jiraUrl))];

      uniqueProjectURLs.forEach(url => {
        let innerPayload = _.cloneDeep(payload);
        innerPayload.filters.project = projectsWithURL.filter(p => p.jiraUrl == url).map(p => p.key);
        innerPayload.jiraUrl = url;
        const areStatusesValid = innerPayload.filters.status.every(
          r =>
            this.statusList
              .filter(s => s.urls.includes(url))
              .map(s => s.name)
              .indexOf(r) >= 0
        );
        const areIssueTypesValid = innerPayload.filters.issuetype.every(
          r =>
            this.issueTypeList
              .filter(i => i.urls.includes(url))
              .map(i => i.name)
              .indexOf(r) >= 0
        );
        const areSprintsValid = innerPayload.filters.sprint.every(
          r =>
            this.sprintList
              .filter(s => s.urls.includes(url))
              .map(s => s.name)
              .indexOf(r) >= 0
        );
        const areAssigneesValid = innerPayload.filters.assignee.every(
          r =>
            this.assigneeList
              .filter(a => a.urls.includes(url))
              .map(a => a.displayName)
              .indexOf(r) >= 0
        );
        if (areStatusesValid && areIssueTypesValid && areSprintsValid && areAssigneesValid) payloads.push(innerPayload);
      });

      this.formFilterData = [];
      payloads.forEach(pl => {
        let filters = _.cloneDeep(pl.filters);
        filters.project = filters.project?.length
          ? filters.project
          : this.aggregateProjectListFromAllURLs.map(item => item.key);
        this.formFilterData.push({
          progress: this.progress,
          filters,
          duration: this.durationFormat,
          jiraUrl: pl.jiraUrl
        });
      });

      let data = {
        quality: {
          bugRatioByNumber: { total: 0, count: 0 },
          bugRatioByHour: { bugHour: 0, issueHour: 0 },
          degrate: { total: 0, count: 0 },
          degradationByHour: { issueHour: 0, degradationHour: 0 }
        },
        cost: { actualManhour: 0, estimateManhour: 0 },
        delivery: { issueBeforeDuedate: 0, totalIssue: 0 },
        costTabHour: { actualManhour: 0, estimateManhour: 0 }
      };

      for (let index = 0; index < payloads.length; index++) {
        if (index == 0) data = await this.getQCD_KPI(payloads[index]);
        else {
          let res = await this.getQCD_KPI(payloads[index]);
          data.cost.actualManhour += res.cost.actualManhour;
          data.cost.estimateManhour += res.cost.estimateManhour;
          data.costTabHour.actualManhour += res.costTabHour.actualManhour;
          data.costTabHour.estimateManhour += res.costTabHour.estimateManhour;
          data.delivery.issueBeforeDuedate += res.delivery.issueBeforeDuedate;
          data.delivery.totalIssue += res.delivery.totalIssue;
          data.quality.bugRatioByHour.bugHour += res.quality.bugRatioByHour.bugHour;
          data.quality.bugRatioByHour.issueHour += res.quality.bugRatioByHour.issueHour;
          data.quality.bugRatioByNumber.count += res.quality.bugRatioByNumber.count;
          data.quality.bugRatioByNumber.total += res.quality.bugRatioByNumber.total;
          data.quality.degradationByHour.degradationHour += res.quality.degradationByHour.degradationHour;
          data.quality.degradationByHour.issueHour += res.quality.degradationByHour.issueHour;
          data.quality.degrate.count += res.quality.degrate.count;
          data.quality.degrate.total += res.quality.degrate.total;
        }
      }

      this.setQCD_KPI(data);

      // await this.getQCD_KPI(payload);
      this.loading = false;
      this.setRefreshQCD(false);
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
    async getProjectListAPI() {
      await this.getAggregateProjectListFromAllURLs();
      let projects = this.aggregateProjectListFromAllURLs;
      let projectsWithURL = projects.map(p => ({ key: p.key, jiraUrl: p.jiraUrl }));
      let uniqueProjectURLs = [...new Set(projectsWithURL.map(project => project.jiraUrl))];

      let allRequests = [];
      uniqueProjectURLs.forEach(url => {
        let projects = projectsWithURL.filter(p => p.jiraUrl == url).map(p => p.key);
        let project = projects.join(",");
        allRequests.push(this.getStatusForProjectList({ project, jiraUrl: url }));
        allRequests.push(this.getAllUsersAssignableToProjects({ project, jiraUrl: url }));
        allRequests.push(this.getAllIssueTypesToProjects({ project, jiraUrl: url }));
        allRequests.push(this.getAllSprintToProjects({ project, jiraUrl: url }));
      });
      let res = await Promise.all(allRequests);
      this.filters.sprint = [];
      this.filters.issuetype = [];
      this.filters.assignee = [];
      this.filters.status = [];

      let allUsers = [];
      let allIssueTypes = [];
      let allStatuses = [];
      let allSprints = [];
      res.forEach((r, i) => {
        if (i % 4 == 0) allStatuses = allStatuses.concat(r.data);
        else if (i % 4 == 1) allUsers = allUsers.concat(r.data);
        else if (i % 4 == 2) allIssueTypes = allIssueTypes.concat(r.data);
        else allSprints = allSprints.concat(r.data);
      });

      let aggregateUsers = this.getAggregateData(allUsers, "displayName");
      let aggregateIssueTypes = this.getAggregateData(allIssueTypes, "name");
      let aggregateStatuses = this.getAggregateData(allStatuses, "name");
      let aggregateSprints = this.getAggregateData(allSprints, "name");

      this.setStatusForProjectList(aggregateStatuses);
      this.setAssigneeList(aggregateUsers);
      this.setIssueTypeList(aggregateIssueTypes);
      this.setSprintList(aggregateSprints);
    },
    getAggregateData(allData, uniquePropKey) {
      let aggregateKeys = [...new Set(allData.map(record => record[uniquePropKey]))];
      let aggregateRecords = aggregateKeys.map(key => {
        let urls = allData.filter(r => r[uniquePropKey] == key).map(r => r.self.substr(0, r.self.indexOf(".net") + 4));
        let record = allData.find(r => r[uniquePropKey] == key);
        record.urls = urls;
        return record;
      });
      return aggregateRecords;
    }
  }
};
</script>

<style scoped>
@import url("../style.css");
</style>
