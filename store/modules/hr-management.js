export const state = () => ({
  userList: [],
  currentHistoryOffWork: {
    year: null,
    month: null,
    data: []
  },
  dataFilter: {
    sorter: {
      date_created: "descend"
    },
    filter: {
      manager: [],
      user: [],
      request_type: [],
      status: []
    }
  },
  latestManager: null,
  historyOffWorkByRange: [],
  offworkStatus: {}
});

export const mutations = {
  setUserList(state, list) {
    state.userList = list;
  },
  setCurrentHistory(state, { year, month, list }) {
    state.currentHistoryOffWork.year = year;
    state.currentHistoryOffWork.month = month;
    state.currentHistoryOffWork.data = list;
  },
  setHistoryOffWorkByRange(state, list) {
    state.historyOffWorkByRange = list;
  },
  setOffworkStatus(state, list) {
    state.offworkStatus = list;
  },
  setLatestManager(state, value) {
    state.latestManager = value;
  }
};

export const actions = {
  async getAllUsersInfo({ commit }) {
    const { data } = await this.$request.get("/api/user-management/name-and-email");
    commit("setUserList", data);
    return data;
  },
  async createRequestOffWork({ commit }, payload) {
    const response = await this.$request.post("/api/v2/off-work", payload);
    return response.data;
  },
  async getOffWorkHistory({ commit }, payload) {
    const { data } = await this.$request.get("/api/v2/off-work", payload);
    commit("setCurrentHistory", { year: payload.year, month: payload.month, list: data.data });
    return data;
  },
  async getOffWorkHistoryByRange({ commit }, payload) {
    const { data } = await this.$request.get("/api/v2/off-work/range", payload);
    commit("setHistoryOffWorkByRange", data.data);
    return data;
  },
  async getListStatus({ commit }) {
    const { data } = await this.$request.get("/api/v2/off-work/status");
    commit("setOffworkStatus", data.data);
    return data;
  },
  async changeStatus({ commit, state }, payload) {
    const { data } = await this.$request.put("/api/v2/off-work/status", payload);
    if (!data.error) {
      let findItem = state.historyOffWorkByRange.find(item => item.id == payload.id);
      findItem.status = payload.status;
    }
    return data;
  },
  async getLatestManager({ commit, state }) {
    const { data } = await this.$request.get("/api/v2/off-work/latest-manager");
    if (data.data.length) {
      commit("setLatestManager", data.data[0].manager_id);
    }
    return data;
  }
};
