<template>
  <div>
    <a-table
      bordered
      :columns="tableColumns"
      :dataSource="dataSource"
      :loading="loading"
      :rowKey="(record, index) => index"
      :scroll="{ x: true }"
      :pagination="false"
    >
      <template v-for="column of tableColumns.filter(col => !col.customTitle)" :slot="column.slots.title">
        {{ $t(column.slots.title) }}
      </template>

      <template slot="no" slot-scope="text, record, index">{{ index + 1 }}</template>

      <template slot="timeSpentSeconds" slot-scope="text, record">
        <div :class="{ 'qcd-worklog-weekend': getIsWeekend(text) }">
          <template v-if="text && text.worklogs && text.worklogs.length">
            <CellDetailWorklog :title="text" :record="record" />
          </template>
        </div>
      </template>

      <template slot="footer">
        <a-row>
          <div>
            <span class="worklog-danger-note"></span>&nbsp;:
            <small>{{ $t("total_spent_time") }} &lt; 7.0</small>
          </div>

          <div>
            <span class="worklog-warning-note"></span>&nbsp;:
            <small>7.0 &le; {{ $t("total_spent_time") }} &lt; 9.0</small>
          </div>

          <div>
            <span class="worklog-normal-note"></span>&nbsp;:
            <small>{{ $t("total_spent_time") }} &ge; 9.0</small>
          </div>
        </a-row>
      </template>
    </a-table>
  </div>
</template>

<script>
import CellDetailWorklog from "@/components/WorklogSummaryByUser/CellDetailWorklog";
import * as CONST from "@/constants/index.js";
import { mapState, mapMutations, mapActions } from "vuex";

export default {
  components: { CellDetailWorklog },
  props: {
    columns: Array,
    loading: Boolean
  },
  mounted() {
    this.removeTdPadding();
  },
  computed: {
    ...mapState({
      dataSource: state => state.modules["worklog-summary-by-user"].dataSource
    }),
    tableColumns() {
      let cloneColumns = _.cloneDeep(this.columns);

      cloneColumns = cloneColumns.filter(column => {
        if (column.title) {
          // Column is a day
          let momentTitle = this.$moment(column.title, CONST.DATE_FORMAT);
          column.title = momentTitle.format("DD/MM");
        }
        return true;
      });

      return cloneColumns;
    }
  },
  methods: {
    getIsWeekend(text) {
      const dayWeekend = [6, 7]; // [Saturday, Sunday]
      let momentDay = this.$moment(text.dayTrigger, CONST.DATE_FORMAT);
      const today = momentDay.isoWeekday();
      return dayWeekend.includes(today);
    },
    async removeTdPadding() {
      await this.$nextTick();
      let listWeekend = document.querySelectorAll(".qcd-worklog-weekend");

      listWeekend.forEach(item => {
        item.parentElement.classList.add("td-in-weekend");
      });
    }
  }
};
</script>

<style>
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

<style>
.td-in-weekend {
  padding: 0px !important;
  background-color: #ffeedd;
}
</style>
