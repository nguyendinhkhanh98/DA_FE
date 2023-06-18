export const columns = [
  {
    slots: { title: "no_" },
    key: "no",
    scopedSlots: { customRender: "no" },
    align: "center",
    width: 50
  },
  {
    slots: { title: "day" },
    dataIndex: "date_created",
    key: "day",
    scopedSlots: { customRender: "day" }
  },
  {
    slots: { title: "manager" },
    dataIndex: "manager",
    key: "manager",
    scopedSlots: { filterDropdown: "filterDropdown", filterIcon: "filterIcon" }
  },
  {
    slots: { title: "request_type" },
    dataIndex: "type",
    key: "request_type",
    scopedSlots: { customRender: "request_type", filterDropdown: "filterDropdown", filterIcon: "filterIcon" }
  },
  { slots: { title: "reason" }, dataIndex: "reason", key: "reason" },
  {
    slots: { title: "status" },
    dataIndex: "status",
    key: "status",
    scopedSlots: { customRender: "status", filterDropdown: "filterDropdown", filterIcon: "filterIcon" }
  }
];

export const mapColorTag = function(text) {
  switch (text) {
    case "Pending":
      return "#ffc107";
    case "Approved":
      return "#4dbd74";
    case "Rejected":
      return "#A22727";
  }
};
