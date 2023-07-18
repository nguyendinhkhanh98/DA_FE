<template>
  <a-card>
    <h1>{{ $t("notification") }}</h1>
    <a-row>
      <a-col v-bind="wrapperContainerCol">
        <a-form v-bind="formItemLayout" @submit.prevent="getNotifications">
          <!-- Select-month -->
          <!-- <a-form-item :label="$t('project')" :colon="false">
            <a-month-picker placeholder="Select month" @change="onChange" v-model="selectedMonth">
              <a-icon slot="suffixIcon" type="smile" />
            </a-month-picker>
          </a-form-item> -->
          <!-- Select status -->
          <a-form-item :label="$t('notification')" :colon="false">
            <a-select v-model="selectedStatusNotification">
              <a-select-option v-for="item of notificationStatus" :key="item.value" :value="item.value">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <!-- Button search -->
          <a-form-item :wrapper-col="actionCol" class="text-center">
            <a-button type="primary" html-type="submit" :loading="loading">
              <i class="fas fa-search mr-1"></i>
              {{ $t("search") }}
            </a-button>
            <!-- <a-button type="primary" class="ml-1" ghost @click="handleExportReport" :loading="loading">
              <i class="fas fa-search mr-1"></i>
              {{ $t("export_excel") }}
            </a-button> -->
          </a-form-item>
        </a-form>
      </a-col>
    </a-row>

    <a-row type="flex" align="bottom" justify="space-between">
      <span class="text-bold">{{ $t("total_result") }}: {{ listNotifications.length }}</span>
      <span style="float: right">
        <a-button
          v-if="isDisplayButton && selectedStatusNotification == 'unread'"
          class="mb-1"
          type="primary"
          ghost
          @click="handleReadNotification"
        >
          <i class="fas fa-check mr-1 ml-1" style="color: green"></i>
          {{ "Đánh dấu tất cả đã đọc" }}
        </a-button>
        <!-- <a-button class="mb-1" type="primary" ghost @click="handleExportByTask">
          <i class="fas fa-file-excel mr-1 ml-1" style="color: green"></i>
          {{ $t("export_detail_by_task") }}
        </a-button> -->
      </span>
    </a-row>

    <a-table
      bordered
      :columns="columns"
      v-if="isShowTable"
      :dataSource="listNotifications"
      :rowKey="(record, index) => (pagination.current - 1) * pagination.pageSize + index + 1"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <template v-for="column of columns" :slot="column.slots.title">{{ $t(column.slots.title) }}</template>
      <!-- <template slot="no" slot-scope="text, record, index">
        {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
      </template> -->
      <template slot="ID" slot-scope="text, record">
        {{ record.id }}
      </template>
      <template slot="notification" slot-scope="text, record">
        {{ record.content }}
      </template>
      <!-- <template slot="expandedRowRender" slot-scope="text">
        <a-table
          class="mt-1 mb-1"
          :columns="userColumns"
          :dataSource="text.userWorkdaysByProjectInMonth"
          :pagination="false"
          :rowKey="(record, index) => index"
        >
          <template v-for="column of userColumns" :slot="column.slots.title">
            {{ $t(column.slots.title) }}
          </template>
          <template slot="no" slot-scope="text, record, index">
            {{ index + 1 }}
          </template>
          <template slot="name" slot-scope="text">
            {{ text }}
          </template>
          <template slot="roleProject" slot-scope="text">
            {{ text }}
          </template>
          <template slot="projectName" slot-scope="text">
            {{ text }}
          </template>
          <template slot="actualWorkDay" slot-scope="text">
            {{ text }}
          </template>
          <template slot="rateJoin" slot-scope="text">
            {{ text }}
          </template>
        </a-table>
      </template> -->
    </a-table>
  </a-card>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
import * as CONST from "@/constants/index.js";
import moment from "moment";
import { columns, userColumns } from "./const";

export default {
  data() {
    return {
      selectedProjects: [],
      columns,
      userColumns,
      formItemLayout: {
        labelCol: CONST.LABEL_COLUMN_SINGLE,
        wrapperCol: CONST.WRAPPER_COLUMN_SINGLE
      },
      wrapperContainerCol: CONST.WRAPPER_COLUMN_CONTAINER_SINGLE,
      actionCol: CONST.ACTION_COLUMN_SINGLE,
      pagination: {
        pageSize: 15,
        total: 0,
        current: 1,
        showSizeChanger: true,
        pageSizeOptions: ["15", "35", "50"]
      },
      loading: false,
      isShowTable: true,
      dateString: "",
      selectedMonth: null,
      start: null,
      end: null,
      notificationStatus: [
        {
          label: "Tất cả",
          value: "all"
        },
        {
          label: "Chưa đọc",
          value: "unread"
        },
        {
          label: "Đã đọc",
          value: "readed"
        }
      ],
      selectedStatusNotification: "all",
      listNotifications: [],
      isDisplayButton: false
    };
  },
  computed: {
    ...mapState({
      aggregateProjectListFromAllURLs: state => state.modules["jira-project"].aggregateProjectListFromAllURLs,
      jiraUrl: state => state.jiraUrl,
      uniqueInstances: state => state.modules["worklog-detail-by-user"].uniqueInstances,
      summaryWorklogsInMonth: state => state.modules["worklog-detail-by-user"].summaryWorklogsInMonth
    })
  },
  async created() {
    const { data } = await this.$request.get("/api/v2/notification");
    this.listNotifications = data?.data || [];
  },
  // async mounted() {
  //   if (this.jiraUrl) {
  //     await this.getAggregateProjectListFromAllURLs();
  //   }
  // },
  methods: {
    ...mapMutations({
      setAssigneeList: "modules/summary-report-by-issue/setAssigneeList",
      resetWorklogs: "modules/worklog-detail-by-user/resetWorklogs",
      setUserWorklogs: "modules/worklog-detail-by-user/setUserWorklogs",
      setSummaryWorklogByProjectInMonth: "modules/worklog-detail-by-user/setSummaryWorklogByProjectInMonth"
    }),
    ...mapActions({
      getUserWorkdaysByProjectInMonth: "modules/worklog-detail-by-user/getUserWorkdaysByProjectInMonth",
      getAllUsersAssignableToProjects: "modules/summary-report-by-issue/getAllUsersAssignableToProjects",
      getAggregateProjectListFromAllURLs: "modules/jira-project/getAggregateProjectListFromAllURLs"
      // saveUserWorkdaysByProjectInMonth: "modules/worklog-detail-by-user/saveUserWorkdaysByProjectInMonth"
    }),

    async getWorklogsByProject() {
      this.loading = true;
      this.isShowTable = false;
      let isFormValid = this.validateInputs();
      if (isFormValid == -1) {
        this.$notification.error({ message: "Month field are required fields" });
        this.loading = false;
        return;
      }
      var arr = this.dateString.split("-");
      this.start = `${this.dateString}-21`;
      this.end = parseInt(arr[1]) + 1 > 12 ? `${parseInt(arr[0]) + 1}-01-20` : `${arr[0]}-0${parseInt(arr[1]) + 1}-20`;

      if (this.selectedProjects.length != 0) {
        for (let i = 0; i < this.selectedProjects.length; i++) {
          let obj = this.aggregateProjectListFromAllURLs.filter(item => item.key == this.selectedProjects[i]);
          let payload = {
            since: moment(this.start).add(1, "days").valueOf(),
            until: moment(this.end).add(1, "days").valueOf(),
            jiraUrl: obj[0].jiraUrl,
            filters: {
              project: [this.selectedProjects[i]]
            },
            projectName: obj[0].name,
            workDay: this.workdayCount(moment(this.start).add(1, "days"), moment(this.end).add(1, "days"))
          };
          await this.getUserWorkdaysByProjectInMonth(payload);
        }
        this.setSummaryWorklogByProjectInMonth(
          this.aggregateProjectListFromAllURLs
            .filter(item => this.selectedProjects.includes(item.key))
            .map(item => item.name)
        );
      } else {
        for (var i = 0; i < this.aggregateProjectListFromAllURLs.length; i++) {
          let payload = {
            since: moment(start).add(1, "days").valueOf(),
            until: moment(end).add(1, "days").valueOf(),
            jiraUrl: this.aggregateProjectListFromAllURLs[i].jiraUrl,
            filters: {
              project: [this.aggregateProjectListFromAllURLs[i].key]
            },
            projectName: this.aggregateProjectListFromAllURLs[i].name
          };
          await this.getUserWorkdaysByProjectInMonth(payload);
        }
        this.setSummaryWorklogByProjectInMonth(this.aggregateProjectListFromAllURLs.map(item => item.name));
      }
      // this.saveUserWorkdaysByProjectInMonth();
      this.resetWorklogs();
      this.isShowTable = true;
      this.loading = false;
    },
    async getNotifications() {
      this.loading = true;
      const { data } = await this.$request.get(`/api/v2/notification?status=${this.selectedStatusNotification}`);
      this.listNotifications = data?.data || [];
      this.loading = false;
      this.isDisplayButton = true;
    },
    validateInputs() {
      if (!this.selectedMonth) return -1;
    },
    handleTableChange(pagination) {
      this.pagination = pagination;
    },
    hiddenTable() {
      this.isShowTable = false;
    },
    onChange(date, dateString) {
      this.dateString = dateString;
    },
    workdayCount(start, end) {
      var first = start.clone().endOf("week"); // end of first week
      var last = end.clone().startOf("week"); // start of last week
      var days = (last.diff(first, "days") * 5) / 7; // this will always multiply of 7
      var wfirst = first.day() - start.day(); // check first week
      if (start.day() == 0) --wfirst; // -1 if start with sunday
      var wlast = end.day() - last.day(); // check last week
      if (end.day() == 6) --wlast; // -1 if end with saturday
      return wfirst + Math.floor(days) + wlast; // get the total
    },
    handleExportReport() {
      this.loading = true;
      let duration = [];
      duration[0] = moment(this.start).add(1, "days");
      duration[1] = moment(this.end).add(1, "days");
    },
    async handleReadNotification() {
      await this.$request.put(`/api/v2/notification`);
      const { data } = this.$request.get(`/api/v2/notification?status=${this.selectedStatusNotification}`);
      this.listNotifications = data?.data || [];
    }
  }
};
</script>
