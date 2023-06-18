export const state = () => ({
  listRoleProject: [],
  usersInProject: []
});

export const mutations = {
  setListRoleProject(state, list) {
    state.listRoleProject = list;
  },
  setUsersInProject(state, users) {
    state.usersInProject = users;
  }
};

export const actions = {
  async fetchListRoleProject({ commit }) {
    let { data } = await this.$request.get("/api/v2/roles-project");
    if (!data.error) commit("setListRoleProject", data.data);
    return data;
  },
  async createRoleProject({ commit, state }, payload) {
    let { data } = await this.$request.post("/api/v2/roles-project", payload);
    if (!data.error) {
      state.listRoleProject = state.listRoleProject.concat(data.data);
    }
    return data;
  },
  async updateRoleProject({ commit, state }, payload) {
    let { data } = await this.$request.put(`/api/v2/roles-project/${payload.id}`, payload);
    if (!data.error) {
      let roleProject = state.listRoleProject.find(item => item.id == payload.id);
      roleProject.name = payload.name;
      roleProject.delete_flag = payload.delete_flag;
      roleProject.description = payload.description;
      roleProject.monthly_salary = payload.monthly_salary;
    }
    return data;
  },
  async fetchListUserRoleProjectByProjectId({ commit }, project_id) {
    let { data } = await this.$request.get("/api/v2/user-role-projects", { project_id });
    commit("setUsersInProject", data.data);
    return data;
  },
  async createUserRoleProjectByProjectId({ commit }, payload) {
    let { data } = await this.$request.post("/api/v2/user-role-projects", payload);
    return data;
  },
  async createUserJiraProject({ commit }, payload) {
    let { data } = await this.$request.post("/api/v2/user-jira", payload);
    return data;
  },
  async updateUserRoleProject({ commit }, payload) {
    let { data } = await this.$request.post(`/api/v2/user-role-projects/${payload.id}`, payload);
    return data;
  },
  async deleteUserRoleProject({ commit }, payload) {
    let { data } = await this.$request.delete(`/api/v2/user-role-projects/${payload.id}`);
    return data;
  }
};
