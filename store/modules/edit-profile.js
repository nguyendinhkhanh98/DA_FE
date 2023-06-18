export const actions = {
  async getProfile({ commit }) {
    const { data } = await this.$request.get("/api/profile");
    return data;
  },
  async editProfile({ commit, dispatch }, payload) {
    try {
      let formData = new FormData();
      if (payload.cv) {
        formData.append("cv", payload.cv);
      }
      formData.append("payload", JSON.stringify(payload));

      const response = await this.$request.put("/api/profile/edit", formData);
      return response;
    } catch (error) {
      return error.response;
    }
  }
};
