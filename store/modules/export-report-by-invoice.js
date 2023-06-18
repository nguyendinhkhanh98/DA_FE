export const state = () => ({});

export const mutations = {};

export const actions = {
  async getInvoiceReport({ commit }, payload) {
    return this.$request.post(`/api/v2/qcd-report/invoice`, payload);
  }
};
