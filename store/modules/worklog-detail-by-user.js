const _ = require("lodash");

export const state = () => ({
  userWorklogs: [],
  uniqueInstances: [],
  summaryWorklogsInMonth: [],
  userWorkdaysByProjectInMonth: []
});

export const mutations = {
  setUserWorklogs(state) {
    state.uniqueInstances = state.userWorklogs
      .filter(
        (wl, index, self) =>
          index ===
          self.findIndex(
            s => s.started.substr(0, 10) === wl.started.substr(0, 10) && s.author.displayName === wl.author.displayName
          )
      )
      .map(date => ({ date: date.started.substr(0, 10), member: date.author.displayName }));
    state.uniqueInstances = state.uniqueInstances.map(instance => {
      let _worklogs = state.userWorklogs.filter(
        wl => wl.started.substr(0, 10) == instance.date && wl.author.displayName == instance.member
      );
      return {
        ...instance,
        worklogs: _worklogs,
        totalSpentTimeSecs: _worklogs.map(item => item.timeSpentSeconds).reduce((prev, next) => prev + next)
      };
    });
  },
  concatWorklogs(state, worklogs) {
    state.userWorklogs = state.userWorklogs.concat(worklogs);
  },
  resetWorklogs(state) {
    state.userWorklogs = [];
  },
  setWorklogs(state, worklogs) {
    state.userWorklogs = worklogs;
  },

  setSummaryWorklogByProjectInMonth(state, listProjectName) {
    state.summaryWorklogsInMonth = [];
    console.log("listProjectName", listProjectName)
    console.log("state.userWorklog", state.userWorklogs);
    listProjectName.forEach(projectName => {
      let listUserWorklogs = state.userWorklogs
        .filter(item => item.projectName == projectName)
        .map(userWorklog => ({
          username: userWorklog.author.displayName,
          projectName: userWorklog.projectName,
          actualWorkDay: ((userWorklog.timeSpentSeconds)/86400),
          rateJoin: ((userWorklog.timeSpentSeconds)/(86400*(userWorklog.workDay))*100)
        }))
      let arr = _.groupBy(listUserWorklogs, 'username');
      let listUserWorklogsDetail = [];
      for( var username in arr ) {
        let userWorklogsDetail = {
          name: username,
          roleProject: "PG",
          projectName: arr[username][0].projectName,
          actualWorkDay: arr[username].map(item => parseFloat(item.actualWorkDay)).reduce((prev, next) => prev + next, 0).toFixed(2),
          rateJoin: arr[username].map(item => parseFloat(item.rateJoin)).reduce((prev, next) => prev + next, 0).toFixed(2)
        }
        listUserWorklogsDetail.push(userWorklogsDetail)
      }
      state.summaryWorklogsInMonth.push({
        projectName: projectName,
        totalSpentTimeSecs: state.userWorklogs.filter(item => item.projectName == projectName)?.map(item => item.timeSpentSeconds).reduce((prev, next) => prev + next, 0) ?? 0,
        actualWorkDay: (state.userWorklogs.filter(item => item.projectName == projectName)?.map(item => item.timeSpentSeconds).reduce((prev, next) => prev + next, 0)/86400).toFixed(2) ?? 0,
        rateJoin: (state.userWorklogs.filter(item => item.projectName == projectName)?.map(item => item.timeSpentSeconds).reduce((prev, next) => prev + next, 0)/(86400*20)*100).toFixed(2) ?? 0,
        userWorkdaysByProjectInMonth: listUserWorklogsDetail
      })
    })
    console.log("summaryWorklogsInMonth", state.summaryWorklogsInMonth);
  }
};

export const actions = {
  async getUserWorklogs({ commit }, payload) {
    const { data } = await this.$request.post("api.getUserWorklogs", payload);
    // commit("setUserWorklogs", data);
    commit("concatWorklogs", data);
    return data;
  },
  async getUserWorkdaysByProjectInMonth({ commit }, payload) {
    const { data } = await this.$request.post("/api/get-sum-user-workdays-by-project", payload);
    commit("concatWorklogs", data);
    console.log("data", data)
    return data;
  },
  async saveUserWorkdaysByProjectInMonth({ commit }, payload) {
    const { data } = await this.$request.post("/api/get-sum-user-workdays-by-project", payload);
    return data;
  }
};
