export const actions = {
  changePassword({ commit }, password) {
    return this.$request.post("/api/password/change", password);
  }
};
