<template>
  <a-card class="shadow">
    <div style="display: flex; align-items: center">
      <span class="h1">{{ $t("period_management") }}</span>

      <!-- <ExportSkillSet v-if="isLeader" class="ml-2" style="display: inline;" /> -->
    </div>

    <a-table
      class="mt-1"
      bordered
      :columns="columns"
      :dataSource="dataSource"
      :rowKey="record => record.id"
      :rowClassName="getRowClassName"
      :scroll="{ x: true }"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <template slot="title">
        <a-row type="flex" align="bottom" justify="space-between">
          <span class="text-bold">{{ $t("total_result") }} : {{ dataSource.length }}</span>
          <span class="right-info">
            <CreatePeriod v-if="isLeader" class="ml-1" />
          </span>
        </a-row>
      </template>

      <template v-for="column of columns.filter(item => item.flagCustomTitle != 3)" :slot="column.slots.title">
        {{ $t(column.slots.title) }}
      </template>

      <template slot="no" slot-scope="text, record, index">
        {{ index + 1 + (pagination.current - 1) * pagination.pageSize }}
      </template>

      <template v-for="column of columns.filter(item => item.flagCustomTitle == 3)" :slot="column.slots.title">
        <div :key="column.key" v-if="column.key == 'period_name'">
          <span>{{ $t(column.slots.title) }}</span>
          <br />
          <a-select
            v-model="dataFilter.period.filter.period_name"
            mode="multiple"
            allow-clear
            style="width: 200px"
            option-label-prop="label"
          >
            <a-select-option v-for="(item, index) in listPeriod" :key="index" :label="item.name" :value="item.name">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </div>

        <div :key="column.key" v-if="column.key == 'status'">
          <span>{{ $t(column.slots.title) }}</span>
          <br />
          <a-select
            v-model="dataFilter.period.filter.status"
            mode="multiple"
            allow-clear
            style="width: 200px"
            option-label-prop="label"
          >
            <a-select-option v-for="(item, index) in listStatus" :key="index" :label="item.value" :value="item.key">
              {{ item.value }}
            </a-select-option>
          </a-select>
        </div>
      </template>

      <template slot="start_date" slot-scope="text">
        {{ mapDate(text) }}
      </template>

      <template slot="end_date" slot-scope="text">
        {{ mapDate(text) }}
      </template>

      <template slot="status" slot-scope="text, record">
        <a-tag :color="record.delete_flag ? 'red' : 'green'">
          {{ getValueStatus(record) }}
        </a-tag>
      </template>

      <template slot="created_at" slot-scope="text">
        {{ mapDateTime(text) }}
      </template>

      <template slot="detail" slot-scope="text">
        <a-button type="link" @click="gotoDetail(text)">{{ $t("detail") }} <a-icon type="caret-right" /></a-button>
      </template>
    </a-table>
  </a-card>
</template>
<script>
import { mapState, mapGetters, mapActions } from "vuex";
import { columns, listStatus } from "./const";
import * as CONST from "@/constants/index.js";

import CreatePeriod from "@/components/SkillSet/CreatePeriod";
import ExportSkillSet from "@/components/SkillSet/ExportSkillSet";

export default {
  name: "Period_Management",
  middleware: "permissions",
  meta: {
    permissions: ["admin", "manager"]
  },
  components: {
    CreatePeriod,
    ExportSkillSet
  },
  data() {
    return {
      loading: false,
      searchForcus: null,
      listStatus,
      pagination: {
        pageSize: 10,
        total: 0,
        current: 1
      }
    };
  },
  async created() {
    this.loading = true;
    await this.getAllPeriod();
    this.loading = false;
  },
  computed: {
    ...mapState({
      listPeriod: state => state.modules["skill-set"].listPeriod,
      dataFilter: state => state.modules["skill-set"].dataFilter
    }),
    ...mapGetters({
      isLeader: "modules/skill-set/isLeader"
    }),
    columns() {
      let self = this;
      return columns.filter(item => {
        switch (item.key) {
          case "period_name":
            {
              item.filteredValue = self.dataFilter.period.filter.period_name || null;
              item.onFilterDropdownVisibleChange = visible => {
                setTimeout(() => visible && self.searchForcus.focus(), 0);
              };
            }
            break;
          case "status":
            {
              item.filteredValue = self.dataFilter.period.filter.status || null;
              item.onFilterDropdownVisibleChange = visible => {
                setTimeout(() => visible && self.searchForcus.focus(), 0);
              };
            }
            break;
          case "created_at":
            {
              item.sorter = (a, b) => {
                a = this.$moment(a.created_at, CONST.DATE_FORMAT_AND_TIME);
                b = this.$moment(b.created_at, CONST.DATE_FORMAT_AND_TIME);
                return a.isBefore(b) ? 1 : a.isAfter(b) ? -1 : 0;
              };
              item.defaultSortOrder = self.dataFilter.period.sorter.created_at;
            }
            break;
        }
        return true;
      });
    },
    dataSource() {
      let clone = _.cloneDeep(this.listPeriod);

      clone = this.filterDataByPeriod(clone);
      clone = this.filterDataByStatus(clone);

      return clone;
    }
  },
  methods: {
    ...mapActions({
      getAllPeriod: "modules/skill-set/getAllPeriod"
    }),
    mapDate(rawDate) {
      return this.$moment(rawDate).format(CONST.DATE_FORMAT);
    },
    mapDateTime(rawDate) {
      return this.$moment(rawDate).format(CONST.DATE_FORMAT_AND_TIME);
    },
    filterDataByPeriod(clone) {
      if (this.dataFilter.period.filter.period_name && this.dataFilter.period.filter.period_name.length) {
        return clone.filter(item => {
          return this.dataFilter.period.filter.period_name.includes(item.name);
        });
      }
      return clone;
    },
    filterDataByStatus(clone) {
      let keyStatus = this.dataFilter.period.filter.status;
      if (keyStatus && keyStatus.length) {
        let keyStatusDecoded = keyStatus.map(key => {
          let itemDecoded = this.listStatus.find(item => item.key == key);
          return itemDecoded.delete_flag;
        });

        return clone.filter(item => {
          return keyStatusDecoded.includes(item.delete_flag);
        });
      }
      return clone;
    },
    gotoDetail(text) {
      this.$router.push(`/skill-set/period/${text}`);
    },
    getRowClassName(record, index) {
      let className = [];
      if (record.delete_flag) className.push("text-danger");
      return className.join(" ");
    },
    getValueStatus(record) {
      let statusValue = this.listStatus.find(status => status.delete_flag == record.delete_flag);
      return statusValue ? statusValue.value : "";
    },
    handleTableChange(pagination) {
      this.pagination = pagination;
    }
  }
};
</script>

<style lang="less" scoped>
.shadow {
  .right-info {
    float: right;
    display: flex;
    flex-direction: row;
  }
}

.worklog-danger-note {
  width: 20px;
  height: 1em;
  display: inline-block;
  background-color: red;
  border: 1px solid #ddd;
  vertical-align: sub;
  margin-bottom: 2px;
}

.worklog-warning-note {
  width: 20px;
  height: 1em;
  display: inline-block;
  background-color: #0066ff;
  border: 1px solid #ddd;
  vertical-align: sub;
  margin-bottom: 2px;
}

.worklog-normal-note {
  width: 20px;
  height: 1em;
  display: inline-block;
  background-color: black;
  border: 1px solid #ddd;
  vertical-align: sub;
  margin-bottom: 2px;
}
</style>
