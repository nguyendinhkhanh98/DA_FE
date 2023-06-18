// flagCustomTitle == 1 => using i18n
// flagCustomTitle == 2 => using primitive
// flagCustomTitle == 3 => using custom slot

export const columns = [
  {
    slots: { title: "period_name" },
    dataIndex: "period_name",
    key: "period_name",
    width: "15%",
    defaultChecked: true,
    flagCustomTitle: 3
  },
  {
    slots: { title: "leader" },
    dataIndex: "leader",
    key: "leader",
    width: "25%",
    defaultChecked: true,
    flagCustomTitle: 3
  },
  {
    slots: { title: "user_created" },
    dataIndex: "user_created",
    key: "user_created",
    width: "30%",
    defaultChecked: true,
    flagCustomTitle: 3
  },
  {
    slots: { title: "created_at" },
    dataIndex: "created_at",
    key: "created_at",
    scopedSlots: { customRender: "created_at" },
    width: "10%",
    defaultChecked: true,
    flagCustomTitle: 1
  },
  {
    slots: { title: "status" },
    dataIndex: "status",
    key: "status",
    scopedSlots: { customRender: "status" },
    width: "10%",
    defaultChecked: true,
    flagCustomTitle: 3
  },
  {
    slots: { title: "" },
    key: "detail",
    dataIndex: "id",
    scopedSlots: { customRender: "detail" },
    width: "10%",
    defaultChecked: true,
    flagCustomTitle: 1
  }
];

export const levels = [
  {
    id: 0,
    name: "Level 0 (Novice)"
  },
  {
    id: 1,
    name: "Level 1 (Advanced Novice)"
  },
  {
    id: 2,
    name: "Level 2 (Completent)"
  },
  {
    id: 3,
    name: "Level 3 (Proficient)"
  },
  {
    id: 4,
    name: "Level 4 (Except)"
  }
];

export const mapColorTag = function(text) {
  switch (text) {
    case "Waiting for review":
    case "Wait for Review":
      return "#ffc107";
    case "Approved":
      return "#4dbd74";
    case "Open":
      return "#525263";
    case "Draft":
      return "#C3C3C3";
    case "Rejected":
      return "#A22727";
  }
};

export const listStatus = [
  { text: "Wait for Review", value: "Wait for Review" },
  { text: "Approved", value: "Approved" },
  { text: "Open", value: "Open" },
  { text: "Draft", value: "Draft" },
  { text: "Rejected", value: "Rejected" }
];
export const extractSkillToCategory = (listSkill, isHiddenSkillNotFill) => {
  let listCategory = _.uniqBy(listSkill, item => item.category_id);
  listCategory = listCategory.filter(item => item.category_id != null);

  listSkill = listSkill.filter(
    item =>
      item.skill_id &&
      !item.skill_delete_flag &&
      item.category_id &&
      (isHiddenSkillNotFill ? item.experience_time != undefined : true)
  );

  let skillInCategory = [];
  listSkill.forEach(item => {
    if (!skillInCategory[item.category_id]) {
      skillInCategory[item.category_id] = [];
    }
    skillInCategory[item.category_id] = [
      ...skillInCategory[item.category_id],
      {
        category: item.category_name,
        skill_name: item.skill_name,
        skill_id: item.skill_id,
        experience_time: item.experience_time,
        level: item.level,
        level_review: item.level_review ? item.level_review : item.level,
        note: item.note,
        last_level: item.last_level,
        last_experience_time: item.last_experience_time
      }
    ];
  });
  listCategory = listCategory.map(item => {
    if (skillInCategory[item.category_id]) {
      item.business_skills = skillInCategory[item.category_id];
    } else {
      item.business_skills = [];
    }
    return item;
  });
  listCategory = listCategory.filter(item => item.business_skills.length);
  return listCategory;
};
