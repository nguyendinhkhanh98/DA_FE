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
  }
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
