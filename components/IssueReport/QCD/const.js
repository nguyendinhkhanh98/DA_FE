const fieldsTableDescription = [
  {
    title: "Judgement level",
    dataIndex: "judgement_level",
    key: "judgement_level"
  },
  {
    title: "Class",
    dataIndex: "class",
    key: "class"
  }
];

const qualityDescription = [
  {
    judgement_level: "<= 2%",
    class: "Gold"
  },
  {
    judgement_level: "3% to 5%",
    class: "Sliver"
  },
  {
    judgement_level: "6% to 10%",
    class: "Bronze"
  },
  {
    judgement_level: "Other",
    class: "Danger"
  }
];

const costDescription = [
  {
    judgement_level: "<=5%",
    class: "Gold"
  },
  {
    judgement_level: "6% to 10%",
    class: "Sliver"
  },
  {
    judgement_level: "11% to 15%",
    class: "Bronze"
  },
  {
    judgement_level: "Other",
    class: "Danger"
  }
];

const deliveryDescription = [
  {
    judgement_level: "90% over",
    class: "Gold"
  },
  {
    judgement_level: "80% to 89%",
    class: "Sliver"
  },
  {
    judgement_level: "70% to 79%",
    class: "Bronze"
  },
  {
    judgement_level: "Other",
    class: "Danger"
  }
];
const fieldsTableViewIssue = [
  {
    title: "No",
    key: "no",
    scopedSlots: { customRender: "no" },
    align: "center"
  },
  {
    title: "Key",
    dataIndex: "key",
    key: "key",
    scopedSlots: { customRender: "key" },
    width: 20
  },
  {
    title: "Summary",
    dataIndex: "summary",
    key: "summary"
  },
  {
    title: "Users",
    dataIndex: "userInWorklog",
    key: "userInWorklog",
    scopedSlots: { customRender: "userInWorklog" }
  }
];
module.exports = {
  fieldsTableDescription,
  qualityDescription,
  costDescription,
  deliveryDescription,
  fieldsTableViewIssue
};
