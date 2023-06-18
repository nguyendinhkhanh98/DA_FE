export const columns = [
  {
    slots: { title: "no_" },
    key: "no",
    scopedSlots: { customRender: "no" },
    align: "center",
    width: 50
  },
  {
    slots: { title: "project" },
    dataIndex: "name",
    key: "project",
    scopedSlots: { customRender: "projectName" }
  },
  {
    slots: { title: "invoice_number" },
    dataIndex: "invoice_number",
    key: "invoice_number"
  },
  {
    slots: { title: "last_invoice_status" },
    dataIndex: "status_name",
    key: "status_name",
    scopedSlots: { customRender: "lastInvoiceStatus" }
  },
  {
    slots: { title: "Invoice name" },
    dataIndex: "invoice_name",
    key: "invoice_name"
  },
  {
    slots: { title: "estimation_issue_date" },
    dataIndex: "updated_at",
    key: "updated_at",
    scopedSlots: { customRender: "date" }
  },
  {
    slots: { title: "payment_due_date" },
    dataIndex: "due_date",
    key: "due_date",
    scopedSlots: { customRender: "date" }
  },
  {
    slots: { title: "start_date" },
    dataIndex: "start_date",
    key: "start_date",
    scopedSlots: { customRender: "date" }
  },
  {
    slots: { title: "end_date" },
    dataIndex: "end_date",
    key: "end_date",
    scopedSlots: { customRender: "date" }
  },
  {
    slots: { title: "total_cost" },
    key: "cost",
    dataIndex: "cost",
    scopedSlots: { customRender: "lastInvoiceCost" }
  },
  {
    slots: { title: "" },
    key: "detail",
    scopedSlots: { customRender: "detail" },
    width: 50
  }
];
