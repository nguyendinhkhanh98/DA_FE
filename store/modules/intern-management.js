export const state = () => ({
  listIntern: [],
  resultSearchUser: [],
  isLoading: true,
  teamID: "",
  listSalary: [],
  timeWorks: [],
  historySalary: [],
  inforIntern: "",
  dataSourceInterns: []
});
export const mutations = {
  setListIntern(state, interns) {
    state.listIntern = interns;
  },
  setTeamID(state, teamID) {
    state.teamID = teamID;
  },
  setListInternWhenAdd(state, intern) {
    state.listIntern = [...state.listIntern, intern];
  },
  setResultSearchUser(state, users) {
    state.resultSearchUser = users;
  },
  setListSalary(state, salaries) {
    state.listSalary = salaries;
  },
  setListSalarynWhenAdd(state, intern) {
    state.listSalary = [...state.listSalary, intern];
  },
  setTimeWorks(state, timeWorks) {
    state.timeWorks = timeWorks;
  },
  setHistorySalary(state, historySalary) {
    state.historySalary = historySalary;
  },
  setInforIntern(state, intern) {
    state.inforIntern = intern;
  },
  setDataSourceIterns(state, dataSourceInterns ) {
    state.dataSourceInterns = dataSourceInterns;
  }
};
export const actions = {
  //Lấy danh sách intern trong nhóm
  async getListIntern({ commit, state }) {
    try {
      let result = await this.$request.get("/api/v2/get-list-intern");
      commit("setListIntern", result.data);
    } catch (error) {}
  },
  //Lấy thông tin của intern
  async getInternByID({ commit }, id) {
    try {
      let result = await this.$request.post("/getIntern", { id });
      commit("setInforIntern", result.data.user);
    } catch (error) {}
  },
  //Xóa intern khỏi nhóm
  async delInternFromTeam({ dispatch, commit }, id) {
    let result = await this.$request.post("/api/v2/del-intern-from-team", { id });
    return result;
  },
  //Tìm kiếm Intern theo keyword để thêm vào nhóm
  async searchUser({ commit }, { keyword }) {
    try {
      let result = await this.$request.post("/api/v2/search-user", { keyword });
      let users = result.data;
      commit("setResultSearchUser", users);
    } catch (error) {
      console.log(error.response.data.message);
    }
  },
  //Thêm intern vào nhóm
  async addInternToTeam({ dispatch, commit }, newIntern) {
    try {
      let result = await this.$request.post("/api/v2/add-intern-to-team", { newIntern });
      dispatch("getListIntern");
      return result;
    } catch (error) {
      console.log(error.response.data.message);
    }
  },
  //Lấy danh sách trợ cấp của intern
  async getSalaries({ commit, state }) {
    try {
      let result = await this.$request.get("/api/v2/get-salaries");
      commit("setListSalary", result.data);
    } catch (error) {
      console.log(error.response.data.message);
    }
  },
  //Tìm kiếm intern để thêm trợ cấp
  async searchInternToAddSalary({ commit, state }, keyword) {
    try {
      let result = await this.$request.post("/api/v2/search-intern-to-add-salary", { keyword });
      let users = result.data;
      commit("setResultSearchUser", users);
    } catch (error) {
      console.log(error.response.data.message);
    }
  },
  //Thêm trợ cấp cho intern
  async addSalaryForIntern({ dispatch, commit }, { internid, salary }) {
    try {
      let result = await this.$request.post("/api/v2/add-salary-for-intern", { internid, salary });
      return result;
    } catch (error) {
      console.log(error.response.data.message);
    }
  },
  //Cap nhat tro cap
  async updateSalaryOfIntern({ commit, dispatch }, { id, salary }) {
    try {
      let result = await this.$request.post("/api/v2/update-salary-of-intern", { id, salary });
      return result;
    } catch (error) {
      return error.response;
    }
  },
  //Xóa trợ cấp
  async deleteSalary({ dispatch, commit }, id) {
    try {
      let result = await this.$request.post("/api/v2/delete-salary", id);
      return result;
    } catch (error) {
      return error.response;
    }
  },
  //Lấy lịch làm việc của nhóm
  async getTimeWorks({ commit, state }, data) {
    try {
      let result = await this.$request.post("/api/v2/get-timeworkofteam", data);
      commit("setTimeWorks", result.data);
    } catch (error) {}
  },
  //Lấy lịch sử trợ cấp
  async getHistorySalary({ commit, state }, id) {
    try {
      let result = await this.$request.post("/api/v2/get-salary-history", id);
      let historySalary = result.data;
      commit("setHistorySalary", historySalary);
    } catch (error) {
      console.log(error.response.data.message);
    }
  },
  async updateLinkSlack({ commit }, link) {
    try {
      let result = await this.$request.post("/api/v2/update-link-slack", { link: link });
      return result;
    } catch (error) {
      return error.response;
    }
  },
  setDefaultHistorySalary({ state }) {
    state.historySalary = [];
  },

  // update time-work intern
  async updateTimeWorkIntern({ commit }, data) {
    try {
      let result = await this.$request.post("/api/v2/update-time-work-intern", data);
      return result;
    }catch(error) {
      return error.response;
    }
  },

  // delete time-work intern
  async deleteTimeWorkIntern({ commit }, id) {
    try {
      let result = await this.$request.delete(`/api/v2/delete-time-work-intern/${id}`);
      return result;
    }catch(error){
      return error.response;
    }
  }
};
