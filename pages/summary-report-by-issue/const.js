export const columns = [
  {
    slots: { title: "no_" },
    key: "no",
    scopedSlots: { customRender: "no" },
    align: "center",
    defaultChecked: true
  },
  {
    slots: { title: "t" },
    dataIndex: "type",
    key: "type",
    scopedSlots: { customRender: "type" },
    defaultChecked: true
  },
  {
    slots: { title: "key" },
    dataIndex: "key",
    key: "key",
    scopedSlots: { customRender: "key" },
    defaultChecked: true
  },
  {
    slots: { title: "issue_name" },
    dataIndex: "issueName",
    scopedSlots: { customRender: "issueName" },
    key: "issueName",
    defaultChecked: true
  },
  {
    slots: { title: "assignee" },
    dataIndex: "assignee",
    key: "assignee",
    scopedSlots: { customRender: "assignee" },
    defaultChecked: true
  },
  {
    slots: { title: "status" },
    dataIndex: "status",
    key: "status",
    scopedSlots: { customRender: "status" },
    defaultChecked: true
  },
  {
    slots: { title: "issue_created_date" },
    dataIndex: "issueCreatedDate",
    key: "issueCreatedDate",
    defaultChecked: true
  },
  {
    slots: { title: "progress" },
    dataIndex: "progress",
    key: "progress",
    scopedSlots: { customRender: "progress" },
    defaultChecked: true
  },
  {
    slots: { title: "last_updated_within_duration" },
    dataIndex: "lastUpdatedWithinDuration",
    key: "lastUpdatedWithinDuration",
    defaultChecked: true
  },
  {
    slots: { title: "answer_due_date" },
    dataIndex: "answerDueDate",
    key: "answerDueDate",
    defaultChecked: true
  },
  {
    slots: { title: "actual_finished_date" },
    dataIndex: "actualFinishedDate",
    key: "actualFinishedDate",
    defaultChecked: true
  },
  {
    slots: { title: "difference_date" },
    dataIndex: "differenceDate",
    key: "differenceDate",
    defaultChecked: true
  },
  {
    slots: { title: "plan_man_hour" },
    dataIndex: "planManhour",
    key: "planManhour",
    defaultChecked: true
  },
  {
    slots: { title: "actual_man_hour" },
    dataIndex: "actualManhour",
    key: "actualManhour",
    defaultChecked: true
  },
  {
    slots: { title: "difference_man_hour" },
    dataIndex: "differenceManhour",
    key: "differenceManhour",
    defaultChecked: true
  },
  {
    slots: { title: "related_resource_for_fix_bug" },
    dataIndex: "relatedResourceForFixBug",
    key: "related_resource_for_fix_bug",
    defaultChecked: true
  },
  {
    slots: { title: "total_man_hour" },
    dataIndex: "totalManhour",
    key: "totalManhour",
    defaultChecked: true
  },
  {
    slots: { title: "bug_ratio" },
    dataIndex: "bugRatio",
    key: "bugRatio",
    defaultChecked: true
  },
  {
    slots: { title: "total_jugement_level" },
    dataIndex: "totalJugementLevel",
    key: "totalJugementLevel",
    defaultChecked: false
  }
];
