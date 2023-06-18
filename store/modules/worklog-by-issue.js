export const state = () => ({
  allProject: []
});

export const mutations = {
  setAllProject(state, list) {
    state.allProject = list;
  }
};

export const actions = {
  async getProjectList({ commit }) {
    const { data } = await this.$request.get("api.project.index");
    commit("setAllProject", data.data);
    return data;
  },
  async getTimeSheetByTask({ commit }, payload) {
    const { data } = await this.$request.post("api.timeSheetTask", payload);
    return data;
  },
  async exportTimeSheetByTask({ commit }, payload) {
    return this.$request.post("api.timeSheetTask.export", payload);
  },
  async exportTimeSheetByTaskParent({ commit }, payload) {
    return this.$request.post("/api/time-sheet-task/parent/export", payload);
  }
};
