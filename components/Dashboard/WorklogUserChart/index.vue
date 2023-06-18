<template>
  <a-card class="dashboard-chart shadow">
    <template slot="title">
      <span class="h1">{{ $t("worklog_by_user") }}</span>
      <span class="icon-card-title" @click="edit = !edit"><i class="fas fa-ellipsis-h"></i></span>
    </template>

    <a-row>
      <span class="text-wrap text-bold">{{ worklogProjectTitle }} {{ durationShowTitle }}</span>
    </a-row>

    <a-spin v-if="!edit" :spinning="loading">
      <apexchart height="300" type="bar" :options="chartOptions" :series="series"></apexchart>
    </a-spin>
    <div v-else style="min-height: 315px;">
      <a-col v-bind="wrapperContainerCol">
        <a-form @submit.prevent="getUserWorklogAPI">
          <a-form-item :label="$t('project')" :label-col="labelCol" :wrapper-col="wrapperCol" :colon="false">
            <a-select v-model="form.project" mode="multiple">
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
                <a-date-picker class="w-100" v-model="form.startDate" :format="dateFormat" :allowClear="true" />
              </a-col>
              <a-col class="pl-1" :span="12">
                <a-date-picker class="w-100" v-model="form.endDate" :format="dateFormat" :allowClear="true" />
              </a-col>
            </a-row>
          </a-form-item>

          <a-form-item :wrapper-col="actionCol" class="text-center" :colon="false">
            <a-button type="primary" html-type="submit" :loading="loading">
              <i class="fas fa-save mr-2"></i>
              {{ $t("submit") }}
            </a-button>
          </a-form-item>
        </a-form>
      </a-col>
    </div>
  </a-card>
</template>

<script>
import * as CONST from "@/constants/index.js";
import { mapState, mapMutations, mapActions } from "vuex";
export default {
  data() {
    return {
      loading: false,
      edit: false,
      dateFormat: CONST.DATE_FORMAT,
      form: { project: [], startDate: null, endDate: null },
      series: [{ name: "Time worklogs", data: [] }],
      chartOptions: {
        chart: {
          events: {
            click: function(chart, w, e) {
              // console.log(chart, w, e)
            }
          },
          toolbar: {
            show: false
          }
        },
        colors: ["#007bff"],
        plotOptions: {
          bar: {
            columnWidth: "50%",
            distributed: true
          }
        },
        dataLabels: {
          enabled: false
        },
        legend: {
          show: false
        },
        xaxis: {
          categories: [],
          labels: {
            style: {
              //   colors: colors,
              fontSize: "12px"
            }
          }
        }
      },
      labelCol: CONST.LABEL_COLUMN_SINGLE,
      wrapperCol: CONST.WRAPPER_COLUMN_SINGLE,
      wrapperContainerCol: CONST.WRAPPER_COLUMN_CONTAINER_SINGLE,
      actionCol: CONST.ACTION_COLUMN_SINGLE
    };
  },
  computed: {
    ...mapState({
      userWorklog: state => state.modules["dashboard"].userWorklog,
      jiraUrl: state => state.jiraUrl,
      aggregateProjectListFromAllURLs: state => state.modules["jira-project"].aggregateProjectListFromAllURLs
    }),
    projectInForm() {
      return this.form.project;
    },
    durationFormat() {
      let duration = [];
      if (this.form.startDate && this.form.endDate) {
        duration[0] = this.form.startDate.format(this.dateFormat);
        duration[1] = this.form.endDate.format(this.dateFormat);
      } else duration = null;
      return duration;
    },
    durationShowTitle() {
      if (this.durationFormat) {
        return ` from ${this.durationFormat[0]} ~ ${this.durationFormat[1]}`;
      } else return "All time";
    },
    worklogProjectTitle() {
      let projectList = this.projectInForm.length ? this.projectInForm.join(",") : "All";
      return `Project: ${projectList}`;
    }
  },
  watch: {
    jiraUrl(newValue, oldValue) {
      if (newValue && oldValue) {
        this.form.project = [];
      }
    },
    userWorklog() {
      this.handleData();
    }
  },
  created() {
    this.form.startDate = this.$moment()
      .subtract(1, "weeks")
      .startOf("isoWeek");
    this.form.endDate = this.$moment()
      .subtract(1, "weeks")
      .endOf("isoWeek");
    this.getUserWorklogAPI();
  },
  methods: {
    ...mapMutations({
      setUserWorklog: "modules/dashboard/setUserWorklog"
    }),
    ...mapActions({
      getUserWorklog: "modules/dashboard/getUserWorklog"
    }),
    handleData() {
      if (!_.isEmpty(this.userWorklog)) {
        let labels = _.uniq(
          this.userWorklog.map(issue => {
            if (issue.fields.worklog.worklogs.length) return issue.fields.worklog.worklogs[0].author.displayName;
          })
        ).filter(item => item);
        let series = labels.map(item => 0);
        labels.forEach((label, index) =>
          this.userWorklog.forEach(issue => {
            if (issue.fields.worklog.worklogs.length) {
              issue.fields.worklog.worklogs.forEach(worklog => {
                if (label === worklog.author.displayName) {
                  series[index] += worklog.timeSpentSeconds / 3600;
                }
              });
            }
          })
        );
        series = series.map(item => +item.toFixed(2));
        let categories = labels.map(item => item.split(" "));
        this.series[0].data = series;
        this.chartOptions = {
          ...this.chartOptions,
          ...{
            xaxis: {
              categories: categories
            }
          }
        };
      }
    },
    async getUserWorklogAPI() {
      this.loading = true;
      let project = this.form.project.length
        ? this.form.project
        : this.aggregateProjectListFromAllURLs.map(item => item.key);
      let payload = {
        filters: {
          project
        },
        jiraUrl: this.jiraUrl,
        duration: this.durationFormat
      };

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

      let issues = [];
      for (let index = 0; index < payloads.length; index++) {
        const data = await this.getUserWorklog(payloads[index]);
        issues = issues.concat(data.data);
      }
      this.setUserWorklog(issues);

      this.loading = false;
      this.edit = false;
    }
  }
};
</script>

<style lang="less">
.shadow {
  .icon-card-title {
    float: right;
    cursor: pointer;
    padding: 0 6px;
    border-radius: 3px;
  }
  .icon-card-title:hover {
    background: #ebecf0;
  }
  .column-performance {
    white-space: normal;
    white-space: pre-line;
  }

  .ant-card-body {
    min-height: 315px;
  }
}
</style>
