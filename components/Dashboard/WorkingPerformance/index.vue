<template>
  <a-card class="dashboard-chart shadow">
    <template slot="title">
      {{ `${$t("performance_team")}: ${getFullWeekFormat()}` }}
      <span class="icon-card-title" @click="edit = !edit"><i class="fas fa-ellipsis-h"></i></span>
    </template>

    <a-spin v-if="!edit" :spinning="loading">
      <TableTemplate :columns="columnsCode" :dataSource="dataSource.dev" :tableTitle="`Code`" />
      <TableTemplate :columns="columnsReview" :dataSource="dataSource.leader" :tableTitle="`Leader`" />
      <TableTemplate :columns="columnsTest" :dataSource="dataSource.tester" :tableTitle="`Tester`" />
    </a-spin>
    <div v-else>
      <a-form @submit.prevent="getWorkingPerformanceAPI">
        <a-form-item
          :label="$t('sprint')"
          :label-col="{ xs: { span: 24 }, sm: { span: 6 } }"
          :wrapper-col="{ xs: { span: 24 }, sm: { span: 8 } }"
          :colon="false"
        >
          <a-select v-model="form.sprint" style="width: 174px">
            <a-select-option v-for="sprint of activeSprints" :key="sprint.id" :value="sprint.name">
              {{ sprint.name }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item
          :label="$t('select_by_week')"
          :label-col="{ xs: { span: 24 }, sm: { span: 6 } }"
          :wrapper-col="{ xs: { span: 24 }, sm: { span: 8 } }"
          :colon="false"
        >
          <a-week-picker
            :placeholder="$t('select_by_week')"
            @change="(date, string) => onPickDate(date, string, 'week')"
            :locale="$i18n.locale"
            :value="weekPicker"
          >
            <a-icon slot="suffixIcon" type="calendar" />
          </a-week-picker>
        </a-form-item>

        <a-form-item
          :label="$t('select_by_month')"
          :label-col="{ xs: { span: 24 }, sm: { span: 6 } }"
          :wrapper-col="{ xs: { span: 24 }, sm: { span: 8 } }"
          :colon="false"
        >
          <a-month-picker
            placeholder="Select month"
            @change="(date, string) => onPickDate(date, string, 'month')"
            :value="monthPicker"
          />
        </a-form-item>

        <a-form-item :wrapper-col="{ xs: { span: 20 }, sm: { span: 18, offset: 6 } }" :colon="false">
          <a-button type="primary" html-type="submit" :loading="loading">
            <i class="fas fa-save mr-2"></i>
            {{ $t("submit") }}
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </a-card>
</template>

<script>
import { columnsCode, columnsReview, columnsTest } from "./const";
import { mapState, mapActions } from "vuex";
import moment from "moment";
import TableTemplate from "./TableTemplate.vue";

export default {
  name: "WorkingPerformance",
  data() {
    return {
      columnsCode,
      columnsReview,
      columnsTest,
      dataSource: {
        dev: [],
        leader: [],
        tester: []
      },
      loading: false,
      edit: false,
      dateFormat: "YYYY-MM-DD",
      weekPicker: null,
      monthPicker: null,
      form: { sprint: "SARS-19", startDate: null, endDate: null }
    };
  },
  components: {
    TableTemplate
  },
  watch: {
    changeLogIssue: {
      handler() {
        this.handleData("dev");
        this.handleData("leader");
        this.handleData("tester");
      },
      deep: true
    }
  },
  created() {
    this.loading = true;
    this.form.startDate = moment()
      .isoWeekday(1)
      .subtract(7, "days")
      .format(this.dateFormat);
    this.form.endDate = moment()
      .isoWeekday(7)
      .subtract(7, "days")
      .format(this.dateFormat);
  },
  async mounted() {
    await this.getChangeLogIssue(this.form);
    this.loading = false;
  },
  computed: {
    ...mapState({
      activeSprints: state => state.modules["dashboard"].activeSprints,
      changeLogIssue: state => state.modules["dashboard"].changeLogIssue
    })
  },
  methods: {
    ...mapActions({
      getChangeLogIssue: "modules/dashboard/getChangeLogIssue"
    }),
    handleData(team) {
      let data = [];
      let source = this.changeLogIssue[team];
      let authors = _.uniq(_.map(source, item => item.author.displayName));
      authors.forEach(element => {
        let groupForAuthor = _.filter(source, changelog => changelog.author.displayName == element);
        let completeTask = _.filter(groupForAuthor, item => item.complete && item.status.toString.includes("Waiting"));
        let failedTask = _.filter(groupForAuthor, item => !item.complete && item.status.toString.includes("Waiting"));

        completeTask = _.uniqBy(completeTask, item => item.issueKey);
        failedTask = _.uniqBy(failedTask, item => item.issueKey);

        data.push({
          author: element,
          complete: completeTask,
          notComplete: failedTask
        });
      });
      this.dataSource[team] = [...data];
    },
    getFullWeekFormat() {
      moment.locale(this.$i18n.locale);
      let start = moment(this.form.startDate).format("Do MMMM");
      let end = moment(this.form.endDate).format("Do MMMM");
      let year = moment().get("year");
      return `${start} - ${end}, ${year}`;
    },
    onPickDate(date, dateString, type) {
      this.monthPicker = type == "month" ? date : null;
      this.weekPicker = type == "week" ? date : null;

      this.form.startDate = moment(date)
        .startOf(type)
        .format(this.dateFormat);

      this.form.endDate = moment(date)
        .endOf(type)
        .format(this.dateFormat);
    },
    async getWorkingPerformanceAPI() {
      this.loading = true;
      await this.getChangeLogIssue(this.form);
      this.loading = false;
      this.edit = false;
    }
  }
};
</script>

<style lang="less" scoped>
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
}
</style>
