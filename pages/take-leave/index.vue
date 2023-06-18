<template>
  <a-card class="shadow">
    <h1>{{ $t("hr_management_dashboard") }}</h1>

    <div class="calendar-form">
      <a-calendar :fullscreen="fullscreen" :value="calendarValue" @panelChange="onPanelChange" @select="onSelect">
        <template slot="headerRender" slot-scope="{ value, type, onChange, onTypeChange }">
          <HeaderTakeLeaveCalendar v-bind="{ value, type, onChange, onTypeChange }" @re-render="reRenderCellCalendar" />
        </template>

        <template slot="dateCellRender" slot-scope="value">
          <div :ref="getRefForToday(value)">
            <CellCalendarOffWork
              :ref="value.format(formatDate)"
              :value="value"
              :calendarValue="calendarValue"
              :fullscreen="fullscreen"
              @re-render="reRenderCellCalendar"
              @update-calendar="newValue => (calendarValue = newValue)"
            />
          </div>
        </template>
      </a-calendar>
    </div>
  </a-card>
</template>

<script>
import HeaderTakeLeaveCalendar from "@/components/HumanResources/HeaderTakeLeaveCalendar";
import ModalCreateFormOffWork from "@/components/HumanResources/ModalCreateFormOffWork";
import CellCalendarOffWork from "@/components/HumanResources/CellCalendarOffWork";

import * as CONST from "@/constants/index.js";
import { mapState, mapMutations, mapActions } from "vuex";

export default {
  name: "HR_Management",
  middleware: "permissions",
  meta: {
    permissions: ["admin", "manager", "leader", "developer", "tester", "asset_admin", "intern", "accountant"]
  },
  components: {
    HeaderTakeLeaveCalendar,
    ModalCreateFormOffWork,
    CellCalendarOffWork
  },
  data() {
    return {
      formatDate: CONST.DATE_FORMAT,
      calendarValue: this.$moment(),
      windowWidth: window.innerWidth,
      wrapperTodayElement: null
    };
  },
  async created() {
    let year = this.calendarValue.get("year");
    let month = this.calendarValue.get("month") + 1;
    this.getOffWorkHistory({ year, month });
    this.getAllUsersInfo();
    this.getLatestManager();
  },
  mounted() {
    window.onresize = () => (this.windowWidth = window.innerWidth);
    this.reRenderTodayMark();
  },
  computed: {
    ...mapState({
      userList: state => state.modules["hr-management"].userList,
      currentHistoryOffWork: state => state.modules["hr-management"].currentHistoryOffWork
    }),
    fullscreen() {
      if (this.windowWidth < 768) return false;
      return true;
    }
  },
  methods: {
    ...mapActions({
      getAllUsersInfo: "modules/hr-management/getAllUsersInfo",
      getOffWorkHistory: "modules/hr-management/getOffWorkHistory",
      getLatestManager: "modules/hr-management/getLatestManager"
    }),
    onPanelChange(value, mode) {
      this.calendarValue = value;
      this.reRenderTodayMark();
      console.log("valueOnPanelChange", value);
      console.log("mode", mode);
    },
    onSelect(value) {
      console.log("valueOnSelect", value);
      let year = value.get("year");
      let month = value.get("month") + 1;
      if (year != this.currentHistoryOffWork.year || month != this.currentHistoryOffWork.month) {
        this.getOffWorkHistory({ year, month });
        this.reRenderTodayMark();
      }

      this.calendarValue = value;
      try {
        this.$refs[value.format(this.formatDate)].showModal();
      } catch (error) {
        console.error(error);
      }
    },
    getMonthData(value) {
      if (value.month() === 8) {
        return 1394;
      }
    },
    getRefForToday(value) {
      console.log("valueGetRefToday", value);
      if (value.isSame(this.$moment(), "day")) return "refToday";
    },
    async reRenderCellCalendar(momentValue) {
      let year = momentValue.get("year");
      let month = momentValue.get("month") + 1;
      this.getOffWorkHistory({ year, month });
    },
    reRenderTodayMark() {
      const action = () => {
        let todayRef = this.$refs.refToday;
        console.log("todayRef", todayRef);
        if (this.wrapperTodayElement) {
          this.wrapperTodayElement.classList.remove("today-calendar");
        }

        if (todayRef) {
          this.wrapperTodayElement = todayRef?.parentElement?.parentElement;
          this.wrapperTodayElement.classList.add("today-calendar");
        }
      };
      setTimeout(() => action(), 1);
    }
  }
};
</script>

<style lang="less" scoped>
.calendar-form {
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}
</style>

<style>
.today-calendar {
  background-color: rgba(252, 252, 246, 0.205) !important;
}
</style>
