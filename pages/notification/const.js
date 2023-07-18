export const columns = [
  {
    slots: { title: "ID" },
    dataIndex: "ID",
    key: "ID",
    scopedSlots: { customRender: "ID" }
  },
  {
    slots: { title: "notification" },
    dataIndex: "notification",
    key: "notification",
    scopedSlots: { customRender: "notification" }
  }
];

export const userColumns = [
  {
    slots: { title: "no_" },
    key: "no",
    scopedSlots: { customRender: "no" },
    align: "center"
  },
  {
    slots: { title: "name" },
    dataIndex: "name",
    key: "name",
    scopedSlots: { customRender: "name" }
  },
  {
    slots: { title: "role_project" },
    dataIndex: "roleProject",
    key: "roleProject",
    scopedSlots: { customRender: "roleProject" }
  },
  {
    slots: { title: "project_name" },
    dataIndex: "projectName",
    key: "projectName",
    scopedSlots: { customRender: "projectName" }
  },
  {
    slots: { title: "actual_work_day" },
    dataIndex: "actualWorkDay",
    key: "actualWorkDay",
    scopedSlots: { customRender: "actualWorkDay" }
  },
  {
    slots: { title: "rate_join" },
    dataIndex: "rateJoin",
    key: "rateJoin",
    scopedSlots: { customRender: "rateJoin" }
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
