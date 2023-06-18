<template>
  <div class="ant-table ant-table-default ant-table-bordered qcd-table-calendar">
    <div class="ant-table-body">
      <table class="worklogTable">
        <thead class="ant-table-thead">
          <tr>
            <th :key="'no'" class="text-center">
              <span> No </span>
            </th>

            <th colspan="2">
              <span>
                <div class="tooltipWrapper">
                  <span class="tooltip ml-1">
                    <a-tooltip placement="top">
                      <template slot="title">
                        <span>{{ $t("previous_week") }}</span>
                      </template>
                      <i class="backward fas fa-backward" @click="gotoPreviousWeek"></i>
                    </a-tooltip>

                    <a-tooltip placement="top">
                      <template slot="title">
                        <span>{{ $t("this_week") }}</span>
                      </template>
                      <i
                        v-if="gotoCurrentValue == -1"
                        class="backward fas fa-step-backward"
                        @click="gotoCurrentWeek"
                      ></i>
                    </a-tooltip>
                  </span>

                  <span class="tooltip mx-1">
                    <a-tooltip placement="top">
                      <template slot="title">
                        <span>{{ $t(showFullDate ? "hide_weekend" : "show_weekend") }}</span>
                      </template>
                      <i class="far fa-calendar-alt cursor backward forward" @click="handleToggleShowWeekend"></i>
                    </a-tooltip>

                    <a-tooltip placement="top">
                      <template slot="title">
                        <span>{{ $t("export_all") }}</span>
                      </template>
                      <i class="fas fa-file-excel cursor backward forward" @click="$emit('export-all')"></i>
                    </a-tooltip>
                  </span>

                  <span class="tooltip mr-1">
                    <a-tooltip placement="top">
                      <template slot="title">
                        <span>{{ $t("this_week") }}</span>
                      </template>
                      <i v-if="gotoCurrentValue == 1" class="forward fas fa-step-forward" @click="gotoCurrentWeek"></i>
                    </a-tooltip>

                    <a-tooltip placement="top">
                      <template slot="title">
                        <span>{{ $t("next_week") }}</span>
                      </template>
                      <i class="forward fas fa-forward" @click="gotoNextWeek"></i>
                    </a-tooltip>
                  </span>
                </div>
              </span>
            </th>

            <th
              v-for="column in columnsFilter"
              :key="column.key"
              :class="getClassForCellTable(column.key)"
              class="th-date text-center"
            >
              <span>
                {{ column.momentValue.format("ddd") }}
                <br />
                {{ column.momentValue.format("DD/MM") }}
              </span>
            </th>

            <th class="text-center" style="width: 100px">{{ $t("total") }}</th>
          </tr>
        </thead>

        <tbody class="ant-table-tbody">
          <tr v-for="(row, index) in dataSource" :key="index">
            <td class="text-center">{{ index + 1 }}</td>
            <td class="headerCellAction">{{ row.worklogAuthor }}</td>
            <td>{{ row.project }}</td>

            <td
              v-for="column in columnsFilter"
              :key="column.key"
              :class="getClassForCellTable(column.key)"
              class="text-center"
            >
              <template v-if="row[column.key] && row[column.key].worklogs && row[column.key].worklogs.length">
                <CellDetailWorklog :title="row[column.key]" :record="row" />
              </template>
            </td>

            <td class="text-bold text-center">{{ getTotalValueByUser(row) | secondToHours }}</td>
          </tr>

          <tr class="rowFooter text-bold">
            <td colspan="3">{{ $t("total") }} &nbsp;</td>

            <td
              v-for="column in columnsFilter"
              :key="column.key"
              :class="getClassForCellTable(column.key)"
              class="text-center"
            >
              {{ getTotalValueByDate(column) | secondToHours }}
            </td>

            <td class="text-center">{{ getTotalValueByDateAndUser() | secondToHours }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="ant-table-footer">
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
    </div>
  </div>
</template>

<script>
import CellDetailWorklog from "@/components/WorklogSummaryByUser/CellDetailWorklog";
import { mapState, mapMutations, mapActions } from "vuex";
import * as CONST from "@/constants/index.js";

export default {
  name: "WorklogSummaryByUserCalendarWeek",
  components: {
    CellDetailWorklog
  },
  data() {
    return {
      dateFormat: CONST.DATE_FORMAT,
      columns: [],
      showFullDate: true
    };
  },
  filters: {
    secondToHours(seconds) {
      if (!seconds) return;

      return (seconds / 3600).toFixed(2) + "h";
    }
  },
  computed: {
    ...mapState({
      dataSource: state => state.modules["worklog-summary-by-user"].dataSource,
      duration: state => state.modules["worklog-summary-by-user"].duration,
      gotoCurrentValue: state => state.modules["worklog-summary-by-user"].gotoCurrentValue
    }),
    columnsFilter() {
      return this.columns.filter(column => {
        if (!this.showFullDate) {
          const dayWeekend = [6, 7]; // [Saturday, Sunday]
          const today = column.momentValue.isoWeekday();
          return !dayWeekend.includes(today);
        }

        return true;
      });
    }
  },
  created() {
    this.reCaculateListColumn();
  },
  methods: {
    ...mapMutations({
      setDayTrackingForWeek: "modules/worklog-summary-by-user/setDayTrackingForWeek",
      setCurrentValueTrigger: "modules/worklog-summary-by-user/setCurrentValueTrigger"
    }),
    reCaculateListColumn() {
      let listDay = this.getListDateInThisWeek(this.duration);
      this.columns = this.getColumnsFromListDay(listDay);
    },
    getColumnsFromListDay(listDay) {
      return listDay.map(day => ({
        momentValue: day,
        key: day.format(this.dateFormat),
        title: day.format(this.dateFormat)
      }));
    },
    getListDateInThisWeek(duration) {
      let startDate = duration.startDate.clone();
      let endDate = duration.endDate.clone();
      let listDate = [];

      while (startDate <= endDate) {
        listDate.push(startDate.clone());
        startDate = startDate.add(1, "days");
      }

      return listDate;
    },
    gotoNextWeek() {
      this.setCurrentValueTrigger(-1);
      let startDate = this.duration.startDate.clone().add(1, "weeks");
      let endDate = this.duration.endDate.clone().add(1, "weeks");
      this.setDayTrackingForWeek({ startDate, endDate });

      if (this.checkTodayInRange(startDate, endDate)) this.setCurrentValueTrigger(0);
      this.reCaculateListColumn();

      this.$emit("change-duration");
    },
    gotoPreviousWeek() {
      this.setCurrentValueTrigger(1);
      let startDate = this.duration.startDate.clone().subtract(1, "weeks");
      let endDate = this.duration.endDate.clone().subtract(1, "weeks");
      this.setDayTrackingForWeek({ startDate, endDate });

      if (this.checkTodayInRange(startDate, endDate)) this.setCurrentValueTrigger(0);
      this.reCaculateListColumn();

      this.$emit("change-duration");
    },
    gotoCurrentWeek() {
      this.setCurrentValueTrigger(0);
      let startDate = this.$moment().startOf("isoWeek");
      let endDate = this.$moment().endOf("isoWeek");
      this.setDayTrackingForWeek({ startDate, endDate });
      this.reCaculateListColumn();

      this.$emit("change-duration");
    },
    checkTodayInRange(startDate, endDate) {
      startDate = startDate.clone().startOf("day");
      endDate = endDate.clone().startOf("day");
      let now = this.$moment().startOf("day");

      return now >= startDate && now <= endDate;
    },
    getTotalValueByUser(row) {
      let totalTimeSpent = 0;
      this.columns.forEach(column => {
        if (row[column.key] && row[column.key].value) totalTimeSpent += row[column.key].value;
      });

      if (totalTimeSpent) return totalTimeSpent;
    },
    getTotalValueByDate(column) {
      let totalTimeSpent = 0;

      this.dataSource.forEach(row => {
        if (row[column.key] && row[column.key].value) totalTimeSpent += row[column.key].value;
      });

      if (totalTimeSpent) return totalTimeSpent;
    },
    getTotalValueByDateAndUser() {
      let totalTimeSpent = 0;

      this.dataSource.forEach(row => {
        this.columns.forEach(column => {
          if (row[column.key] && row[column.key].value) totalTimeSpent += row[column.key].value;
        });
      });

      if (totalTimeSpent) return totalTimeSpent;
    },
    getClassForCellTable(text) {
      const dayWeekend = [6, 7]; // [Saturday, Sunday]
      let momentDay = this.$moment(text, CONST.DATE_FORMAT);
      const today = momentDay.isoWeekday();

      return {
        nonBusinessDay: dayWeekend.includes(today),
        toDay: this.$moment().isSame(momentDay, "day")
      };
    },
    handleToggleShowWeekend() {
      this.showFullDate = !this.showFullDate;
    }
  }
};
</script>

<style lang="less" scoped>
.qcd-table-calendar {
  .ant-table-body {
    overflow-x: auto;

    table.worklogTable {
      thead {
        th:not(.headerAction) {
          padding: 4px 8px;
        }

        th.headerAction {
          border: none;
          padding: none;
        }

        .tooltipWrapper {
          background-color: #deebff;
          border: 1px solid #c2d9ef;
          text-align: justify;
          height: 22px;

          &:after {
            content: "";
            display: inline-block;
            width: 100%;
          }

          .tooltip {
            display: inline-block;

            i {
              cursor: pointer;
              color: #0052cc;
              &.backward {
                padding-right: 4px;
                border-right: 1px dotted #d2d2d2;
              }
              &.forward {
                padding-left: 4px;
                border-left: 1px dotted #d2d2d2;
              }
            }
          }
        }

        .nonBusinessDay {
          background-color: #ffeedd;
        }

        .toDay {
          background-color: #e3fcef;
        }

        th.th-date {
          width: 80px;
        }
      }

      tbody {
        td:not(.headerCellAction) {
          padding: 4px 8px;
        }

        td.rowFooter {
          background-color: #deebff;
        }
      }
    }
  }
}
</style>

<style lang="less" scoped>
.cursor {
  cursor: pointer;

  & * {
    cursor: pointer;
  }
}
</style>
