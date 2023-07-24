export const columns = [
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
    slots: { title: "Vai trò trong dự án" },
    dataIndex: "roleName",
    key: "roleName",
    scopedSlots: { customRender: "roleName" }
  },
  {
    slots: { title: "Điểm đánh giá trung bình" },
    dataIndex: "averageScore",
    key: "averageScore",
    scopedSlots: { customRender: "averageScore" }
  },
  // {
  //   slots: { title: "Điểm đánh giá chung" },
  //   dataIndex: "generalScore",
  //   key: "generalScore",
  //   scopedSlots: { customRender: "generalScore" }
  // }
];

export const projectColumns = [
  {
    slots: { title: "Công việc được giao" },
    dataIndex: "taskAssign",
    key: "taskAssign",
    scopedSlots: { customRender: "taskAssign" }
  },
  {
    slots: { title: "Trạng thái" },
    dataIndex: "status",
    key: "status",
    scopedSlots: { customRender: "status" }
  },
  {
    slots: { title: "Ngày bắt đầu" },
    dataIndex: "start_date",
    key: "start_date",
    scopedSlots: { customRender: "startDate" }
  },
  {
    slots: { title: "Ngày kết thúc" },
    dataIndex: "end_date",
    key: "end_date",
    scopedSlots: { customRender: "endDate" }
  },
  {
    slots: { title: "Điểm đánh giá công việc" },
    dataIndex: "score",
    key: "score",
    scopedSlots: { customRender: "score" }
  }
]

export const mapColorTag = function(text) {
  switch (text) {
    case "new":
      return "#4dbd74";
    case "working":
      return "#ffc107";
    case "done":
      return "#C3C3C3";
  }
};

export const mapColorRankTag = function(text) {
  switch (text) {
    case "no":
      return "#C3C3C3";
    case "bad":
      return "#f5222d";
    case "medium":
      return "#ffd591";
    case "good":
      return "#4dbd74";
    case "excelent":
      return "#0052cc";
  }
};
