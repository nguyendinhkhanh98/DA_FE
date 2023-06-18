export const state = () => ({
  listCategory: [],
  skillEdited: []
});

export const mutations = {
  setListCategory(state, list) {
    state.listCategory = list;
  },
  setSkillEdited(state, skill) {
    let findSkill = state.skillEdited.find(item => item.skill_id == skill.skill_id);
    if (findSkill) {
      findSkill.category_id = skill.category_id;
    } else state.skillEdited = [...state.skillEdited, skill];
  },
  clearSkillEdited(state) {
    state.skillEdited = [];
  }
};

export const actions = {
  async createCategory({ commit }, newCategory) {
    let { data } = await this.$request.post("/api/v2/business-skill-set/categories", newCategory);
    return data;
  },
  async deleteCategory({ commit }, id) {
    let { data } = await this.$request.delete("/api/v2/business-skill-set/categories/" + id);
    return data;
  },
  async updateCategoryBusinessSkill({ commit }, edited) {
    let { data } = await this.$request.put("/api/v2/business-skill-set/categories", edited);
    return data;
  }
};
