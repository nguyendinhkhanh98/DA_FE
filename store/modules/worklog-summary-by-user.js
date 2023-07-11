import moment from "moment";
import _ from "lodash";

export const state = () => ({
  allProject: [],
  userList: [],
  allArrowProject: [],
  dataSource: [],
  duration: {
    startDate: moment()
      .subtract(1, "weeks")
      .startOf("isoWeek"),
    endDate: moment()
      .subtract(1, "weeks")
      .endOf("isoWeek")
  },
  gotoCurrentValue: 1,
  evaluateTaskData: [],
  userTaskEvaluate: []
});

export const mutations = {
  setAllProject(state, list) {
    state.allProject = list;
  },
  setUserList(state, list) {
    state.userList = list;
  },
  setAllProjectArrow(state, list) {
    state.allArrowProject = list;
  },
  setDataSource(state, list) {
    state.dataSource = list;
  },
  setDayTrackingForWeek(state, { startDate, endDate }) {
    state.duration.startDate = startDate;
    state.duration.endDate = endDate;
  },
  setCurrentValueTrigger(state, value) {
    state.gotoCurrentValue = value;
  },
  setEvaluateTaskData(state, value) {
    state.evaluateTaskData = value;
  },
  setUserTaskEvaluate(state) {
    state.userTaskEvaluate = state.evaluateTaskData.map((item, index) => {
      const allTaskOntime = item?.filter(i => i?.status == 'done' && moment(i?.updated_at).isBefore(i?.end_date))?.length
      const general = {
        fullName: item?.[0].fullName || '-',
        allTask: item?.length || 0,
        pointEvaluate: 0,
        allTaskOntime
      }
      const worklogs = state.evaluateTaskData?.[index]
      let worklogsNew = Object.values(_.groupBy(worklogs, 'projectId'))
      worklogsNew = worklogsNew.map((item) => {
        const countTaskOntime = item?.filter(i => i?.status == 'done' && moment(i?.updated_at).isBefore(i?.end_date))?.length
        const totalTask = item?.length || 0
        return {
          countTaskOntime,
          totalTask,
          projectName: item?.[0]?.projectName || '-',
          roleName: item?.[0]?.roleName || '-'
        }
      })
      console.log('worklogsNew', worklogsNew)
      return {
        ...general,
        worklogs: worklogsNew
      }
    })
  }
};

export const actions = {
  async getProjectList({ commit }, payload) {
    const { data } = await this.$request.get("api.project.index", payload);
    payload ? commit("getRecentProject", data.data) : commit("setAllProject", data.data);
    return data;
  },
  async getAllUsersToProject({ commit }, payload) {
    const { data } = await this.$request.post("/api/worklog/user-in-company", payload);
    commit("setUserList", data.data);
    return data;
  },
  async getWorklog({ commit }, payload) {
    const { data } = await this.$request.post("/api/time-sheet-user", payload);
    return data;
  },
  async getAllProjectArrow({ commit }, payload) {
    const { data } = await this.$request.post("/api/arrow-all-project", payload);
    commit("setAllProjectArrow", data);
    return data;
  },
  async exportMonthlyReport({ commit }, payload) {
    return this.$request.post("/api/monthly-report", payload);
  },
  async getAllEvaluateTask({ commit, state }, payload) {
    console.log('payload', payload)
    let { data } = await this.$request.get(`/api/v2/evaluate-task?since=${payload?.since}&until=${payload?.until}`);
    console.log('data', data)
    if (!data.error) {
      // commit("setEvaluateTaskData", data.data);
      state.evaluateTaskData = data.data
    }
    console.log('state.evaluateTaskData', state.evaluateTaskData)
    return data;
  }
};
