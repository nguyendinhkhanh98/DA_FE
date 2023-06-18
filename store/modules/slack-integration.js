export const state = () => ({
  availableChannels: [],
  savedConfig: []
});

export const mutations = {
  setAvailableChannels(state, channels) {
    state.availableChannels = channels;
  },
  setSavedConfig(state, config) {
    state.savedConfig = config;
  }
};

export const actions = {
  async sendWorklogTableToSlack() {
    return await this.$request.post("/api/v2/slack-integration/push-worklog");
  },
  async getAvailableChannels({ commit }) {
    let res = await this.$request.get("/api/v2/slack-integration/channels");
    commit("setAvailableChannels", res.data);
    return res.data;
  },
  async setProjectKeysWithChannels({ commit }, payload) {
    return await this.$request.post("/api/v2/slack-integration/channels", payload);
  },
  async getSavedConfig({ commit }) {
    let res = await this.$request.get("/api/v2/slack-integration/issue-config");
    commit("setSavedConfig", res.data);
    return res.data;
  }
};
