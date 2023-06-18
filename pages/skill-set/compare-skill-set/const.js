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
    slots: { title: "skill" },
    dataIndex: "skill",
    key: "skill",
    flagCustomTitle: 3,
    width: "25%"
  },
  {
    slots: { title: "source" },
    key: "source",
    dataIndex: "source",
    scopedSlots: { customRender: "source" },
    flagCustomTitle: 3,
    width: "30%"
  },
  {
    slots: { title: "target" },
    key: "target",
    dataIndex: "target",
    scopedSlots: { customRender: "target" },
    flagCustomTitle: 3,
    width: "30%"
  },
  {
    slots: { title: "diff" },
    key: "diff",
    dataIndex: "diff",
    scopedSlots: { customRender: "diff", filterDropdown: "filterDropdown", filterIcon: "filterIcon" },
    flagCustomTitle: 3,
    filters: [
      {
        text: "increment",
        value: 1
      },
      {
        text: "decrement",
        value: -1
      }
    ],
    onFilter: (value, record) => Math.sign(record.diff) == Math.sign(value)
  }
];
