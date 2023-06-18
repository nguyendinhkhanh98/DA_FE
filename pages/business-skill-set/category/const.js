export const extractSkillToCategory = listSkill => {
  let listCategory = _.uniqBy(listSkill, item => item.category_id);
  listCategory = listCategory.filter(item => item.category_id != null);
  return listCategory;
};
export const filterSkillNotNull = listSkill => {
  let listSkillFilter = listSkill.filter(item => item.skill_id);
  return listSkillFilter;
};
