import { extractCategoryFromSourceCompare } from "@/utils/skillSet/skillSet.utils";

export const state = () => ({
  levels: [],
  listPeriod: [],
  latestTypeGetPeriod: null,
  listUserPeriod: [],
  listSkill: {},
  listSkillConfigure: [],
  skillSet: [],
  listUserOnlyName: [],
  dataFilter: {
    sorter: {
      created_at: "ascend"
    },
    filter: {
      period_name: [],
      status: [],
      leader: [],
      user_created: []
    },
    pagination: {
      pageSize: 20,
      total: 0,
      current: 0
    },
    period: {
      sorter: {
        created_at: "ascend"
      },
      filter: {
        period_name: [],
        status: ["active"]
      }
    }
  },
  routeID: null,
  routeInfo: null,
  isDraft: false,
  listLeader: [],
  listCompareSkillSet: [],
  listUserPeriodCompare: [],
  listSkillTag: [],
  listUsers: []
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
  },
  levelSkill: state => {
    return state.levels.filter(item => item.type == "skill");
  },
  levelEnglish: state => {
    return state.levels.filter(item => item.type == "fl");
  }
};

export const mutations = {
  setListPeriod(state, list) {
    state.listPeriod = list;
  },
  setListUserPeriod(state, list) {
    state.listUserPeriod = list;
  },
  setSkillSet(state, list) {
    state.skillSet = list;
  },
  setListSkill(state, list) {
    state.listSkill = list;
  },
  setListUserOnlyName(state, list) {
    state.listUserOnlyName = list;
  },
  setLevels(state, list) {
    state.levels = list;
  },
  setRouteID(state, value) {
    state.routeID = value;
  },
  setRouteInfo(state, value) {
    state.routeInfo = value;
  },
  setDraftState(state, value) {
    state.isDraft = value;
  },
  setListLeader(state, list) {
    state.listLeader = list;
  },
  setUserCreatedByValue(state, value) {
    state.dataFilter.filter.user_created = [...value];
  },
  setListSkillConfigure(state, list) {
    state.listSkillConfigure = list;
  },
  setListCompareSkillSet(state, list) {
    state.listCompareSkillSet = list;
  },
  setListUserPeriodCompare(state, list) {
    state.listUserPeriodCompare = list;
  },
  setListSkillTag(state, list) {
    state.listSkillTag = list;
  },
  setListUser(state, data) {
    state.listUsers = data;
  }
};

export const actions = {
  async FetchAllUserPeriod({ commit }) {
    let { data } = await this.$request.get(`/api/skill-set/user-period/all`);
    if (data.success) {
      commit("setListUserPeriod", data.data);
    } else console.log(data);
  },
  async FetchPeriod({ state, commit }, payload) {
    if (payload.type == "empty" || payload.type != state.latestTypeGetPeriod) {
      state.latestTypeGetPeriod = payload.type;
      let { data } = await this.$request.get(`/api/skill-set/period`, payload);
      if (data.success) {
        commit("setListPeriod", data.data);
      } else console.log(data);
    }
  },
  async getAllPeriod({ commit }) {
    let { data } = await this.$request.get(`/api/skill-set/all-period`);
    if (data.success) {
      commit("setListPeriod", data.data);
    } else console.log(data);
  },
  async GetInfoPeriodByID({ state }, id) {
    let { data } = await this.$request.get(`/api/skill-set/user-period/${id}`);
    if (data.success) {
      return data.data ? data.data[0] : null;
    } else console.log(data);
  },
  async FetchSkillSet({ commit }, payload) {
    commit("setSkillSet", []);

    let { data } = await this.$request.get("/api/skill-set", payload);
    if (data.success) {
      let category = _.uniq(_.map(data.data, item => item.category));

      let result = category.map(c => {
        let categorySkill = data.data.filter(item => item.category == c);
        categorySkill = categorySkill.map(skillItem => {
          if (!skillItem.level_review) skillItem.level_review = skillItem.level;
          return skillItem;
        });

        let info = {
          name: categorySkill[0].category,
          description: categorySkill[0].category_description,
          skills: categorySkill
        };
        return info;
      });

      commit("setSkillSet", result);
    } else console.log(data);
    return 1;
  },
  async FetchSkill({ commit }, payload) {
    let { data } = await this.$request.get("/api/skill-set/skill", payload);
    if (data.success) {
      let result = {};
      let category = _.uniq(_.map(data.data, item => item.category));

      _.map(category, c => {
        let temp = _.filter(data.data, item => item.category == c);
        result[c] = temp;
      });

      commit("setListSkill", result);
      return data.data;
    } else console.log(data);
  },
  async GetListUser({ commit }) {
    let { data } = await this.$request.get(`/api/user-management/name-only`);
    if (data) {
      commit("setListUserOnlyName", data);
    } else console.log("Error when call api get name only user", data);
  },
  async CreateNewPeriod({ state }, payload) {
    let { data } = await this.$request.post(`/api/skill-set/period`, payload);
    return data;
  },
  async UpdatePeriod({ state }, payload) {
    let { data } = await this.$request.put(`/api/skill-set/period`, payload);
    return data;
  },
  async DeletePeriod({ state }, payload) {
    let { data } = await this.$request.delete(`/api/skill-set/period`, payload);
    return data;
  },
  async restorePeriod({ state }, payload) {
    let { data } = await this.$request.put(`/api/skill-set/restore-period`, payload);
    return data;
  },
  async CreateSkillSet({ commit }, payload) {
    let { data } = await this.$request.post(`/api/skill-set`, payload);
    return data;
  },
  async UpdateSkillSet({ commit }, payload) {
    let { data } = await this.$request.put(`/api/skill-set`, payload);
    return data;
  },
  async CommitDraftSkillSet({ commit }, payload) {
    let { data } = await this.$request.post(`/api/skill-set/draft`, payload);
    return data;
  },
  async UpdateDraftSkillSet({ commit }, payload) {
    let { data } = await this.$request.put(`/api/skill-set/draft`, payload);
    return data;
  },
  async RejectSkillSet({ commit }, payload) {
    let { data } = await this.$request.post(`/api/skill-set/reject`, payload);
    return data;
  },
  async ExportSkillSet({ commit }, payload) {
    return this.$request.post("/api/skill-set/export", payload);
  },
  async FetchCategory({ commit }) {
    let { data } = await this.$request.get(`/api/skill-set/category`);
    return data;
  },
  async GetLevels({ commit }, id) {
    let { data } = await this.$request.get(`/api/skill-set/levels`);
    if (data.success) {
      commit("setLevels", data.data);
    } else console.log(data);
  },
  async UpdateCategory({ commit }, payload) {
    let { data } = await this.$request.put(`/api/skill-set/category`, payload);
    return data;
  },
  async CreateCategory({ commit }, payload) {
    let { data } = await this.$request.post(`/api/skill-set/category`, payload);
    return data;
  },
  async DeleteCategory({ commit }, payload) {
    let { data } = await this.$request.delete(`/api/skill-set/category`, payload);
    return data;
  },
  async CreateSkill({ commit }, payload) {
    let { data } = await this.$request.post(`/api/skill-set/skill`, payload);
    return data;
  },
  async UpdateSkill({ commit }, payload) {
    let { data } = await this.$request.put(`/api/skill-set/skill`, payload);
    return data;
  },
  async getAndFillListLeader({ commit }) {
    let { data } = await this.$request.get(`/api/v2/user-management/list-leader`);
    console.log(data.data)
    commit("setListLeader", data.data);
    return data;
  },
  async fetchAndFillSkillConfigure({ state, commit }) {
    let { data } = await this.$request.get(`/api/skill-set/skill-configure`);

    let listSkill = data.data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.skill_description,
      category: item.category,
      category_id: item.category_id,
      delete_flag: item.skill_delete_flag,
      tag: item.tag
    }));
    listSkill = listSkill.sort((a, b) => a?.name?.localeCompare(b?.name));

    commit("setListSkillConfigure", listSkill);
  },
  async exportSumarrySkillSetByUserId({ commit }, payload) {
    return this.$request.post(`/api/skill-set/export-lastest`, payload);
  },
  async exportSkillSetByUserId({ commit }, payload) {
    return this.$request.post(`/api/skill-set/export-sumarry-by-user`, payload);
  },
  async getSkillSetCompare({ commit }, payload) {
    let { data } = await this.$request.post(`/api/v2/skill-set/source-user-compare`, payload);
    if (!data.error) {
      let { sourceSkillSet, targetSkillSet } = data.data;
      let rebuild = extractCategoryFromSourceCompare(sourceSkillSet, targetSkillSet);
      commit("setListCompareSkillSet", rebuild);
    } else console.log(data);
  },
  async getListUserPeriodCompare({ commit }) {
    let { data } = await this.$request.get(`/api/v2/skill-set/list-user-period-compare`);

    if (!data.error) {
      commit("setListUserPeriodCompare", data.data);
    }
  },
  async fetchSkillTag({ commit }) {
    let { data } = await this.$request.get(`/api/v2/skill-set/tags`);

    if (!data.error) {
      commit("setListSkillTag", data.data);
    }

    return data;
  },
  async updateSkillTag({ commit }, tag) {
    let { data } = await this.$request.put(`/api/v2/skill-set/tags/${tag.id}`, tag);
    return data;
  },
  async deleteSkillTag({ commit }, tag) {
    let { data } = await this.$request.delete(`/api/v2/skill-set/tags/${tag.id}`);
    return data;
  },
  async createSkillTag({ commit, state }, tag) {
    let { data } = await this.$request.post(`/api/v2/skill-set/tags`, tag);
    if (!data.error) {
      let newListTag = state.listSkillTag.concat(data.data);
      commit("setListSkillTag", newListTag);
    }
    return data;
  },
  async getAllDevUser({ commit }) {
    let { data } = await this.$request.get(`/api/skill-set/all-user`);

    if (!data.error) {
      commit("setListUser", data.data);
    }
  },
  async updateLeaderById({ commit }, payload) {
    let { data } = await this.$request.put(`/api/skill-set/leader`, payload);

    return data;
  }
};
