<template>
  <a-card class="shadow">
    <div>
      <span class="h1" style="display: inline-block">{{ $t("list_assessment_skill") }}</span>

      <span class="ml-2 right-info" v-if="isLeader" style="display: inline-block">
        <CreatePeriod v-if="isManager" style="display: inline-block" />

        <a-button type="link" @click="createAssessment" style="display: inline-block"
          >{{ $t("create_assessment") }} <a-icon type="caret-right"
        /></a-button>
      </span>
    </div>

    <a-table
      class="mt-1"
      bordered
      :columns="columns"
      :dataSource="dataSource"
      :rowKey="record => record.id"
      :scroll="{ x: true }"
      :pagination="dataFilter.pagination"
      :loading="loading"
      @change="handleChange"
    >
      <template slot="title">
        <a-row type="flex" align="bottom" justify="space-between">
          <span class="text-bold">{{ $t("total_result") }} : {{ dataFilter.pagination.total }}</span>
          <span class="right-info" style="display: flex; align-items: center">
            <!-- <ExportSkillSet v-if="isLeader" class="mr-2" style="display: inline;" /> -->

            <a-switch v-model="checkedFilterMySkillSet" class="mr-1" default-checked @change="switchCheckedRecord">
            </a-switch>
            <span v-if="checkedFilterMySkillSet">{{ $t("view_my_skillset") }}</span>
            <span v-else>{{ $t("view_all_skillset") }}</span>
          </span>
        </a-row>
      </template>

      <template v-for="column of columns.filter(item => item.flagCustomTitle == 1)" :slot="column.slots.title">
        {{ $t(column.slots.title) }}
      </template>

      <template slot="no" slot-scope="text, record, index">
        {{ index + 1 + Math.max(0, dataFilter.pagination.current - 1) * 20 }}
      </template>

      <template v-for="column of columns.filter(item => item.flagCustomTitle == 3)" :slot="column.slots.title">
        <div :key="column.key" v-if="column.key == 'period_name'">
          <span>{{ $t(column.slots.title) }}</span>
          <br />
          <a-select
            v-model="dataFilter.filter.period_name"
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

        <div :key="column.key" v-if="column.key == 'leader'">
          <span>{{ $t(column.slots.title) }}</span>
          <br />
          <a-select
            v-ant-ref="c => (searchForcus = c)"
            v-model="dataFilter.filter.leader"
            mode="multiple"
            allow-clear
            style="width: 200px"
            :filterOption="filterOptionForUser"
          >
            <a-select-option
              v-for="(item, index) in listLeader"
              :key="index"
              :label="item.fullName"
              :value="item.fullName"
            >
              {{ item.fullName }}
            </a-select-option>
          </a-select>
        </div>

        <div :key="column.key" v-if="column.key == 'user_created'">
          <span>{{ $t(column.slots.title) }}</span>
          <br />
          <a-select
            v-ant-ref="c => (searchForcus = c)"
            v-model="dataFilter.filter.user_created"
            mode="multiple"
            allow-clear
            style="width: 200px"
            :filterOption="filterOptionForUser"
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
        </div>

        <div :key="column.key" v-if="column.key == 'status'">
          <span>{{ $t(column.slots.title) }}</span>
          <br />
          <a-select
            v-model="dataFilter.filter.status"
            mode="multiple"
            allow-clear
            style="width: 200px"
            option-label-prop="label"
          >
            <a-select-option v-for="(item, index) in listStatus" :key="index" :label="item.text" :value="item.value">
              {{ item.text }}
            </a-select-option>
          </a-select>
        </div>
      </template>
      <template slot="created_at" slot-scope="text">
        {{ mapDate(text) }}
      </template>

      <template slot="status" slot-scope="text">
        <a-tag :color="mapColorTag(text)"> {{ text }} </a-tag>
      </template>

      <template slot="detail" slot-scope="text">
        <a-button type="link" @click="goToUserDetail(text)">{{ $t("detail") }} <a-icon type="caret-right" /></a-button>
      </template>
    </a-table>
  </a-card>
</template>

<script>
import * as CONST from "@/constants/index.js";
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
import { columns, mapColorTag, listStatus } from "./const.js";
import { removeVietnameseTones } from "@/utils/skillSet/skillSet.utils.js";
import moment from "moment";

import CreatePeriod from "@/components/SkillSet/CreatePeriod";
import ExportSkillSet from "@/components/SkillSet/ExportSkillSet";

export default {
  name: "SkillSet",
  middleware: "permissions",
  meta: {
    permissions: ["admin", "manager", "leader", "developer", "tester", "asset_admin", "intern"]
  },
  data() {
    return {
      mapColorTag,
      listStatus,
      loading: false,
      searchForcus: null,
      checkedFilterMySkillSet: false
    };
  },
  components: {
    CreatePeriod,
    ExportSkillSet
  },
  computed: {
    ...mapState({
      listUserPeriod: state => state.modules["skill-set"].listUserPeriod,
      listPeriod: state => state.modules["skill-set"].listPeriod,
      userInfo: state => state.userInfo,
      dataFilter: state => state.modules["skill-set"].dataFilter,
      listUserOnlyName: state => state.modules["skill-set"].listUserOnlyName,
      listLeader: state => state.modules["skill-set"].listLeader
    }),
    ...mapGetters({
      isLeader: "modules/skill-set/isLeader",
      isManager: "modules/skill-set/isManager"
    }),
    columns() {
      let self = this;
      return columns.filter(item => {
        switch (item.key) {
          case "status":
            {
              item.filteredValue = self.dataFilter.filter.status || null;
              item.onFilterDropdownVisibleChange = visible => {
                setTimeout(() => visible && self.searchForcus.focus(), 0);
              };
            }
            break;
          case "created_at":
            {
              item.sorter = (a, b) => {
                a = moment(a.created_at);
                b = moment(b.created_at);
                return a.isBefore(b) ? 1 : a.isAfter(b) ? -1 : 0;
              };
              item.defaultSortOrder = self.dataFilter.sorter.created_at;
            }
            break;
          case "leader":
            {
              item.filteredValue = self.dataFilter.filter.leader || null;
              item.onFilterDropdownVisibleChange = visible => {
                setTimeout(() => visible && self.searchForcus.focus(), 0);
              };
            }
            break;

          case "user_created":
            {
              item.filteredValue = self.dataFilter.filter.user_created || null;
              item.onFilterDropdownVisibleChange = visible => {
                setTimeout(() => visible && self.searchForcus.focus(), 0);
              };
            }
            break;
          case "period_name":
            {
              item.filteredValue = self.dataFilter.filter.period_name;
              item.onFilterDropdownVisibleChange = visible => {
                setTimeout(() => visible && self.searchForcus.focus(), 0);
              };
            }
            break;
        }
        return true;
      });
    },
    dataSource() {
      let clone = _.cloneDeep(this.listUserPeriod);

      clone = this.filterDataByPeriod(clone);
      clone = this.filterDataByUser(clone);
      clone = this.filterDataByLeader(clone);
      clone = this.filterDataByStatus(clone);

      this.dataFilter.pagination.total = clone.length;
      return clone;
    }
  },
  async created() {
    this.loading = true;

    let promises = [];
    if (!this.listUserPeriod.length) promises.push(this.FetchAllUserPeriod());
    if (!this.listUserOnlyName.length) promises.push(this.GetListUser());
    if (!this.listLeader.length) promises.push(this.getAndFillListLeader());

    promises.push(this.FetchPeriod({ type: "view" }));
    await Promise.all(promises);

    this.loading = false;
  },
  methods: {
    ...mapMutations({
      setUserCreatedByValue: "modules/skill-set/setUserCreatedByValue"
    }),
    ...mapActions({
      FetchAllUserPeriod: "modules/skill-set/FetchAllUserPeriod",
      GetListUser: "modules/skill-set/GetListUser",
      FetchPeriod: "modules/skill-set/FetchPeriod",
      getAndFillListLeader: "modules/skill-set/getAndFillListLeader"
    }),
    handleChange(pagination, filters, sorter, { currentDataSource }) {
      this.dataFilter.sorter[sorter.field] = sorter.order;
      this.dataFilter.pagination.current = pagination.current;
    },
    mapDate(text) {
      return moment(text).format(CONST.DATE_FORMAT);
    },
    goToUserDetail(text) {
      this.$router.push(`/skill-set/${text}`);
    },
    createAssessment() {
      this.$router.push(`/skill-set/add`);
    },
    filterDataByPeriod(clone) {
      if (this.dataFilter.filter.period_name && this.dataFilter.filter.period_name.length) {
        return clone.filter(item => {
          return this.dataFilter.filter.period_name.includes(item.period_name);
        });
      }
      return clone;
    },
    filterDataByUser(clone) {
      if (this.dataFilter.filter.user_created && this.dataFilter.filter.user_created.length) {
        return clone.filter(item => {
          return this.dataFilter.filter.user_created.includes(item.user_created);
        });
      }
      return clone;
    },
    filterDataByLeader(clone) {
      if (this.dataFilter.filter.leader && this.dataFilter.filter.leader.length) {
        return clone.filter(item => {
          return this.dataFilter.filter.leader.includes(item.leader);
        });
      }
      return clone;
    },
    filterDataByStatus(clone) {
      if (this.dataFilter.filter.status && this.dataFilter.filter.status.length) {
        let statusReview = ["Waiting for review", "Wait for Review"];
        let isFilterReviewStatus = _.intersection(statusReview, this.dataFilter.filter.status).length;

        return clone.filter(item => {
          let statusInDataFilter = this.dataFilter.filter.status.includes(item.status);
          if (isFilterReviewStatus) {
            statusInDataFilter = statusInDataFilter || statusReview.includes(item.status);
          }

          return statusInDataFilter;
        });
      }
      return clone;
    },
    filterOptionForUser(input, option) {
      let textOption = option.componentOptions.children[0].text.toLowerCase();
      textOption = removeVietnameseTones(textOption);
      input = removeVietnameseTones(input.toLowerCase());
      return textOption.includes(input);
    },
    switchCheckedRecord(checked) {
      let checkedUser = checked ? [this.userInfo?.fullName] : [];
      this.setUserCreatedByValue(checkedUser);
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
</style>
