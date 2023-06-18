export const columns = [
  {
    slots: { title: "no_" },
    key: "no",
    scopedSlots: { customRender: "no" },
    align: "center"
  },
  {
    slots: { title: "asset_code" },
    dataIndex: "asset_code",
    key: "asset_code",
    defaultChecked: true
  },
  {
    slots: { title: "asset_type" },
    dataIndex: "asset_type",
    key: "asset_type",
    defaultChecked: true
  },
  {
    slots: { title: "asset_info" },
    dataIndex: "asset_info",
    key: "asset_info",
    defaultChecked: true
  },
  {
    slots: { title: "purpose_id" },
    dataIndex: "purpose",
    key: "purpose",
    defaultChecked: true
  },
  {
    slots: { title: "manager_id" },
    dataIndex: "manager",
    key: "manager",
    defaultChecked: true
  },

  {
    slots: { title: "status" },
    dataIndex: "status",
    key: "status",
    defaultChecked: true
  },

  {
    slots: { title: "note" },
    dataIndex: "note",
    key: "note",
    defaultChecked: true
  },
  {
    slots: { title: "company_id" },
    dataIndex: "company",
    key: "company",
    defaultChecked: true
  },
  {
    slots: { title: "created_at" },
    dataIndex: "created_at",
    key: "created_at",
    scopedSlots: { customRender: "created_at" },
    defaultChecked: true
  },
  {
    slots: { title: "buy_date" },
    dataIndex: "buy_date",
    key: "buy_date",
    scopedSlots: { customRender: "buy_date" },
    defaultChecked: true
  }
];
