<template>
  <div v-if="aggregateProjectListFromAllURLs.length">
    <a-row>
      <QCDReport />
    </a-row>

    <a-row class="mt-3">
      <WorklogUserChart />
    </a-row>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import WorklogUserChart from "@/components/Dashboard/WorklogUserChart";
import QCDReport from "@/components/Dashboard/QCDReport";
import WorkingPerformance from "@/components/Dashboard/WorkingPerformance";
export default {
  middleware: "permissions",
  meta: {
    permissions: ["admin", "manager", "leader", "developer", "tester", "accountant", "intern"]
  },
  components: {
    WorklogUserChart,
    QCDReport,
    WorkingPerformance
  },
  created() {
    this.getAllUsersInfo();
    if (!this.aggregateProjectListFromAllURLs.length) this.getAggregateProjectListFromAllURLs();
  },
  watch: {
    jiraUrl(newValue) {
      if (newValue) {
        this.getProjectList({ jiraUrl: this.jiraUrl });
      }
    }
  },
  computed: {
    ...mapState({
      userList: state => state.modules["dashboard"].userList,
      jiraUrl: state => state.jiraUrl,
      aggregateProjectListFromAllURLs: state => state.modules["jira-project"].aggregateProjectListFromAllURLs
    })
  },
  methods: {
    ...mapActions({
      getAllUsersInfo: "modules/dashboard/getAllUsersInfo",
      getProjectList: "modules/summary-report-by-issue/getProjectList",
      getAggregateProjectListFromAllURLs: "modules/jira-project/getAggregateProjectListFromAllURLs"
    })
  }
};
</script>
<style>
.ant-table {
  font-size: 15px;
}
</style>
