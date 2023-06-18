export const state = () => ({
  listJiraProject: [],
  aggregateProjectListFromAllURLs: []
});

export const mutations = {
  setJiraProject(state, list) {
    state.listJiraProject = list;
  },
  setAggregateProjectListFromAllURLs(state, list) {
    state.aggregateProjectListFromAllURLs = list;
  }
};

export const actions = {
  async getAllJiraProject({ commit }) {
    const { data } = await this.$request.get("/api/v2/jira-project/projects");

    if (!data.error) commit("setJiraProject", data.data);
    return data.data;
  },
  async createJiraProject({ state, commit }, project) {
    const { data } = await this.$request.post(`/api/v2/jira-project/projects`, project);

    if (!data.error) {
      state.listJiraProject.push(data.data);
    }

    return data;
  },
  async updateJiraProject({ state, commit }, project) {
    const { data } = await this.$request.put(`/api/v2/jira-project/projects/${project.id}`, project);

    return data;
  },
  async deleteJiraProject({ state, commit }, project_id) {
    const { data } = await this.$request.delete(`/api/v2/jira-project/projects/${project_id}`);

    if (!data.error) {
      let newJiraProject = state.listJiraProject.filter(item => item.id != project_id);
      commit("setJiraProject", newJiraProject);
    }
    return data;
  },
  async updateSortOrderJiraProject({ state, commit }, payload) {
    const { data } = await this.$request.put(`/api/v2/jira-project/sort-order`, payload);
    return data;
  },
  async getProjectList({ commit }, payload) {
    const { data } = await this.$request.get("/api/project", payload);
    return data;
  },
  async getAggregateProjectListFromAllURLs({ state, commit, dispatch }) {
    if (!state.listJiraProject.length) await dispatch("getAllJiraProject");
    let listDraftProject = await Promise.all(
      state.listJiraProject.map(project => {
        return dispatch("getProjectList", { jiraUrl: project.url });
      })
    );

    // Add jiraUrl to each project
    for (let index = 0; index < state.listJiraProject.length; index++) {
      const project = state.listJiraProject[index];
      listDraftProject[index].data.forEach(item => (item.jiraUrl = project.url));
    }

    // Rebuild list project with jiraUrl attached
    listDraftProject = listDraftProject.map(item => item.data);
    let listProject = [];
    listDraftProject.forEach(project => (listProject = listProject.concat(project)));

    commit("setAggregateProjectListFromAllURLs", listProject);
  }
};
