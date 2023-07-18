export const columns = [
  {
    slots: { title: "no_" },
    key: "no",
    scopedSlots: { customRender: "no" },
    align: "center"
  },
  {
    slots: { title: "Tên nhân viên" },
    dataIndex: "fullName",
    key: "fullName",
    scopedSlots: { customRender: "fullName" }
  },
  {
    slots: { title: "Số công việc hoàn thành đúng hạn" },
    dataIndex: "allTaskOntime",
    key: "allTaskOntime",
    scopedSlots: { customRender: "allTaskOntime" }
  },
  {
    slots: { title: "Số công việc được giao" },
    dataIndex: "allTask",
    key: "allTask",
    scopedSlots: { customRender: "allTask" }
  },
  {
    slots: { title: "Điểm đánh giá" },
    dataIndex: "pointEvaluate",
    key: "pointEvaluate",
    scopedSlots: { customRender: "pointEvaluate" }
  },
  {
    slots: { title: "Xếp hạng" },
    dataIndex: "rankEvaluate",
    key: "rankEvaluate",
    scopedSlots: { customRender: "rankEvaluate" }
  }
];

export const userColumns = [
  {
    slots: { title: "STT" },
    key: "no",
    scopedSlots: { customRender: "no" },
    align: "center"
  },
  {
    slots: { title: "Dự án" },
    dataIndex: "projectName",
    key: "projectName",
    scopedSlots: { customRender: "projectName" }
  },
  {
    slots: { title: "Số công việc hoàn thành đúng hạn" },
    dataIndex: "countTaskOntime",
    key: "countTaskOntime",
    scopedSlots: { customRender: "countTaskOntime" }
  },
  {
    slots: { title: "Số công việc được giao" },
    dataIndex: "totalTask",
    key: "totalTask",
    scopedSlots: { customRender: "totalTask" }
  },
  {
    slots: { title: "Đánh giá chất lượng" },
    dataIndex: "qualityScore",
    key: "qualityScore",
    scopedSlots: { customRender: "qualityScore" }
  },
  {
    slots: { title: "Vai trò trong dự án" },
    dataIndex: "roleName",
    key: "roleName",
    scopedSlots: { customRender: "roleName" }
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

export const mapColorScoreEvaluateTag = function(text) {
  switch (text) {
    case "notEvaluate":
      return "#C3C3C3";
    case "bad":
      return "#cd201f";
    case "averate":
      return "#ffc107";
    case "good":
      return "#4dbd74";
    case "excellent":
      return "#3b5999"
  }
};
