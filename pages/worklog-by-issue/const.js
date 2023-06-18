export const columns = [
  {
    slots: { title: "no_" },
    key: "no",
    scopedSlots: { customRender: "no" },
    align: "center"
  },
  {
    slots: { title: "t" },
    dataIndex: "fields.issuetype",
    key: "type",
    scopedSlots: { customRender: "type" },
    width: 20
  },
  {
    slots: { title: "parent" },
    dataIndex: "fields.parent.key",
    key: "parent",
    scopedSlots: { customRender: "key" },
  },
  {
    slots: { title: "key" },
    dataIndex: "key",
    key: "key",
    scopedSlots: { customRender: "key" },
  },
  {
    slots: { title: "summary" },
    dataIndex: "fields.summary",
    key: "summary",
    scopedSlots: { customRender: "summary" }
  },
  {
    slots: { title: "priority" },
    dataIndex: "fields.priority",
    key: "priority",
    scopedSlots: { customRender: "priority" },
    align: "center"
  },
  {
    slots: { title: "total_hours" },
    dataIndex: "fields.timetracking.timeSpentSeconds",
    key: "total",
    scopedSlots: { customRender: "total" },
    align: "total"
  }
];
