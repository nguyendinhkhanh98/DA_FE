export const state = () => ({
  listInvoiceStatus: [],
  listProjectInvoice: []
});

export const mutations = {
  setListInvoiceStatus(state, list) {
    state.listInvoiceStatus = list;
  },
  setListProjectInvoice(state, list) {
    state.listProjectInvoice = list;
  }
};

export const actions = {
  async fetchListInvoiceInProject({ commit }, project_id) {
    let { data } = await this.$request.get(`/api/v2/invoice-management/invoices/${project_id}`);
    return data;
  },
  async fetchListInvoiceStatus({ commit }) {
    let { data } = await this.$request.get(`/api/v2/invoice-management/status`);
    if (!data.error) commit("setListInvoiceStatus", data.data);
    return data;
  },
  async createInvoiceProject({ commit }, payload) {
    let { data } = await this.$request.post(`/api/v2/invoice-management/invoices`, payload);
    return data;
  },
  async updateInvoiceProject({ commit }, payload) {
    let { data } = await this.$request.post(`/api/v2/invoice-management/invoices/${payload.id}`, payload);
    return data;
  },
  async fetchListProject({ commit }) {
    let { data } = await this.$request.get(`/api/v2/invoice-management/projects`);
    if (!data.error) commit("setListProjectInvoice", data.data);
    return data;
  },
  async deleteInvoiceProject({ commit }, invoice_id) {
    let { data } = await this.$request.delete(`/api/v2/invoice-management/invoices/${invoice_id}`);
    return data;
  }
};
