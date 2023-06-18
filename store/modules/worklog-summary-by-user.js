import moment from "moment";

export const state = () => ({
  allProject: [],
  userList: [],
  allArrowProject: [],
  dataSource: [],
  duration: {
    startDate: moment()
      .subtract(1, "weeks")
      .startOf("isoWeek"),
    endDate: moment()
      .subtract(1, "weeks")
      .endOf("isoWeek")
  },
  gotoCurrentValue: 1
});

export const mutations = {
  setAllProject(state, list) {
    state.allProject = list;
  },
  setUserList(state, list) {
    state.userList = list;
  },
  setAllProjectArrow(state, list) {
    state.allArrowProject = list;
  },
  setDataSource(state, list) {
    state.dataSource = list;
  },
  setDayTrackingForWeek(state, { startDate, endDate }) {
    state.duration.startDate = startDate;
    state.duration.endDate = endDate;
  },
  setCurrentValueTrigger(state, value) {
    state.gotoCurrentValue = value;
  }
};

export const actions = {
  async getProjectList({ commit }, payload) {
    const { data } = await this.$request.get("api.project.index", payload);
    payload ? commit("getRecentProject", data.data) : commit("setAllProject", data.data);
    return data;
  },
  async getAllUsersToProject({ commit }, payload) {
    const { data } = await this.$request.post("/api/worklog/user-in-company", payload);
    commit("setUserList", data.data);
    return data;
  },
  async getWorklog({ commit }, payload) {
    const { data } = await this.$request.post("/api/time-sheet-user", payload);
    return data;
  },
  async getAllProjectArrow({ commit }, payload) {
    const { data } = await this.$request.post("/api/arrow-all-project", payload);
    commit("setAllProjectArrow", data);
    return data;
  },
  async exportMonthlyReport({ commit }, payload) {
    return this.$request.post("/api/monthly-report", payload);
  }
};
