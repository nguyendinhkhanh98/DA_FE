export const state = () => ({
  issueList: [],
  allProject: [],
  recentProject: [],
  statusList: [],
  assigneeList: [],
  issueTypeList: [],
  sprintList: [],
  issueChartList: {},
  qcd: {
    loading: false,
    refresh: false,
    data: null
  },
  issueBugDetail: [],
  issueOverEstimate: [],
  issueOverDueDate: [],
  issueDegrate: [], 
  emailList: [],
});

export const mutations = {
  setIssueList(state, issueList) {
    state.issueList = issueList;
  },
  setIssueChartList(state, list) {
    state.issueChartList = list;
  },
  getAllProject(state, list) {
    state.allProject = list;
  },
  getRecentProject(state, list) {
    state.recentProject = list;
  },
  setStatusForProjectList(state, list) {
    state.statusList = list;
  },
  setAssigneeList(state, list) {
    state.assigneeList = list;
  },

  setEmailList(state, list) {
    state.emailList = list.map(item => item.emailAddress).filter(item => item !== "");
  },

  setIssueTypeList(state, list) {
    state.issueTypeList = list;
  },
  setSprintList(state, list) {
    state.sprintList = list;
  },
  setQCD_KPI(state, list) {
    state.qcd.data = list;
    state.qcd.loading = false;
  },
  setRefreshQCD(state, value) {
    state.qcd.refresh = value;
    if (value) {
      state.issueBugDetail = [];
      state.issueOverEstimate = [];
      state.issueOverDueDate = [];
      state.issueDegrate = [];
    }
  },
  setIssueBugDetail(state, value) {
    state.issueBugDetail = value;
  },
  setIssueOverEstimate(state, value) {
    state.issueOverEstimate = value;
  },
  setIssueOverDueDate(state, value) {
    state.issueOverDueDate = value;
  },
  setIssueDegrate(state, value) {
    state.issueDegrate = value;
  }
};

export const actions = {
  // issue
  exportJiraQcdReport({ commit }, payload) {
    return this.$request.post("/api/v2/qcd-report/summary", payload);
  },
  exportOriginData({ commit }, payload) {
    return this.$request.post("/api/v2/qcd-report/origin", payload);
  },
  getIssueList({ commit }, payload) {
    return this.$request.post("api.issue.index", payload);
  },
  getCountIssueList({ commit }, payload) {
    return this.$request.post("api.issue.count", payload);
  },
  async getIssueChartList({ commit }, payload) {
    const { data } = await this.$request.post("/api/issue/type-for-chart", payload);
    commit("setIssueChartList", data);
    return data;
  },
  async getQCD_KPI({ state, commit }, payload) {
    state.qcd.loading = true;
    const { data } = await this.$request.post("/api/v2/qcd-report/kpi", payload);
    commit("setQCD_KPI", data);
    return data;
  },

  // project
  async getProjectList({ commit }, payload) {
    const { data } = await this.$request.get("api.project.index", payload);
    commit("getAllProject", data.data);
    return data;
  },
  async getStatusForProjectList({ commit }, payload) {
    const { data } = await this.$request.get("api.issue.status", payload);
    commit("setStatusForProjectList", data.data);
    return data;
  },
  async getAllUsersAssignableToProjects({ commit }, payload) {
    const { data } = await this.$request.get("api.issue.user.assignable", payload);
    commit("setAssigneeList", data.data);
    return data;
  },
  // async getAllJiraEmailInProject({ commit }, payload) {
  //   const { data } = await this.$request.get("/api/issue/email/assignable", payload);
  //   commit("setEmailList", data.data);
  //   return data;
  // },

  async getUsersAssignableInProject({ commit }, payload) {
    // const { data } = await this.$request.get("api.issue.email.assignable", payload);
    const { data } = await this.$request.get("/api/issue/user-project/assignable", payload);
    commit("setEmailList", data.data);
    return data;
  },

  async getAllIssueTypesToProjects({ commit }, payload) {
    const { data } = await this.$request.get("api.issue.createmeta", payload);
    commit("setIssueTypeList", data.data);
    return data;
  },
  async getAllSprintToProjects({ commit }, payload) {
    const { data } = await this.$request.get("api.sprint", payload);
    commit("setSprintList", data.data);
    return data;
  },
  async resetData({ state }) {
    state.issueChartList = {};
    state.issueList = [];
    state.qcd.data = null;
  },
  async exportQCDToPDF({ state }, payload) {
    const { data } = await this.$request.post("/api/export/qcd-pdf", payload);
    return data;
  },
  async getIssueBugDetail({ state, commit }, payload) {
    const { data } = await this.$request.post("/api/v2/qcd-report/bug-detail", payload);

    if (!data.error) return data.data;
    else console.log(data);
  },
  async getIssueOverEstimate({ state, commit }, payload) {
    const { data } = await this.$request.post("/api/v2/qcd-report/issues-over-estimate", payload);

    if (!data.error) return data.data;
    else console.log(data);
  },
  async getIssueOverDueDate({ state, commit }, payload) {
    const { data } = await this.$request.post("/api/v2/qcd-report/issues-over-duedate", payload);

    if (!data.error) return data.data;
    else console.log(data);
  },
  async getIssueDegrate({ state, commit }, payload) {
    const { data } = await this.$request.post("/api/v2/qcd-report/issues-degrate", payload);

    if (!data.error) return data.data;
    else console.log(data);
  }
};
