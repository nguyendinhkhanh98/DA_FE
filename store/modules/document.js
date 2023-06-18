export const state = () => ({
  items: [],
  item: {},
  listCategories: [],
  listTags: []
});

export const mutations = {
  setListCategories(state, data) {
    state.listCategories = data;
  },
  setListTags(state, data) {
    state.listTags = data;
  },
  setListDocument(state, data) {
    state.items = data;
  },
  setDocument(state, data) {
    state.item = data;
  }
};

export const actions = {
  // Specification
  async getAllSpec({ commit }) {
    const { data } = await this.$request.get("/api/v2/document-management/spec-type");

    // return swapped positions of requirement spec and outline spec
    return data.data.sort((a, b) => {
      if (a.id == 2 && b.id == 1) {
        return -1;
      }
    });
  },
  // Tags
  async getListTags({ commit }) {
    const { data } = await this.$request.get("/api/v2/document-management/tags");
    commit("setListTags", data.data);
  },
  async addNewTag({ commit }, payload) {
    const { data } = await this.$request.post("/api/v2/document-management/tags", payload);
    if (data.error) throw data.message;
    else return data.data;
  },
  async searchTag({ commit }, key) {
    const { data } = await this.$request.get(`/api/v2/document-management/tags/search?key=${key}`);
    return data.data;
  },
  // Category
  async getListCategories({ commit }) {
    const { data } = await this.$request.get("/api/v2/document-management/category");
    commit("setListCategories", data.data);
  },
  async updateOrCreateCategory({ commit }, payload) {
    const { data } = await this.$request.post("/api/v2/document-management/category", payload);
    if (data.error) throw data.message;
    else return data.data;
  },
  async deleteCategory({ commit }, id) {
    return await this.$request.delete(`/api/v2/document-management/category/${id}`);
  },
  // Document
  async updateOrCreateDocument({ commit }, payload) {
    const { data } = await this.$request.post("/api/v2/document-management/upload", payload);
    if (data.error) throw data.message;
    else return data.data;
  },
  async searchDocument({ commit }, payload) {
    const { data } = await this.$request.post("/api/v2/document-management/search", payload);
    commit("setListDocument", data.data);
  },
  async getLastDocNum({ commit }, id) {
    const { data } = await this.$request.get(`/api/v2/document-management/last-number?specId=${id}`);
    return data.data;
  },
  async getDocumentById({ commit }, id) {
    const { data } = await this.$request.get(`/api/v2/document-management/${id}`);
    if (data.error) throw data.message;
    else commit("setDocument", data.data);
  },
  async deleteDocument({ commit }, id) {
    return await this.$request.delete(`/api/v2/document-management/${id}`);
  }
};
