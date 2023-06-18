export const columns = [
  {
    slots: { title: "no_" },
    key: "no",
    scopedSlots: { customRender: "no" },
    align: "center"
  },
  {
    slots: { title: "project" },
    key: "name",
    dataIndex: "name",
    align: "center",
    postfix: ""
  },
  {
    slots: { title: "total_man_hour" },
    key: "totalManHour",
    dataIndex: "totalManHour",
    align: "center",
    postfix: "(h)"
  },
  {
    slots: { title: "bug_ratio_by_number" },
    key: "bugRatioByNumber",
    dataIndex: "bugRatioByNumber",
    align: "center",
    postfix: "(%)"
  },
  {
    slots: { title: "bug_ratio_by_hour" },
    key: "bugRatioByHour",
    dataIndex: "bugRatioByHour",
    align: "center",
    postfix: "(%)"
  },
  {
    slots: { title: "degration_ratio_by_number" },
    key: "degrateByNumber",
    dataIndex: "degrateByNumber",
    align: "center",
    postfix: "(%)"
  },
  {
    slots: { title: "degration_ratio_by_hour" },
    key: "degrateByHour",
    dataIndex: "degrateByHour",
    align: "center",
    postfix: "(%)"
  },
  {
    slots: { title: "cost_against_estimation_ratio" },
    key: "cost",
    dataIndex: "cost",
    align: "center",
    postfix: "(%)"
  },
  {
    slots: { title: "delivery_meet_ratio" },
    key: "delivery",
    dataIndex: "delivery",
    align: "center",
    postfix: "(%)"
  }
];
