export const columns = [
  {
    slots: { title: "no_" },
    key: "no",
    scopedSlots: { customRender: "no" },
    align: "center",
    width: 50
  },
  {
    slots: { title: "role" },
    dataIndex: "name",
    key: "project"
  },
  {
    slots: { title: "status" },
    dataIndex: "delete_flag",
    key: "status",
    scopedSlots: { customRender: "status" }
  },
  {
    slots: { title: "description" },
    dataIndex: "description",
    key: "description",
    scopedSlots: { customRender: "description" }
  },
  {
    slots: { title: "default_price" },
    dataIndex: "monthly_salary",
    key: "default_price",
    scopedSlots: { customRender: "monthlySalary" }
  },
  {
    slots: { title: "" },
    key: "detail",
    dataIndex: "id",
    scopedSlots: { customRender: "detail" },
    width: 80
  }
];

export const listStatus = [
  { key: "active", value: "Active", delete_flag: false },
  { key: "deprecated", value: "Deprecated", delete_flag: true }
];
