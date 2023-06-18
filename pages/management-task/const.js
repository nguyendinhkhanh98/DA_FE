import moment from "moment";

export const extractSkillToCategory = listSkill => {
  let listCategory = _.uniqBy(listSkill, item => item.category_id);
  listCategory = listCategory.filter(item => item.category_id != null);
  return listCategory;
};

export const filterSkillNotNull = listSkill => {
  let listSkillFilter = listSkill.filter(item => item.skill_id);
  return listSkillFilter;
};

export const columns = [
  {
    slots: { title: "no_" },
    key: "no",
    scopedSlots: { customRender: "no" },
    align: "center",
    width: "50px"
  },
  {
    slots: { title: "name" },
    dataIndex: "name",
    scopedSlots: { customRender: "name" },
    key: "name",
    width: "10%",
    defaultChecked: true
  },
  {
    slots: { title: "description" },
    dataIndex: "description",
    scopedSlots: { customRender: "description" },
    key: "description",
    defaultChecked: true
  },
  {
    slots: { title: "started_date" },
    dataIndex: "started_at",
    key: "started_at",
    sortDirections: ["descend", "ascend"],
    defaultSortOrder: "ascend",
    sorter: (a, b) => {
      a = moment(a.started_at);
      b = moment(b.started_at);
      return a.isBefore(b) ? 1 : a.isAfter(b) ? -1 : 0;
    },
    width: 100,

    scopedSlots: { customRender: "started_at" },
    defaultChecked: true
  },
  {
    slots: { title: "skill" },
    dataIndex: "skills",
    key: "skills",
    scopedSlots: { customRender: "skills" },
    defaultChecked: true
  },
  {
    slots: { title: "business_skill" },
    dataIndex: "business_skills",
    key: "business_skills",
    scopedSlots: { customRender: "business_skills" },
    defaultChecked: true
  },
  {
    slots: { title: "status" },
    dataIndex: "status",
    key: "status",
    scopedSlots: { customRender: "status" },
    width: "50px",
    defaultChecked: true
  },
  {
    slots: { title: "action" },
    key: "action",
    dataIndex: "id",
    scopedSlots: { customRender: "action" },
    width: "120px",
    defaultChecked: true
  }
];

export const mapColorTag = text => {
  switch (text) {
    case 1:
      return "green";
    case 2:
      return "orange";
    case 3:
      return "blue";
    case 4:
      return "grey";
  }
};
