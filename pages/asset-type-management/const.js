export const columns = [
  {
    slots: { title: "no_" },
    key: "no",
    scopedSlots: { customRender: "no" },
    align: "center"
  },
  {
    slots: { title: "asset_type_name" },
    dataIndex: "asset_type_name",
    key: "asset_type_name",
    sorter: (a, b) => a.asset_type_name.localeCompare(b.asset_type_name),
    scopedSlots: {
      filterDropdown: "filterDropdown",
      filterIcon: "filterIcon"
    }
  },
  {
    slots: { title: "asset_type_code" },
    dataIndex: "asset_type_code",
    key: "asset_type_code"
  },
  {
    slots: { title: "description" },
    dataIndex: "description",
    key: "description"
  },
  {
    slots: { title: "count" },
    dataIndex: "count",
    key: "count",
    sorter: (a, b) => (+a.count > +b.count ? -1 : +a.count < +b.count ? 1 : 0)
  },
  {
    slots: { title: "" },
    key: "detail",
    dataIndex: "id",
    scopedSlots: { customRender: "detail" },
    width: 10
  }
];
