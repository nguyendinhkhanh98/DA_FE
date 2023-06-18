<template>
  <a-card>
    <h1>{{ $t("compare_skill_set") }}</h1>

    <div>
      <a-table
        bordered
        :columns="columns"
        :data-source="listCompareSkillSetFilter"
        :rowKey="record => getRowKey(record)"
        :pagination="false"
        class="mt-3 compare-table"
      >
        <template v-for="column of columns.filter(item => item.flagCustomTitle == 3)" :slot="column.slots.title">
          <span :key="column.key" v-if="column.key == 'skill'">
            <div>
              <label>{{ $t("skill") }} </label>
              <TableSorter v-model="sorter.skill" @change="resetSorterExceptColumn('skill')" />
              <br />
              <a-select
                v-model="filter.skill"
                show-search
                allow-clear
                mode="multiple"
                :placeholder="$t('skill')"
                class="w-100"
                option-label-prop="label"
                :filterOption="filterOptionForUser"
              >
                <a-select-option
                  v-for="(item, index) in listCompareSkillSet"
                  :key="index"
                  :label="item.skill"
                  :value="item.skill"
                >
                  {{ item.skill }}
                </a-select-option>
              </a-select>
            </div>
          </span>

          <span :key="column.key" v-if="column.key == 'source'">
            <div>
              <label>{{ $t("source") }} </label>
              <br />
              <a-select
                v-model="userSourceCompare.source"
                show-search
                allow-clear
                placeholder="Source skill set"
                class="w-100"
                option-label-prop="label"
                :filterOption="filterOptionForUser"
              >
                <a-select-option
                  v-for="(item, index) in listUserPeriodCompare"
                  :key="index"
                  :label="item.user_period_name"
                  :value="item.id"
                >
                  {{ item.user_period_name }}
                </a-select-option>
              </a-select>
            </div>
          </span>

          <span :key="column.key" v-if="column.key == 'target'">
            <div>
              <label>{{ $t("target") }} </label>
              <br />
              <a-select
                v-model="userSourceCompare.target"
                show-search
                allow-clear
                placeholder="Target skill set"
                class="w-100"
                option-label-prop="label"
                :filterOption="filterOptionForUser"
              >
                <a-select-option
                  v-for="(item, index) in listUserPeriodCompare"
                  :key="index"
                  :label="item.user_period_name"
                  :value="item.id"
                >
                  {{ item.user_period_name }}
                </a-select-option>
              </a-select>
            </div>
          </span>

          <span :key="column.key" v-if="column.key == 'diff'">
            <div>
              <label>{{ $t("difference_level") }} </label>
              <TableSorter v-model="sorter.diff_level" @change="resetSorterExceptColumn('diff_level')" />
              <br />
            </div>
          </span>
        </template>

        <div slot="filterDropdown" slot-scope="filterOption" class="p-2">
          <template v-if="filterOption.column.key == 'diff'">
            <a-checkbox-group
              class="checkbox-filter-diff-level mt-1"
              :value="filter.diff_level"
              @change="e => handleFilterDiffLevel(e, filterOption.confirm, filterOption.setSelectedKeys)"
            >
              <a-checkbox value="1">
                <span class="text-success">
                  <i class="fas fa-arrow-up"></i>
                </span>
              </a-checkbox>
              <a-checkbox value="-1">
                <span class="text-danger">
                  <i class="fas fa-arrow-down"></i>
                </span>
              </a-checkbox>
              <a-checkbox value="0">
                <span class="text-warning">
                  <i class="fas fa-minus"></i>
                </span>
              </a-checkbox>

              <a-checkbox value="all">
                <span class="text-base">
                  {{ $t("all") }}
                </span>
              </a-checkbox>
            </a-checkbox-group>
            <br />
          </template>
        </div>

        <template slot="no" slot-scope="text, record, index">
          {{ index + 1 }}
        </template>

        <div slot="filterIcon" slot-scope="filtered">
          <a-icon type="filter" theme="filled" :style="{ color: filtered ? '#108ee9' : undefined }" />
        </div>

        <template slot="source" slot-scope="text">
          <span v-if="text"> {{ $t("level") }}: {{ text.level_review }} </span>
        </template>

        <template slot="target" slot-scope="text">
          <span v-if="text"> {{ $t("level") }}: {{ text.level_review }} </span>
        </template>

        <template slot="diff" slot-scope="text">
          <span v-if="text && text > 0" class="text-success">
            <i class="fas fa-arrow-up"></i>
            <span>{{ text }}</span>
          </span>

          <span v-if="text && text < 0" class="text-danger">
            <i class="fas fa-arrow-down"></i>
            <span>{{ -text }}</span>
          </span>

          <span v-if="!text" class="text-warning">
            <i class="fas fa-minus"></i>
          </span>
        </template>
      </a-table>
    </div>
  </a-card>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
import { removeVietnameseTones } from "@/utils/skillSet/skillSet.utils.js";
import { columns } from "./const";
import TableSorter from "@/components/Common/TableSorter";

export default {
  name: "CompareSkillSet",
  components: {
    TableSorter
  },
  data() {
    return {
      columns,
      loading: false,
      userSourceCompare: {},
      isToggleAll: true,
      sorter: {
        diff_level: "none",
        skill: "ascend"
      },
      filter: {
        diff_level: [],
        skill: []
      }
    };
  },
  async created() {
    let promises = [];
    if (!this.listUserOnlyName.length) promises.push(this.GetListUser());

    promises.push(this.FetchPeriod({ type: "view" }));
    promises.push(this.getListUserPeriodCompare());
    await Promise.all(promises);
  },
  watch: {
    userSourceCompare: {
      deep: true,
      handler() {
        if (this.userSourceCompare.source && this.userSourceCompare.target) this.handleCompareSkillSet();
      }
    }
  },
  computed: {
    ...mapState({
      listUserOnlyName: state => state.modules["skill-set"].listUserOnlyName,
      listPeriod: state => state.modules["skill-set"].listPeriod,
      listCompareSkillSet: state => state.modules["skill-set"].listCompareSkillSet,
      listUserPeriodCompare: state => state.modules["skill-set"].listUserPeriodCompare
    }),
    listCompareSkillSetFilter() {
      let clone = _.cloneDeep(this.listCompareSkillSet);
      clone = this.filterByDifferenceLevel(clone);
      clone = this.filterBySkill(clone);

      clone = this.sortByDifferenceLevel(clone);
      clone = this.sortBySkill(clone);
      return clone;
    }
  },
  methods: {
    ...mapActions({
      GetListUser: "modules/skill-set/GetListUser",
      FetchPeriod: "modules/skill-set/FetchPeriod",
      getSkillSetCompare: "modules/skill-set/getSkillSetCompare",
      getListUserPeriodCompare: "modules/skill-set/getListUserPeriodCompare"
    }),
    filterOptionForUser(input, option) {
      let textOption = option.componentOptions.children[0].text.toLowerCase();
      textOption = removeVietnameseTones(textOption);
      input = removeVietnameseTones(input.toLowerCase());
      return textOption.includes(input);
    },
    filterOptionForPeriod(input, option) {
      let textOption = option.componentOptions.children[0].text.toLowerCase();
      textOption = removeVietnameseTones(textOption);
      input = removeVietnameseTones(input.toLowerCase());
      return textOption.includes(input);
    },
    async handleCompareSkillSet() {
      this.loading = true;
      await this.getSkillSetCompare(this.userSourceCompare);
      this.loading = false;
    },
    validateSourceInput(sourceInput) {
      let source = sourceInput.source;
      let target = sourceInput.target;

      if (!source.user_id || !source.period_id) {
        return {
          title: "Source user required",
          description: "Please select source user"
        };
      }

      if (!target.user_id || !target.period_id) {
        return {
          title: "Target user required",
          description: "Please select target user"
        };
      }
    },
    getRowKey(record) {
      if (record.type == "category") return `${record.type}_${record.category}`;

      if (record.type == "skill") return `${record.type}_${record.skill}`;
    },
    confirmCustomizeFilter(filterData, confirm, setSelectedKeys) {
      setSelectedKeys(filterData ? [filterData] : []);
      confirm();
    },
    sortByDifferenceLevel(clone) {
      let order = this.sorter.diff_level;
      order = order == "ascend" ? 1 : order == "descend" ? -1 : 0;
      return clone.sort((a, b) => {
        let diffOrder = Math.sign(a.diff - b.diff) > 0 ? 1 : Math.sign(a.diff - b.diff) < 0 ? -1 : 0;
        return diffOrder == order ? -1 : diffOrder == -order ? 1 : 0;
      });
    },
    sortBySkill(clone) {
      let order = this.sorter.skill;
      order = order == "ascend" ? 1 : order == "descend" ? -1 : 0;

      return clone.sort((a, b) => {
        let diffOrder = a.skill?.localeCompare(b.skill);
        return diffOrder == order ? 1 : diffOrder == -order ? -1 : 0;
      });
    },
    handleFilterDiffLevel(checkedValues, confirm, setSelectedKeys) {
      let valueSelectedAll = checkedValues.length && checkedValues[checkedValues.length - 1] == "all";

      if (valueSelectedAll) {
        this.filter.diff_level = ["all"];
        setSelectedKeys(null);
        confirm();
      } else {
        this.filter.diff_level = checkedValues.filter(item => item != "all");
        setSelectedKeys(this.filter.diff_level);
        confirm();
      }
    },
    filterByDifferenceLevel(clone) {
      if (!this.filter.diff_level.length) return clone;
      if (this.filter.diff_level.includes("all")) return clone;

      let signDiffLevel = this.filter.diff_level.map(item => +item);
      return clone.filter(item => {
        return signDiffLevel.includes(Math.sign(item.diff));
      });
    },
    filterBySkill(clone) {
      if (!this.filter.skill.length) return clone;

      return clone.filter(item => {
        return this.filter.skill.includes(item.skill);
      });
    },
    resetSorterExceptColumn(column) {
      let keys = Object.keys(this.sorter);

      keys.forEach(key => {
        if (key != column) this.$set(this.sorter, key, "none");
      });
    }
  }
};
</script>

<style lang="less" scoped>
.label-select-compare {
  border: 1px solid #d9d9d9;
  border-bottom-left-radius: 4px;
  border-top-left-radius: 4px;
  background-color: #fafafa;
  padding: 4px;
}

.wrapper-select-title {
  display: inline-flex;
  justify-content: flex-start;
}

.wrapper-input-group {
  width: auto !important;
}

.hiden {
  display: none;
}

.table-bordered {
  border-collapse: collapse;
  width: 1200px;
  min-width: 100%;
  border-radius: 4px 4px 0 0;

  & table,
  th,
  td {
    border: 1px solid #e8e8e8;
  }
}

.hoverable {
  cursor: pointer;

  &:hover {
    background: #d9d9d9;
  }
}

.checkbox-filter-diff-level {
  label {
    margin: 0;
    display: block;
  }
}
</style>

<style lang="less">
.compare-table {
  th[key="source"],
  th[key="target"],
  th[key="skill"] {
    .ant-table-header-column {
      width: 100%;
    }
  }
}
</style>
