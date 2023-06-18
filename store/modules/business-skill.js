export const state = () => ({
  listSkill: [],
  routeID: null,
  routeInfo: null,
  listCategory: [],
  levels: [],
  listPeriod: [],
  listUserPeriod: []
});
export const getters = {
  isDraft: state => {
    return state.routeInfo ? state.routeInfo.status == "Draft" : false;
  },
  isReject: state => {
    return state.routeInfo ? state.routeInfo.status == "Rejected" : false;
  },
  isLeader(state, getters, rootState, rootGetters) {
    if (rootState.userInfo) {
      return (
        rootState.userInfo.permissions.includes("admin") ||
        rootState.userInfo.permissions.includes("manager") ||
        rootState.userInfo.permissions.includes("leader")
      );
    } else return false;
  },
  isManager(state, getters, rootState, rootGetters) {
    if (rootState.userInfo) {
      return rootState.userInfo.permissions.includes("admin") || rootState.userInfo.permissions.includes("manager");
    } else return false;
  }
};

export const mutations = {
  setListSkill(state, list) {
    state.listSkill = list;
  },
  setBusinessSkillFlag(state, { id, flag }) {
    let skill = state.listSkill.find(item => item.skill_id == id);
    skill.skill_delete_flag = flag;
  },
  setRouteID(state, value) {
    state.routeID = value;
  },
  setRouteInfo(state, value) {
    state.routeInfo = value;
  },
  setListCategory(state, value) {
    state.listCategory = value;
  },
  setLevels(state, value) {
    state.levels = value;
  },
  setListPeriod(state, value) {
    state.listPeriod = value;
  },
  setListUserPeriod(state, value) {
    state.listUserPeriod = value;
  }
};

export const actions = {
  async fetchListBusinessSkill({ commit }, user_id) {
    let { data } = await this.$request.get("/api/v2/business-skill-set/skills", { user_id: user_id });
    return data;
  },
  async createBusinessSkill({ commit }, newSkill) {
    let { data } = await this.$request.post("/api/v2/business-skill-set/skills", newSkill);
    return data;
  },
  async archiveBusinessSkill({ commit }, skill_id) {
    let { data } = await this.$request.delete("/api/v2/business-skill-set/skills/" + skill_id);
    return data;
  },
  async restoreBusinessSkill({ commit }, skill_id) {
    let { data } = await this.$request.put("/api/v2/business-skill-set/skills/" + skill_id);
    return data;
  },
  async updateBusinessSkill({ commit }, skill) {
    let { data } = await this.$request.post(`/api/v2/business-skill-set/skills/${skill.skill_id}`, skill);
    return data;
  },
  //asessment business skill
  async getLevels({ commit }) {
    let { data } = await this.$request.get(`/api/v2/business-skill-set/levels`);
    if (!data.error) {
      commit("setLevels", data.data);
    }
  },
  async createAssessment({ commit }, payload) {
    let { data } = await this.$request.post(`/api/v2/business-skill-set/assessment`, payload);
    return data;
  },
  async updateAssessment({ commit }, payload) {
    let { data } = await this.$request.put("/api/v2/business-skill-set/assessment", payload);
    return data;
  },
  async getAvaiablePeriod({ commit }, payload) {
    let { data } = await this.$request.get("/api/v2/business-skill-set/period", payload);
    if (!data.error) {
      commit("setListPeriod", data.data);
    }
  },
  async getInfoPeriodByID({ commit }, id) {
    let { data } = await this.$request.get("/api/v2/business-skill-set/user-period/" + id);
    return data;
  },
  async fetchSkillSetToAssessment({ commit }) {
    let { data } = await this.$request.get("/api/v2/business-skill-set/skill-to-assessment");
    return data.data;
  },

  async fetchSkillSet({ commit }, { id, user_id }) {
    let { data } = await this.$request.get("/api/v2/business-skill-set/user-period/skill-of-assessment/" + id, {
      user_id: user_id
    });
    return data.data;
  },
  async FetchAllUserPeriod({ commit }) {
    let { data } = await this.$request.get("/api/v2/business-skill-set/user-period");
    commit("setListUserPeriod", data.data);
  },
  async updateLeaderById({ commit }, payload) {
    let { data } = await this.$request.put(`/api/v2/business-skill-set/leader`, payload);

    return data;
  }
};
