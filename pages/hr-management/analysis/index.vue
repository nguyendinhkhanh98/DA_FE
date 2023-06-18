<template>
  <a-card class="shadow">
    <h1>{{ $t("analysis_history_offwork") }}</h1>

    <a-table
      bordered
      :loading="loading"
      :columns="columns"
      :data-source="dataSource"
      :rowKey="record => record.id"
      :scroll="{ x: 1000 }"
      @change="handleChange"
    >
      <template slot="title">
        <a-row class="header-take-leave-container w-100">
          <a-row>
            <span class="text-bold">{{ $t("total_result") }} : {{ dataSource.length }}</span>
          </a-row>

          <a-row class="mt-3">
            <a-row class="header-take-leave-toolbar">
              <a-col class="header-take-leave-toolbar-item" :span="11">
                <a-date-picker
                  class="pr-1"
                  v-model="filterDateRange.start"
                  :format="formatDate"
                  :allowClear="true"
                  @change="getListHistoryAPI"
                />
              </a-col>

              <a-col class="align-height-center text-center" :span="2">
                <a-icon type="arrow-right" />
              </a-col>

              <a-col class="header-take-leave-toolbar-item" :span="11">
                <a-date-picker
                  class="pl-1"
                  v-model="filterDateRange.end"
                  :format="formatDate"
                  :allowClear="true"
                  @change="getListHistoryAPI"
                />
              </a-col>
            </a-row>

            <a-row class="header-take-leave-admin">
              <a-button type="primary" ghost @click="exportAnalysisToExcel">
                <i class="fas fa-file-excel mr-1 ml-1" style="color: green"></i>
                {{ $t("export_excel") }}</a-button
              >
            </a-row>
          </a-row>
        </a-row>
      </template>

      <template v-for="column of columns" :slot="column.slots.title">
        {{ $t(column.slots.title) }}
      </template>

      <template slot="no" slot-scope="text, record, index">{{ index + 1 }} </template>

      <div slot="filterDropdown" slot-scope="{ column }" class="p-2">
        <!-- manager column -->
        <a-select
          v-ant-ref="c => (searchForcus = c)"
          v-if="column.key == 'manager'"
          v-model="dataFilter.filter.manager"
          mode="multiple"
          allow-clear
          placeholder="Please type"
          style="width: 200px"
          option-label-prop="label"
        >
          <a-select-option
            v-for="(item, index) in listUserOnlyName"
            :key="index"
            :label="item.full_name"
            :value="item.full_name"
          >
            {{ item.full_name }}
          </a-select-option>
        </a-select>

        <!-- user column -->
        <a-select
          v-ant-ref="c => (searchForcus = c)"
          v-if="column.key == 'user'"
          v-model="dataFilter.filter.user"
          mode="multiple"
          allow-clear
          placeholder="Please type"
          style="width: 200px"
          option-label-prop="label"
        >
          <a-select-option
            v-for="(item, index) in listUserOnlyName"
            :key="index"
            :label="item.full_name"
            :value="item.full_name"
          >
            {{ item.full_name }}
          </a-select-option>
        </a-select>

        <!-- status column -->
        <a-select
          v-ant-ref="c => (searchForcus = c)"
          v-if="column.key == 'status'"
          v-model="dataFilter.filter.status"
          mode="multiple"
          allow-clear
          placeholder="Please type"
          style="width: 200px"
          option-label-prop="label"
        >
          <a-select-option v-for="(item, index) in offworkStatus" :key="index" :label="item" :value="item">
            {{ item }}
          </a-select-option>
        </a-select>

        <!-- Request type column -->
        <a-select
          v-ant-ref="c => (searchForcus = c)"
          v-if="column.key == 'request_type'"
          v-model="dataFilter.filter.request_type"
          mode="multiple"
          allow-clear
          placeholder="Please type"
          style="width: 200px"
          option-label-prop="label"
        >
          <a-select-option
            v-for="(item, index) in listColorBadge"
            :key="index"
            :label="$t(item.type)"
            :value="item.type"
          >
            {{ $t(item.type) }}
          </a-select-option>
        </a-select>
      </div>

      <a-icon slot="filterIcon" type="search" />

      <template slot="day" slot-scope="text">
        {{ $moment(text).format(formatDate) }}
      </template>

      <template slot="request_type" slot-scope="text">
        {{ $t(text) }}
      </template>

      <template slot="status" slot-scope="text, record">
        <ChangeStatusOffWork :text="text" :record="record" :mapColorTag="mapColorTag" />
      </template>

      <template slot="detail" slot-scope="text">
        <a-button type="primary" @click="goToUserDetail(text)">{{ $t("detail") }}</a-button>
      </template>

      <template slot="expandedRowRender" slot-scope="record">
        <a-row v-if="(record.type == 'off_work') | (record.type == 'working_outside_office')">
          <a-form-item v-bind="layoutFormItem" :label="$t('session_in_day')" :colon="false">
            <a-input style="width: 100px" disabled :value="$t(record.data.session_in_day)" />
          </a-form-item>
        </a-row>

        <a-row v-if="record.type == 'go_to_office_late' || record.type == 'leave_office_early'">
          <a-form-item
            v-if="record.type == 'go_to_office_late'"
            v-bind="layoutFormItem"
            :label="$t('time_to_office_late')"
            :colon="false"
          >
            <a-time-picker
              style="width: initial"
              disabled
              :value="$moment(record.data.time_to_office_late, formatTimeHourAndMinute)"
              :format="formatTimeHourAndMinute"
            />
          </a-form-item>
          <a-form-item v-else v-bind="layoutFormItem" :label="$t('time_leave_office_early')" :colon="false">
            <a-time-picker
              style="width: initial"
              disabled
              :value="$moment(record.data.time_leave_office_early, formatTimeHourAndMinute)"
              :format="formatTimeHourAndMinute"
            />
          </a-form-item>

          <a-form-item v-bind="layoutFormItem" :label="$t('time_work_compensate')" :colon="false">
            <a-date-picker class="pr-1" :value="record.data.date_work_compensate" disabled />

            <a-time-picker
              class="px-1"
              style="width: initial"
              :value="$moment('17:30', formatTimeHourAndMinute)"
              :format="formatTimeHourAndMinute"
              disabled
            />

            <a-icon type="arrow-right" />

            <a-time-picker
              class="pl-1"
              style="width: initial"
              :value="$moment(record.data.time_work_compensate, formatTimeHourAndMinute)"
              :format="formatTimeHourAndMinute"
              disabled
            />
          </a-form-item>
        </a-row>

        <a-row v-if="record.type == 'forgot_to_scan_finger'">
          <span>{{ $t("forgot_to_scan_finger") }}</span>
        </a-row>
      </template>
    </a-table>
  </a-card>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
import ChangeStatusOffWork from "@/components/HumanResources/ChangeStatusOffWork";
import * as CONST from "@/constants/index.js";
import * as ExcelExporter from "@/utils/excel/offworkExcelExporter.js";
import { columns, mapColorTag } from "./const";
import { listColorBadge } from "../const";

export default {
  name: "AnalysisHistoryOffwork",
  middleware: "permissions",
  meta: {
    permissions: ["admin", "manager", "leader", "developer", "tester", "asset_admin", "intern", "accountant"]
  },
  components: {
    ChangeStatusOffWork
  },
  data() {
    return {
      listColorBadge,
      mapColorTag,
      formatDate: CONST.DATE_FORMAT,
      formatTimeHourAndMinute: CONST.TIME_HOUR_AND_MINUTE,
      labelCol: CONST.LABEL_COLUMN_SINGLE,
      wrapperCol: CONST.WRAPPER_COLUMN_SINGLE,
      searchForcus: null,
      filter: {
        manager: [],
        request_type: []
      },
      layoutFormItem: {
        labelCol: { span: 4 },
        wrapperCol: { span: 12 }
      },
      filterDateRange: {
        start: this.$moment().startOf("month"),
        end: this.$moment().endOf("month")
      },
      typeViewHistory: "admin", // ['self', 'admin']
      loading: false
    };
  },
  async created() {
    this.loading = true;

    let promise = [];
    promise.push(this.getListStatus());
    promise.push(this.getListHistoryAPI());
    if (!this.listUserOnlyName.length) promise.push(this.GetListUser());
    await Promise.all(promise);

    this.loading = false;
  },
  computed: {
    ...mapState({
      userList: state => state.modules["hr-management"].userList,
      dataFilter: state => state.modules["hr-management"].dataFilter,
      historyOffWorkByRange: state => state.modules["hr-management"].historyOffWorkByRange,
      listUserOnlyName: state => state.modules["skill-set"].listUserOnlyName,
      offworkStatus: state => state.modules["hr-management"].offworkStatus,
      userInfo: state => state.userInfo
    }),
    dataSource() {
      let clone = _.cloneDeep(this.historyOffWorkByRange);

      clone = this.filterDataByRole(clone);
      clone = this.filterDataByManager(clone);
      clone = this.filterDataByUser(clone);
      clone = this.filterDataByStatus(clone);
      clone = this.filterDataByRequestType(clone);

      return clone;
    },
    columns() {
      let self = this;
      return columns.filter(item => {
        switch (item.key) {
          case "day":
            item.defaultSortOrder = this.dataFilter.sorter.date_created;
            item.sorter = (a, b) => {
              let gather = this.$moment(a.date_created).isAfter(this.$moment(b.date_created));
              let less = this.$moment(a.date_created).isBefore(this.$moment(b.date_created));
              return gather ? 1 : less ? -1 : 0;
            };
            break;
          case "manager":
            item.filteredValue = self.dataFilter.filter.manager || null;
            item.onFilterDropdownVisibleChange = visible => {
              setTimeout(() => visible && self.searchForcus.focus(), 0);
            };
            break;
          case "user":
            item.filteredValue = self.dataFilter.filter.user || null;
            item.onFilterDropdownVisibleChange = visible => {
              setTimeout(() => visible && self.searchForcus.focus(), 0);
            };
            break;
          case "status":
            item.filteredValue = self.dataFilter.filter.status || null;
            item.onFilterDropdownVisibleChange = visible => {
              setTimeout(() => visible && self.searchForcus.focus(), 0);
            };
            break;
          case "request_type":
            item.filteredValue = self.dataFilter.filter.request_type || null;
            item.onFilterDropdownVisibleChange = visible => {
              setTimeout(() => visible && self.searchForcus.focus(), 0);
            };
            break;
        }
        return true;
      });
    },
    isManager() {
      return this.userInfo?.permissions.includes("manager");
    },
    isAdmin() {
      let isAdmin = this.userInfo?.permissions.includes("admin");
      let isAccountant = this.userInfo?.permissions.includes("accountant");
      return isAdmin || isAccountant;
    }
  },
  methods: {
    ...mapActions({
      getOffWorkHistoryByRange: "modules/hr-management/getOffWorkHistoryByRange",
      GetListUser: "modules/skill-set/GetListUser",
      getListStatus: "modules/hr-management/getListStatus",
      changeStatus: "modules/hr-management/changeStatus"
    }),
    goToUserDetail() {},
    onChangeMonth(selectedMonth) {
      this.month = selectedMonth + 1;
    },
    onChangeYear(newYear) {
      this.year = newYear;
    },
    filterDataByRole(clone) {
      if (this.isManager && !this.isAdmin && this.userInfo) {
        return clone.filter(item => {
          return item.manager_id == this.userInfo.id;
        });
      }
      return clone;
    },
    filterDataByManager(clone) {
      if (this.dataFilter.filter.manager && this.dataFilter.filter.manager.length) {
        return clone.filter(item => {
          return this.dataFilter.filter.manager.includes(item.manager);
        });
      }
      return clone;
    },
    filterDataByUser(clone) {
      if (this.dataFilter.filter.user && this.dataFilter.filter.user.length) {
        return clone.filter(item => {
          return this.dataFilter.filter.user.includes(item.user);
        });
      }
      return clone;
    },
    filterDataByStatus(clone) {
      if (this.dataFilter.filter.status && this.dataFilter.filter.status.length) {
        return clone.filter(item => {
          return this.dataFilter.filter.status.includes(item.status);
        });
      }
      return clone;
    },
    filterDataByRequestType(clone) {
      if (this.dataFilter.filter.request_type && this.dataFilter.filter.request_type.length) {
        return clone.filter(item => {
          return this.dataFilter.filter.request_type.includes(item.type);
        });
      }
      return clone;
    },
    handleChange(pagination, filters, sorter, { currentDataSource }) {
      this.dataFilter.sorter[sorter.field] = sorter.order;
    },
    async getListHistoryAPI() {
      this.loading = true;
      let start = this.filterDateRange.start?.format(this.formatDate);
      let end = this.filterDateRange.end?.format(this.formatDate);
      await this.getOffWorkHistoryByRange({ start, end, type: this.typeViewHistory });
      this.loading = false;
    },
    exportAnalysisToExcel() {
      let workbook = ExcelExporter.convertToWorkbook(this, this.dataSource);
    }
  }
};
</script>

<style lang="less" scoped>
.header-take-leave-container {
  .header-take-leave-toolbar {
    display: inline-block;
    width: fit-content;

    &-item {
      display: inline-block;
    }
  }

  .header-take-leave-admin {
    display: inline;
    float: right;
    width: fit-content;
  }

  .goto-history {
    display: inline;
    width: fit-content;
    float: right;
  }

  .align-height-center {
    transform: translateY(25%);
  }
}
</style>
