export const columns = [
  {
    slots: { title: "no_" },
    key: "no",
    scopedSlots: { customRender: "no" },
    align: "center"
  },
  {
    slots: { title: "logged_date" },
    dataIndex: "started",
    key: "started",
    scopedSlots: { customRender: "dateRender" }
  },
  {
    slots: { title: "member" },
    dataIndex: "member",
    key: "member",
    scopedSlots: { customRender: "memberRender" }
  },
  {
    slots: { title: "total_spent_time" },
    dataIndex: "totalSpentTimeSecs",
    key: "totalSpentTimeSecs",
    scopedSlots: { customRender: "spentTime" }
  }
];

export const userColumns = [
  {
    slots: { title: "started_time" },
    dataIndex: "started",
    key: "started",
    scopedSlots: { customRender: "dateRender" }
  },
  {
    slots: { title: "issue" },
    dataIndex: "issueKey",
    key: "issueKey",
    scopedSlots: { customRender: "issueRender" }
  },
  {
    slots: { title: "summary" },
    dataIndex: "summary",
    key: "summary"
  },
  {
    slots: { title: "spent_time" },
    dataIndex: "timeSpentSeconds",
    key: "timeSpentSeconds",
    scopedSlots: { customRender: "spentTime" }
  }
];

export const excelColumns = [
  {
    slots: { title: "no_" },
    key: "no",
    scopedSlots: { customRender: "no" },
    align: "center",
    width: 5
  },
  {
    slots: { title: "member" },
    dataIndex: "author",
    key: "author",
    scopedSlots: { customRender: "memberRender" },
    width: 20
  },
  {
    slots: { title: "started_date" },
    dataIndex: "started",
    key: "started",
    scopedSlots: { customRender: "dateRender" },
    width: 20
  },
  {
    slots: { title: "issue" },
    dataIndex: "issueKey",
    key: "issueKey",
    scopedSlots: { customRender: "issueRender" },
    width: 11
  },
  {
    slots: { title: "summary" },
    dataIndex: "summary",
    key: "summary",
    scopedSlots: { customRender: "summaryRender" },
    width: 100
  },
  {
    slots: { title: "spent_time" },
    dataIndex: "timeSpentSeconds",
    key: "timeSpentSeconds",
    scopedSlots: { customRender: "spentTime" },
    width: 11
  }
];

export const excelColumnsByTask = [
  {
    slots: { title: "no_" },
    key: "no",
    scopedSlots: { customRender: "no" },
    align: "center",
    width: 5
  },
  {
    slots: { title: "member" },
    dataIndex: "author",
    key: "author",
    scopedSlots: { customRender: "memberRender" },
    width: 20
  },
  {
    slots: { title: "issue" },
    dataIndex: "issueKey",
    key: "issueKey",
    scopedSlots: { customRender: "issueRender" },
    width: 11
  },
  {
    slots: { title: "summary" },
    dataIndex: "summary",
    key: "summary",
    scopedSlots: { customRender: "summaryRender" },
    width: 100
  },
  {
    slots: { title: "spent_time" },
    dataIndex: "timeSpentSeconds",
    key: "timeSpentSeconds",
    scopedSlots: { customRender: "spentTime" },
    width: 11
  }
];
