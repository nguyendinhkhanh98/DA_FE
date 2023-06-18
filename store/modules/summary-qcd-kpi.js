export const state = () => ({
  listAllProjectInJira: []
});

export const mutations = {
  setListAllProjectInJira(state, list) {
    state.listAllProjectInJira = list;
  }
};

export const actions = {
  async getProjectSummaryData({ commit }, payload) {
    const { data } = await this.$request.post("/api/v2/qcd-report/kpi", payload);
    return data;
  },
  async getProjectSummaryDegration({ commit }, payload) {
    const { data } = await this.$request.post("/api/v2/qcd-summary/summary-kpi", payload);
    return data;
  }
};
