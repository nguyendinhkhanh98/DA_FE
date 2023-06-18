export const columns = [
  {
    title: "No",
    scopedSlots: { customRender: "no" }
  },
  {
    title: "Project Name",
    dataIndex: "name",
    key: "name",
    scopedSlots: { customRender: "project_name", filterDropdown: "filterDropdown", filterIcon: "filterIcon" },
    sorter: (a, b) => a.name.localeCompare(b.name)
  },
  {
    slots: { title: "channel_title" },
    dataIndex: "channelIDs",
    key: "channelIDs",
    scopedSlots: { customRender: "channels" }
  }
];
