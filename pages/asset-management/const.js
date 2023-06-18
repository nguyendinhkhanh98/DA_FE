export const columns = [
  {
    slots: { title: "no_" },
    key: "no",
    scopedSlots: { customRender: "no" },
    align: "center",
    defaultChecked: true
  },
  {
    slots: { title: "asset_code" },
    dataIndex: "asset_code",
    scopedSlots: { customRender: "asset_code" },
    sorter: (a, b) => (a.asset_code > b.asset_code ? 1 : -1),
    key: "asset_code",
    defaultChecked: true
  },
  {
    slots: { title: "asset_type_name" },
    dataIndex: "asset_type",
    key: "asset_type",
    sorter: (a, b) => (a.asset_type > b.asset_type ? 1 : -1),
    scopedSlots: {
      filterDropdown: "filterDropdown",
      filterIcon: "filterIcon"
    },
    defaultChecked: true
  },
  {
    slots: { title: "asset_info" },
    dataIndex: "asset_info",
    key: "asset_info",
    scopedSlots: { customRender: "asset_info" },
    width: 100,
    defaultChecked: true
  },
  {
    slots: { title: "purpose_id" },
    dataIndex: "purpose",
    key: "purpose",
    scopedSlots: {
      customRender: "purpose",
      filterDropdown: "filterDropdown",
      filterIcon: "filterIcon"
    },
    sorter: (a, b) => (a.purpose > b.purpose ? 1 : -1),
    defaultChecked: true
  },
  {
    slots: { title: "manager_id" },
    dataIndex: "manager",
    key: "manager",
    scopedSlots: {
      customRender: "manager",
      filterDropdown: "filterDropdown",
      filterIcon: "filterIcon"
    },
    defaultChecked: true
  },
  {
    slots: { title: "status" },
    dataIndex: "status",
    key: "status",
    scopedSlots: {
      customRender: "status",
      filterDropdown: "filterDropdown",
      filterIcon: "filterIcon"
    },
    defaultChecked: true
  },
  {
    slots: { title: "note" },
    dataIndex: "note",
    key: "note",
    defaultChecked: false
  },
  {
    slots: { title: "company_id" },
    dataIndex: "company",
    key: "company",
    onFilter: (value, record) => {
      let condition = `^${value}$`;
      let regex = new RegExp(condition);
      return regex.test(record.company);
    },
    defaultChecked: false
  },
  {
    slots: { title: "" },
    key: "detail",
    dataIndex: "id",
    scopedSlots: { customRender: "detail" },
    width: 100,
    defaultChecked: true
  }
];
