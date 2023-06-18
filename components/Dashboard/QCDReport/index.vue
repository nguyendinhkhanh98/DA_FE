<template>
  <a-card class="dashboard-chart shadow">
    <template slot="title">
      <span class="h1">QCD KPI Result</span>
      <span class="icon-card-title" @click="edit = !edit"><i class="fas fa-ellipsis-h"></i></span>
    </template>

    <a-row>
      <span class="text-wrap text-bold">{{ qcdProjectTitle }} {{ duration }}</span>
    </a-row>

    <div v-if="!edit" class="qcd-content">
      <template v-if="qcd && !loading">
        <QCDContent :qcd="qcd" :form="formFilterData" />
      </template>
      <a-row v-else class="qcd-empty">
        <a-spin size="large">
          <a-empty />
        </a-spin>
      </a-row>
    </div>

    <a-row v-else class="qcd-content qcd-edit-form">
      <a-col v-bind="wrapperContainerCol">
        <a-form @submit.prevent="getQCD_KPI_API">
          <a-form-item :label="$t('project')" :label-col="labelCol" :wrapper-col="wrapperCol" :colon="false">
            <a-select v-model="formData.filters.project" mode="multiple">
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
          </a-form-item>

          <a-form-item :label="$t('duration')" :label-col="labelCol" :wrapper-col="wrapperCol" :colon="false">
            <a-row>
              <a-col class="pr-1" :span="12">
                <a-date-picker
                  class="w-100"
                  v-model="formData.duration.startDate"
                  :format="dateFormat"
                  :allowClear="true"
                />
              </a-col>
              <a-col class="pl-1" :span="12">
                <a-date-picker
                  class="w-100"
                  v-model="formData.duration.endDate"
                  :format="dateFormat"
                  :allowClear="true"
                />
              </a-col>
            </a-row>
          </a-form-item>

          <a-form-item :wrapper-col="actionCol" class="text-center" :colon="false">
            <a-button type="primary" html-type="submit" :loading="loading">
              <i class="fas fa-save mr-2"></i>
              {{ $t("save") }}
            </a-button>
          </a-form-item>
        </a-form>
      </a-col>
    </a-row>
  </a-card>
</template>

<script>
import * as CONST from "@/constants/index.js";
import { mapState, mapMutations, mapActions } from "vuex";
import QCDContent from "@/components/IssueReport/QCD/QCDContent";

export default {
  name: "QCDReport",
  components: {
    QCDContent
  },
  data() {
    return {
      formData: {
        progress: "",
        filters: {
          project: [],
          issuetype: [],
          status: [],
          sprint: [],
          assignee: []
        },
        duration: {
          startDate: this.$moment()
            .subtract(1, "weeks")
            .startOf("isoWeek"),
          endDate: this.$moment()
            .subtract(1, "weeks")
            .endOf("isoWeek")
        }
      },
      dateFormat: CONST.DATE_FORMAT,
      edit: false,
      labelCol: CONST.LABEL_COLUMN_SINGLE,
      wrapperCol: CONST.WRAPPER_COLUMN_SINGLE,
      wrapperContainerCol: CONST.WRAPPER_COLUMN_CONTAINER_SINGLE,
      actionCol: CONST.ACTION_COLUMN_SINGLE,
      formFilterData: []
    };
  },
  computed: {
    ...mapState({
      statusTask: state => state.modules["dashboard"].statusTask,
      userList: state => state.modules["dashboard"].userList,
      activeSprints: state => state.modules["dashboard"].activeSprints,
      qcd: state => state.modules["summary-report-by-issue"].qcd.data,
      loading: state => state.modules["summary-report-by-issue"].qcd.loading,
      jiraUrl: state => state.jiraUrl,
      aggregateProjectListFromAllURLs: state => state.modules["jira-project"].aggregateProjectListFromAllURLs
    }),
    projectInForm() {
      return this.formData.filters.project;
    },
    duration() {
      if (this.durationFormat) {
        return ` from ${this.durationFormat[0]} ~ ${this.durationFormat[1]}`;
      } else return "All time";
    },
    qcdProjectTitle() {
      let projectList = this.projectInForm.length ? this.projectInForm.join(",") : "All";
      return `Project: ${projectList}`;
    },
    durationFormat() {
      let duration = [];
      if (this.formData.duration.startDate && this.formData.duration.endDate) {
        duration[0] = this.formData.duration.startDate.format(this.dateFormat);
        duration[1] = this.formData.duration.endDate.format(this.dateFormat);
      } else duration = null;
      return duration;
    }
  },
  watch: {
    jiraUrl(newValue, oldValue) {
      if (newValue && oldValue) {
        this.formData.filters.project = [];
      }
    }
  },
  created() {
    this.getQCD_KPI_API();
  },
  methods: {
    ...mapMutations({
      setRefreshQCD: "modules/summary-report-by-issue/setRefreshQCD",
      setQCD_KPI: "modules/summary-report-by-issue/setQCD_KPI"
    }),
    ...mapActions({
      getQCD_KPI: "modules/summary-report-by-issue/getQCD_KPI",
      getProjectList: "modules/summary-report-by-issue/getProjectList",
      getAggregateProjectListFromAllURLs: "modules/jira-project/getAggregateProjectListFromAllURLs"
    }),
    async getQCD_KPI_API() {
      this.edit = false;
      this.setRefreshQCD(true);
      let formClone = _.cloneDeep(this.formData);
      formClone.filters.project = formClone.filters.project?.length
        ? formClone.filters.project
        : this.aggregateProjectListFromAllURLs.map(item => item.key);

      let payload = { ...formClone, jiraUrl: this.jiraUrl, duration: this.durationFormat };

      let payloads = [];
      let projectsWithURL = payload.filters.project
        .map(p => this.aggregateProjectListFromAllURLs.find(prj => prj.key == p))
        .map(p => ({ key: p.key, jiraUrl: p.jiraUrl }));
      let uniqueProjectURLs = [...new Set(projectsWithURL.map(project => project.jiraUrl))];

      uniqueProjectURLs.forEach(url => {
        let innerPayload = _.cloneDeep(payload);
        innerPayload.filters.project = projectsWithURL.filter(p => p.jiraUrl == url).map(p => p.key);
        innerPayload.jiraUrl = url;
        payloads.push(innerPayload);
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
    }
  }
};
</script>

<style lang="less" scoped>
.shadow {
  .ant-card-body {
    .qcd-content {
      min-height: 315px;
    }
  }

  .text-wrap {
    white-space: pre-wrap;
  }
}
</style>
