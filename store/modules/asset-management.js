import _ from "lodash";
import jwtDecode from "jwt-decode";

export const state = () => ({
  listAssetType: [],
  listCompany: [],
  listStatus: [],
  listUser: [],
  listPurpose: [],
  data: [],
  listAssetByAssetType: [],
  storeLoaded: false,
  listTagColor: ["#2E6F59", "#00415A", "#00727A", "#00A482", "#84D277", "#2A314D"],
  userInfo: {},
  toggleDevice: true,
  isAdmin: false,
  appendTypeId: null,
  filterObject: {
    header: {},
    sorter: {},
    asset_type: [],
    purpose: [],
    manager: [],
    status: [],
    asset_type_name: []
  }
});

export const getters = {
  filterAsset(state, getters, rootState, rootGetters) {
    if (rootState.userInfo && rootState.userInfo.id) {
      return state.toggleDevice ? state.data.filter(item => item.manager == rootState.userInfo.fullName) : state.data;
    } else return [];
  },
  isAdminOrAssetAdmin(state, getters, rootState, rootGetters) {
    if (rootState.userInfo) {
      return rootState.userInfo.permissions.includes("admin") || rootState.userInfo.permissions.includes("asset_admin");
    } else return false;
  }
};

export const mutations = {
  //
  // ==============================> Mutations: Asset type area <=======================================
  //
  // BEGIN
  updateAssetTypeByCode(state, payload) {
    let item = _.find(state.listAssetType, item => item.id == payload.id);
    item.asset_type_name = payload.asset_type_name;
    item.asset_type_code = payload.asset_type_code;
  },
  // END
  //
  // ==============================> Asset management area <=======================================
  //
  // BEGIN
  bindManagerById(state, payload) {
    let item = _.find(state.data, item => item.id == payload.id);
    let manager = _.find(state.listUser, item => item.id == payload.manager_id);

    if (item) {
      if (payload.manager_id > 0) {
        item.manager = manager.full_name;
        item.status = "Waiting for Confirm";
      } else {
        item.manager = null;
        item.status = "InStock";
      }
    }
  }
  // END
  //
  // ==============================> XXX <=======================================
};

export const actions = {
  async fetch({ state, dispatch }) {
    let token = localStorage.getItem("token");
    state.userInfo = jwtDecode(token);

    await Promise.all([
      dispatch("fetchAssetType"),
      dispatch("fetchCompany"),
      dispatch("fetchUsers"),
      dispatch("fetchPurpose"),
      dispatch("fetchAssetByJoin"),
      dispatch("fetchStatus")
    ]);
    // state.storeLoaded = true;
  },

  async fetchCompany({ state }) {
    let { data } = await this.$request.get("/api/asset-management/asset/companies");
    if (data.success) {
      state.listCompany = [...data.data];
    }
  },

  async fetchStatus({ state }) {
    let { data } = await this.$request.get("/api/asset-management/asset/status");
    if (data.success) {
      state.listStatus = [...data.data];
    }
  },

  async fetchUsers({ state }) {
    let { data } = await this.$request.get("/api/asset-management/asset/users");
    if (data.success) {
      state.listUser = [...data.data];
    }
  },

  async fetchPurpose({ state }) {
    let { data } = await this.$request.get("/api/asset-management/asset/purposes");
    if (data.success) {
      state.listPurpose = [...data.data];
    }
  },
  async fetchAssetByAssetType({ state }, id) {
    let { data } = await this.$request.get(`/api/asset-management/asset?asset_type_id=${id}`);
    if (data.success) {
      state.listAssetByAssetType = [...data.data];
    }
  },
  async fetchAssetByJoin({ state }) {
    let { data } = await this.$request.get(`/api/asset-management/asset-by-join`);
    if (data.success) {
      state.data = [...data.data];
    }
  },
  async getAssetByID({ state }, id) {
    let { data } = await this.$request.get(`/api/asset-management/asset-by-id?id=${id}`);
    if (data.success) {
      return { ...data.data[0] };
    }
  },
  async fetchAssetType({ state }) {
    let { data } = await this.$request.get("/api/asset-management/asset-type");
    if (data.success) {
      state.listAssetType = _.map(data.data, o => {
        if (o.count == null) o.count = 0;
        return o;
      });
    }
  },

  async exportExcel({ state }, payload) {
    return this.$request.post("/api/asset-management/asset-export-excel", payload);
  },
  //
  //
  // ==============================> Actions: Asset type area <=======================================
  //
  // BEGIN
  async createAssetType({ state }, payload) {
    // Check duplicate in client
    let found = _.find(state.listAssetType, function(item) {
      let code = item.asset_type_code == payload.asset_type_code;
      let name = item.asset_type_name == payload.asset_type_name;
      return code || name;
    });

    if (found) {
      return { status: 400, data: { message: "Failed! Repeat info" } };
    } else {
      // If create new item with info don't match any element
      try {
        let { data } = await this.$request.post("/api/asset-management/asset-type", payload);
        if (data.success) {
          return { status: 200, data: { message: "Create new asset type" } };
        } else return { status: 400, data: { message: data.message } };
      } catch (error) {
        return { status: 400, data: { message: error } };
      }
    }
  },
  async updateAssetTypeByCode({ commit }, payload) {
    payload.id = parseInt(payload.id);
    let { data } = await this.$request.put("/api/asset-management/asset-type", payload);
    if (data.success) {
      // commit("updateAssetTypeByCode", payload);
      return { status: 200, data: { message: "Updated asset type" } };
    } else {
      return { status: 400, data: { message: data.message } };
    }
  },

  async deleteAssetType({ state }, payload) {
    let { data } = await this.$request.delete(
      `/api/asset-management/asset-type?id=${payload.id}&delete_flag=${payload.delete_flag}`
    );
    if (data.success) {
      if (payload.delete_flag) {
        let index = _.findIndex(state.listAssetType, o => o.id == payload.id);
        state.listAssetType.splice(index, 1);
        return { status: 200, data: { message: "Deleted asset type" } };
      } else {
        let item = _.find(state.listAssetType, o => o.id == payload.id);
        item.delete_flag = true;
        return { status: 200, data: { message: "Archived asset type" } };
      }
    } else {
      return { status: 400, data: { message: data.message } };
    }
  },
  async restoreAssetType({ commit, state }, code) {
    let code_int = parseInt(code);
    let { data } = await this.$request.post("/api/asset-management/asset-type/restore", { id: code_int });
    if (data.success) {
      let item = _.find(state.listAssetType, o => o.id == code_int);
      item.delete_flag = false;
      return { status: 200, data: { message: "Restored asset type" } };
    } else {
      return { status: 400, data: { message: data.message } };
    }
  },
  async restoreAllAssetType({ commit, state }) {
    let { data } = await this.$request.post("/api/asset-management/asset-type/restore-all");
    if (data.success) {
      _.filter(state.listAssetType, o => {
        o.delete_flag = false;
        return o;
      });
      return { status: 200, data: { message: "Restored all asset type" } };
    } else {
      return { status: 400, data: { message: data.message } };
    }
  },
  // END
  //
  // ==============================> Asset management area <=======================================
  //
  // BEGIN
  async createAsset({ commit, state }, payload) {
    let { data } = await this.$request.post("/api/asset-management/asset", payload);
    return { status: 200, data: { message: "Add new Asset", id: data.data.id } };
  },
  async updateAssetById({ commit }, payload) {
    let { data } = await this.$request.put("/api/asset-management/asset", payload);
    if (data.success) {
      return { status: 200, data: { message: "Update successful" } };
    } else {
      return { status: 400, data: { message: data.message } };
    }
  },
  async deleteAssetById({ commit, state }, payload) {
    let { data } = await this.$request.delete(`/api/asset-management/asset?id=${payload.id}`);

    if (data.success) {
      _.remove(state.data, item => item.id == payload.id);
      return { status: 200, data: { message: "Delete successful" } };
    } else {
      return { status: 400, data: { message: data.message } };
    }
  },
  async bindManagerById({ commit, dispatch }, value) {
    let payload = {
      manager_id: parseInt(value.manager_id),
      id: value.id,
      asset_code: value.asset_code
    };
    let { data } = await this.$request.post(`/api/asset-management/asset/bind`, payload);
    if (data.success) {
      commit("bindManagerById", payload);
      dispatch("fetch");
      return { status: 200, data: { message: "Bind manager successful" } };
    } else {
      return { status: 400, data: { message: data.message } };
    }
  },
  async changeStatus({ commit, state }, payload) {
    let { data } = await this.$request.post(`/api/asset-management/asset/change-status`, payload);
    if (data.success) {
      let item = _.find(state.data, o => o.id == payload.id);
      item.status_id = payload.status_id;
      let status = _.find(state.listStatus, o => o.id == payload.status_id);
      item.status = status.name;
      return { status: 200, data: { message: "Change status successful" } };
    } else {
      return { status: 400, data: { message: data.message } };
    }
  },
  async getStatusByID({ commit, state }, payload) {
    let { data } = await this.$request.get(`/api/asset-management/asset/status-by-id?id=${payload.id}`);
    if (data.success) {
      return { status: 200, data: data.data };
    } else {
      return { status: 400, data: { message: data.message } };
    }
  },
  toggleDevice({ state }) {
    state.toggleDevice = !state.toggleDevice;
  },
  changeFilterObject({ state }, param) {
    state.filterObject[param.key] = param.value;
  },
  setHeaderFilter({ state }, param) {
    state.filterObject.header[param.key] = param.value;
  },
  setSorter({ state }, param) {
    state.filterObject.sorter[param.key] = param.value;
  },
  refreshAsset({ state }, param) {
    let item = _.find(state.listAssetByAssetType, o => o.id == param.id);
    let status = _.find(state.listStatus, o => o.id == param.status_id);
    item.status = status.name;
    item.status_id = param.status_id;
    item.status_comment = param.comment;
  }
};
