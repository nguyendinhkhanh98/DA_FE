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
    slots: { title: "created_at" },
    dataIndex: "created_at",
    key: "created_at",
    scopedSlots: { customRender: "created_at" },
    defaultChecked: true
  },
  {
    slots: { title: "serial_number" },
    dataIndex: "serial_number",
    key: "serial_number",
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
  }
];
