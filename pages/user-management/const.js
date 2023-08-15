export const columns = [
  {
    key: "no",
    slots: { title: "no_" },
    scopedSlots: { customRender: "no" },
    width: "50px"
  },
  {
    slots: { title: "user_name" },
    dataIndex: "username",
    key: "user_name",
    // scopedSlots: {
    //   filterDropdown: "filterDropdown",
    //   filterIcon: "filterIcon"
    // }
  },
  {
    slots: { title: "email" },
    dataIndex: "email",
    key: "email"
  },
  {
    slots: { title: "fullName" },
    dataIndex: "fullName",
    key: "fullName"
  },
  {
    slots: { title: "phone" },
    dataIndex: "phone",
    key: "phone"
  },
  {
    slots: { title: "role" },
    dataIndex: "role",
    scopedSlots: { customRender: "role", filterDropdown: "filterDropdown", filterIcon: "filterIcon" },
    key: "role"
  },
  // {
  //   slots: { title: "project" },
  //   dataIndex: "project",
  //   scopedSlots: { customRender: "project", filterDropdown: "filterDropdown", filterIcon: "filterIcon" },
  //   key: "project"
  // },
  {
    slots: { title: "" },
    key: "detail",
    dataIndex: "id",
    scopedSlots: { customRender: "detail" },
    width: 10
  }
];

export const mapColorTagRole = [
  { role: "guest", color: "green" },
  { role: "admin", color: "orange" },
  { role: "manager", color: "orange" },
  { role: "leader", color: "orange" },
  { role: "developer", color: "#0052cc" },
  { role: "tester", color: "#0052cc" },
  { role: "asset_admin", color: "orange" },
  { role: "intern", color: "green" },
  { role: "accountant", color: "#0052cc" }
];
