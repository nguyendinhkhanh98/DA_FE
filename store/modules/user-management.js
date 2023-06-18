export const state = () => ({
  roleList: [],
  userList: [],
  projectList: [],
  userListOnlyName: [],
  dataFilter: {
    sorter: {
      fullName: "ascend"
    },
    filter: {
      user: [],
      role: [],
      project: [],
      isActive: true
    }
  },
  listLeader: [],
  userProjectList: [],
});

export const mutations = {
  setRoleList(state, list) {
    state.roleList = list;
  },
  setUserList(state, list) {
    state.userList = list;
  },
  setUserProjectList(state, list) {
    state.userProjectList = list;
  },
  setProjectList(state, list) {
    state.projectList = list;
  },
  setUserListOnlyName(state, list) {
    state.userListOnlyName = list;
  },
  setListLeader(state, list) {
    state.listLeader = list;
  }
};

export const actions = {
  async getUserList({ commit, dispatch }) {
    const { data } = await this.$request.get("/api/user-management");
    commit("setUserList", data);
    return data;
  },
  async getRoleList({ commit }) {
    const { data } = await this.$request.get("/api/user-management/role");
    commit("setRoleList", data);
    return data;
  },
  async createUser({ commit }, payload) {
    try {
      let formData = new FormData();
      if (payload.cv) formData.append("cv", payload.cv);
      formData.append("payload", JSON.stringify(payload));

      return await this.$request.post("/api/user-management", formData);
    } catch (error) {
      return error.response;
    }
  },
  async getUserById({ commit }, id) {
    try {
      return await this.$request.get("/api/user-management/" + id);
    } catch (error) {
      return error.response;
    }
  },
  async updateUserById({ commit }, payload) {
    try {
      let formData = new FormData();
      if (payload.cv) {
        formData.append("cv", payload.cv);
      }
      formData.append("payload", JSON.stringify(payload));

      return await this.$request.put("/api/user-management/" + payload.id, formData);
    } catch (error) {
      return error.response;
    }
  },
  async deleteUserById({ commit }, id) {
    try {
      return await this.$request.delete("/api/user-management/" + id);
    } catch (error) {
      return error.response;
    }
  },
  async getProjectList({ commit }) {
    try {
      let { data } = await this.$request.get("/api/user-management/project");
      commit("setProjectList", data);
    } catch (error) {
      return error.response;
    }
  },
  async restoreUser({ commit, state }, user_id) {
    let { data } = await this.$request.post("/api/v2/user-management/restore-user", { user_id });
    return data;
  },
  async getAllUser({ commit, state }) {
    let { data } = await this.$request.get("/api/v2/user-management/list-all-user");
    commit("setUserList", data.data);
    return data;
  },
  async getAllUserProject({ commit, state }) {
    let { data } = await this.$request.get("/api/v2/user-management/list-all-user-project");
    commit("setUserProjectList", data.data);
    return data;
  },
  async getListUserOnlyName({ commit, state }) {
    let { data } = await this.$request.get("/api/user-management/name-only");
    commit("setUserListOnlyName", data);
    return data;
  },
  async getAndFillListLeader({ commit }) {
    let { data } = await this.$request.get(`/api/v2/user-management/list-leader`);
    commit("setListLeader", data.data);
    return data;
  },
  async updateRole({ commit, state }, role) {
    let { data } = await this.$request.post(`/api/v2/user-management/role/${role.id}`, role);
    if (!data.error) {
      let roleItem = state.roleList.find(item => item.id == role.id);
      roleItem && (roleItem.name = role.name);
    }
    return data;
  },
  async deprecateRole({ commit, state }, role) {
    let { data } = await this.$request.delete(`/api/v2/user-management/role/${role.id}`);
    if (!data.error) {
      let roleItem = state.roleList.find(item => item.id == role.id);
      roleItem && (roleItem.delete_flg = true);
    }
    return data;
  },
  async restoreRole({ commit, state }, role) {
    let { data } = await this.$request.put(`/api/v2/user-management/role/${role.id}`);
    if (!data.error) {
      let roleItem = state.roleList.find(item => item.id == role.id);
      roleItem && (roleItem.delete_flg = false);
    }
    return data;
  },
  async createRole({ commit, state }, role) {
    let { data } = await this.$request.post(`/api/v2/user-management/roles`, role);
    if (!data.error) {
      state.roleList = state.roleList.concat(data.data);
    }
    return data;
  },

  async fetchATVProject({ commit, state }) {
    let { data } = await this.$request.get("/api/v2/user-management/projects");
    if (!data.error) commit("setProjectList", data.data);
    return data;
  },
  async updateProject({ commit, state }, project) {
    let { data } = await this.$request.put(`/api/v2/user-management/projects/${project.id}`, project);
    if (!data.error) {
      let projectItem = state.projectList.find(item => item.id == project.id);
      projectItem && (projectItem.name = project.name);
    }
    return data;
  },
  async deprecateProject({ commit, state }, project) {
    let { data } = await this.$request.delete(`/api/v2/user-management/projects/${project.id}`, project);
    if (!data.error) {
      let projectItem = state.projectList.find(item => item.id == project.id);
      projectItem && (projectItem.delete_flag = true);
    }
    return data;
  },
  async restoreProject({ commit, state }, project) {
    let { data } = await this.$request.put(`/api/v2/user-management/projects/${project.id}`, {
      ...project,
      delete_flag: false
    });
    if (!data.error) {
      let projectItem = state.projectList.find(item => item.id == project.id);
      projectItem && (projectItem.delete_flag = false);
    }
    return data;
  },
  async createProject({ commit, state }, project) {
    let { data } = await this.$request.post(`/api/v2/user-management/projects`, project);
    if (!data.error) {
      state.projectList = state.projectList.concat(data.data);
    }
    return data;
  }
};
