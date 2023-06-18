export const columns = [
  {
    slots: { title: "full_name" },
    dataIndex: "full_name",
    key: "full_name",
    defaultSortOrder: "ascend",
    sorter: (a, b) => {
      if (!a.full_name || !b.full_name) return 0;
      return a.full_name?.localeCompare(b.full_name);
    },
    scopedSlots: {
      filterDropdown: "filterDropdown",
      filterIcon: "filterIcon"
    }
  }
];
