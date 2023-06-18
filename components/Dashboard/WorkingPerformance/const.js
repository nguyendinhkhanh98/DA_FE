export const columnsCode = [
  {
    slots: { title: "author" },
    dataIndex: "author",
    width: "10%"
  },
  {
    slots: { title: "complete_task" },
    className: "column-money",
    dataIndex: "complete",
    scopedSlots: { customRender: "complete" },
    width: "45%"
  },
  {
    slots: { title: "behind_schedule" },
    dataIndex: "notComplete",
    scopedSlots: { customRender: "notComplete" },
    width: "45%"
  }
  //   {
  //     slots: { title: "working_task" },
  //     dataIndex: "working",
  //     scopedSlots: { customRender: "working" },
  //     width: "45%"
  //   }
];

export const columnsReview = [
  {
    slots: { title: "author" },
    dataIndex: "author",
    width: "10%"
  },
  {
    slots: { title: "review_task" },
    dataIndex: "complete",
    scopedSlots: { customRender: "complete" },
    width: "45%"
  },
  {
    slots: { title: "behind_schedule" },
    dataIndex: "notComplete",
    scopedSlots: { customRender: "notComplete" },
    width: "45%"
  }
];

export const columnsTest = [
  {
    slots: { title: "author" },
    dataIndex: "author",
    width: "10%"
  },
  {
    slots: { title: "tested_task" },
    dataIndex: "complete",
    scopedSlots: { customRender: "complete" },
    width: "45%"
  },
  {
    slots: { title: "behind_schedule" },
    dataIndex: "notComplete",
    scopedSlots: { customRender: "notComplete" },
    width: "45%"
  }
];
