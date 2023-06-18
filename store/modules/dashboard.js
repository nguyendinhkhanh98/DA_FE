export const state = () => ({
  userList: [],
  activeSprints: [],
  tasksLeft: 0,
  tasksDone: 0,
  tasksOpen: 0,
  assignToMe: 0,
  workingPerformance: [],
  statusTask: {},
  userWorklog: [],
  changeLogIssue: {
    dev: [],
    leader: [],
    tester: []
  }
});

export const mutations = {
  setUserList(state, list) {
    state.userList = list;
  },
  setActiveSprints(state, list) {
    state.activeSprints = list;
  },
  setWorkingPerformance(state, list) {
    state.workingPerformance = list;
  },
  setStatusTask(state, list) {
    state.statusTask = list;
  },
  setUserWorklog(state, list) {
    state.userWorklog = list;
  },
  setChangelogIssue(state, list) {
    state.changeLogIssue = list;
  }
};

export const actions = {
  async getAllUsersInfo({ commit }) {
    const { data } = await this.$request.get("/api/users/search");
    commit("setUserList", data);
    return data;
  },
  async getActiveSprints({ commit }) {
    const { data } = await this.$request.get("/api/sprint/active");
    commit("setActiveSprints", data);
    return data;
  },
  async getWorkingPerformance({ commit }, payload) {
    const { data } = await this.$request.get("/api/working-performance", payload);
    commit("setWorkingPerformance", data);
    return data;
  },
  async getStatusTask({ commit }, payload) {
    const { data } = await this.$request.get("/api/task/status", payload);
    commit("setStatusTask", data);
    return data;
  },
  async getUserWorklog({ commit }, payload) {
    const { data } = await this.$request.post("/api/v2/dashboard/get-user-worklog-in-duration", payload);
    commit("setUserWorklog", data.data);
    return data;
  },
  async getChangeLogIssue({ commit, state }, payload) {
    const { data } = await this.$request.get("/api/user/change-log-issue", payload);
    commit("setChangelogIssue", data.dataFilter);
    return data;
  }
};
