export const columns = [
  {
    slots: { title: "no_" },
    key: "no",
    scopedSlots: { customRender: "no" },
    align: "center"
  },
  {
    slots: { title: "name" },
    key: "name",
    dataIndex: "name",
    width: "45%",
    scopedSlots: { customRender: "name" },
    editable: true
  },
  {
    slots: { title: "url" },
    key: "url",
    dataIndex: "url",
    width: "45%",
    scopedSlots: { customRender: "url" },
    editable: true
  },
  {
    slots: { title: "" },
    key: "operation",
    dataIndex: "operation",
    scopedSlots: { customRender: "operation" },
    width: 40,
    editable: false
  }
];
