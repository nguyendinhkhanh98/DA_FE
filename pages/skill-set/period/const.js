// flagCustomTitle == 1 => using i18n
// flagCustomTitle == 2 => using primitive
// flagCustomTitle == 3 => using custom slot

export const columns = [
  {
    slots: { title: "no_" },
    key: "no",
    scopedSlots: { customRender: "no" },
    align: "center"
  },
  {
    slots: { title: "period_name" },
    dataIndex: "name",
    key: "period_name",
    defaultChecked: true,
    flagCustomTitle: 3
  },
  {
    slots: { title: "start_date" },
    dataIndex: "start_date",
    key: "start_date",
    scopedSlots: {
      customRender: "start_date"
    },
    width: "25%",
    defaultChecked: true
  },
  {
    slots: { title: "end_date" },
    dataIndex: "end_date",
    key: "end_date",
    scopedSlots: {
      customRender: "end_date"
    },
    width: "30%",
    defaultChecked: true
  },
  {
    slots: { title: "description" },
    dataIndex: "description",
    key: "description",
    defaultChecked: true
  },
  {
    slots: { title: "status" },
    dataIndex: "delete_flag",
    key: "status",
    scopedSlots: {
      customRender: "status"
    },
    defaultChecked: true,
    flagCustomTitle: 3
  },
  {
    slots: { title: "created_at" },
    dataIndex: "created_at",
    key: "created_at",
    scopedSlots: { customRender: "created_at" },
    width: "10%",
    defaultChecked: true
  },

  {
    slots: { title: "" },
    key: "detail",
    dataIndex: "id",
    scopedSlots: { customRender: "detail" },
    width: "10%",
    defaultChecked: true
  }
];

export const listStatus = [
  { key: "active", value: "Active", delete_flag: false },
  { key: "deprecated", value: "Deprecated", delete_flag: true }
];
