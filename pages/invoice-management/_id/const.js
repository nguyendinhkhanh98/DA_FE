import * as CONST from "@/constants/index.js";
import moment from "moment";

export const columns = [
  {
    slots: { title: "no_" },
    key: "no",
    align: "center",
    width: 50
  },
  {
    slots: { title: "invoice_name" },
    dataIndex: "name",
    key: "invoice_name"
  },
  {
    slots: { title: "status" },
    dataIndex: "status",
    key: "status"
  },
  {
    slots: { title: "estimation_issue_date" },
    dataIndex: "updatedAt",
    key: "updatedAt"
  },
  {
    slots: { title: "payment_due_date" },
    key: "dueDate"
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
    dataIndex: "cost",
    key: "total_cost"
  },
  {
    slots: { title: "" },
    key: "detail",
    dataIndex: "id",
    scopedSlots: { customRender: "detail" },
    width: 100
  }
];

export const extractInvoiceInfo = rawInfo => {
  let invoice = {};
  invoice.id = rawInfo.id;
  invoice.project_id = rawInfo.project_id;
  invoice.name = rawInfo.name;
  invoice.status_id = rawInfo.status_id;
  invoice.start_date = moment(rawInfo.start_date).format(CONST.DATE_FORMAT_AND_TIME);
  invoice.end_date = moment(rawInfo.end_date).format(CONST.DATE_FORMAT_AND_TIME);
  invoice.due_date = moment(rawInfo.due_date).format(CONST.DATE_FORMAT_AND_TIME);
  invoice.invoice_number = rawInfo.invoice_number;

  return invoice;
};
