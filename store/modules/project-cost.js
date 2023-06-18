export const state = () => ({
  listProjectCostByRole: []
});

export const mutations = {
  setListProjectCostByRole(state, list) {
    state.listProjectCostByRole = list;
  }
};

export const actions = {
  async fetchListProjectCostByRole({ commit }) {
    const { data } = await this.$request.get("/api/v2/projects-cost");
    commit("setListProjectCostByRole", data.data);
    return data;
  },
  async updateProjectCost({ commit, state, rootState }, payload) {
    let param = {
      id: payload.id,
      project: payload.project_id,
      role: payload.role_id,
      cost: payload.cost
    };
    const { data } = await this.$request.post(`/api/v2/projects-cost/${payload.id}`, param);
    if (!data.error) {
      let projectCost = state.listProjectCostByRole.find(item => item.id == payload.id);
      let roleList = rootState.modules["role-project"].listRoleProject;
      let newRole = roleList.find(item => item.id == payload.role_id);

      projectCost.role = newRole.name;
      projectCost.role_id = newRole.id;
      projectCost.cost = payload.cost;
    }
    return data;
  },
  async deleteProjectCost({ commit, state }, payload) {
    const { data } = await this.$request.delete(`/api/v2/projects-cost/${payload.id}`);
    if (!data.error) {
      state.listProjectCostByRole = state.listProjectCostByRole.filter(item => item.id != payload.id);
    }
    return data;
  },
  async createProjectCost({ commit, state, rootState }, payload) {
    let param = {
      id: payload.id,
      role: payload.role_id,
      project: payload.project_id,
      cost: payload.cost
    };
    const { data } = await this.$request.post(`/api/v2/projects-cost`, param);
    if (!data.error) {
      let responseData = data.data[0];
      let projectList = rootState.modules["user-management"].projectList;
      let roleList = rootState.modules["role-project"].listRoleProject;

      let originProject = projectList.find(item => item.id == responseData.project_id);
      let originRole = roleList.find(item => item.id == responseData.role_id);

      let newProjectCost = {
        id: responseData.id,
        project: originProject?.name,
        project_id: originProject?.id,
        role: originRole?.name,
        role_id: originRole?.id,
        cost: responseData.cost
      };

      state.listProjectCostByRole.push(newProjectCost);
    }
    return data;
  },
  async expandProjectCostWithATVData({ commit, state }, payload) {
    const { data } = await this.$request.post(`/api/v2/projects-cost/expand-user-worklog`, payload);
    return data;
  },
  async updateLastestCostById({ commit }, payload) {
    return await this.$request.put(`/api/v2/projects-cost/update-cost`, payload);
  },
  async fetchProjectCostByProjectId({ commit }, projectId) {
    const { data } = await this.$request.get(`/api/v2/projects-cost/${projectId}`);
    if (!data.error) commit("setListProjectCostByRole", data.data);
    return data;
  },
  async fetchProjectByProjectId({ commit }, projectId) {
    const { data } = await this.$request.get(`/api/v2/user-management/projects/${projectId}`);
    return data;
  }
};
