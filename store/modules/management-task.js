export const state = () => ({
  listTask: [],
  listSkill: [],
  listStatus: [],
  listBusinessLevel: [],
  latestAssessmentApproved: [],
  latestBusinessAssessmentApproved: [],
  listTaskHistories: [],
  isChangeTask: false
});

export const mutations = {
  setListTask(state, listTask) {
    state.listTask = listTask;
  },
  setListSkill(state, listSkill) {
    state.listSkill = listSkill;
  },
  setListBusinessSkill(state, listBusinessSkill) {
    state.listBusinessSkill = listBusinessSkill;
  },
  setListStatus(state, listStatus) {
    state.listStatus = listStatus;
  },
  setLatestAssessmentApproved(state, list) {
    state.latestAssessmentApproved = list;
  },
  setLatestBusinessAssessmentApproved(state, list) {
    state.latestBusinessAssessmentApproved = list;
  },
  setListBusinessLevel(state, list) {
    state.listBusinessLevel = list;
  },
  setListTaskHistories(state, list) {
    state.listTaskHistories = list;
  },
  setIsChangeTask(state, value) {
    state.isChangeTask = value
  }
};

export const actions = {
  async fetchListTask({ commit }) {
    let { data } = await this.$request.get("/api/v2/business-skill-set/tasks");
    commit("setListTask", data.data);
    return data;
  },
  async fetchListStatus({ commit }) {
    let { data } = await this.$request.get("/api/v2/business-skill-set/task-status");
    commit("setListStatus", data.data);
    return data;
  },
  async fetchListSkill({ commit }) {
    let { data } = await this.$request.get("/api/skill-set/category");
    commit("setListSkill", data.data);
    return data;
  },
  async archiveTask({ commit }, id) {
    let { data } = await this.$request.delete("/api/v2/business-skill-set/tasks/" + id);
    return data;
  },
  async restoreTask({ commit }, id) {
    let { data } = await this.$request.put("/api/v2/business-skill-set/tasks/" + id);
    return data;
  },
  async createTask({ commit }, newTask) {
    let { data } = await this.$request.post("/api/v2/business-skill-set/tasks", newTask);
    return data;
  },
  async updateTask({ commit }, task) {
    let { data } = await this.$request.post("/api/v2/business-skill-set/tasks/" + task.id, task);
    return data;
  },
  async getTaskByID({ commit }, id) {
    let { data } = await this.$request.get("/api/v2/business-skill-set/tasks/" + id);
    return data;
  },
  async getLatestAssessmentApproved({ commit }) {
    let { data } = await this.$request.get("/api/v2/skill-set/latest-assessment-approved");
    commit("setLatestAssessmentApproved", data.data);
    return data;
  },
  async getLatestBusinessAssessmentApproved({ commit }) {
    let { data } = await this.$request.get("/api/v2/business-skill-set/latest-assessment-approved");
    commit("setLatestBusinessAssessmentApproved", data.data);
    return data;
  },
  async fetchListBusinessLevel({ commit }) {
    let { data } = await this.$request.get("/api/v2/business-skill-set/levels");
    if (!data.error) commit("setListBusinessLevel", data.data);
    return data;
  },
  async getAllHistoryByTaskId({ commit }, taskId) {
    let { data } = await this.$request.get(`/api/v2/business-skill-set/task-history?id=${taskId}`);
    commit("setListTaskHistories", data.data);
    return data
  },
  async getAllTaskHistory({ commit }) {
    let { data } = await this.$request.get(`/api/v2/business-skill-set/task-history/view-all`);
    return data.data;
  },
  async addOrUpdateHistory({ commit }, payload) {
    let { data } = await this.$request[payload.id ? "put" : "post"](`/api/v2/business-skill-set/task-history`, payload);
    if (data.error) throw data.message;
    return data;
  },
  async removeHistory({ commit }, historyId) {
    return await this.$request.delete(`/api/v2/business-skill-set/task-history?historyId=${historyId}`);
  },
  async uploadFile({ commit }, payload) {
    return await this.$request.post(`/api/v2/files`, payload);
  },
  async getFile({ commit }, path) {
    return await this.$request.get(`/api/v2/files?path=${path}`);
  },
  async deleteFile({ commit }, path) {
    return await this.$request.delete(`/api/v2/files/${path}`);
  },
  async syncTaskWithJiraProject({ commit }, payload) {
    return await this.$request.post(`/api/v2/business-skill-set/sync`, payload);
  }
};
