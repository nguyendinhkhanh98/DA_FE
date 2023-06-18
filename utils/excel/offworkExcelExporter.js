import * as Excel from "exceljs/dist/exceljs.min.js";
import * as FileSaver from "file-saver";
import * as CONST from "@/constants/index.js";
let selfVue = null;

export const convertToWorkbook = (self, dataSource) => {
  selfVue = self;
  const KEYS = [
    { key: "user", width: 20 },
    { key: "manager", width: 20 },
    { key: "request_type", width: 20 },
    { key: "reason", width: 40 },
    { key: "status", width: 10 },

    { key: "day", width: 15 },
    { key: "session_in_day", width: 15 },
    { key: "time_to_office_late", width: 20 },
    { key: "time_leave_office_early", width: 20 },

    { key: "date_work_compensate", width: 20 },
    { key: "time_begin_work_compensate", width: 20 },
    { key: "time_work_compensate", width: 20 }
  ];

  let workbook = new Excel.Workbook();
  workbook.creator = "giapdong";
  workbook.lastModifiedBy = "giapdong";
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.lastPrinted = new Date();

  let columns = KEYS.map(item => self.$t(item.key));

  let worksheet = workbook.addWorksheet("Sheet 1");
  worksheet = fillHeader(worksheet, columns);
  worksheet = changeHeaderColumn(worksheet, KEYS);
  worksheet = fillData(worksheet, dataSource, KEYS);

  workbook.xlsx.writeBuffer().then(data => {
    const blob = new Blob([data], { type: CONST.EXCEL_TYPE });
    FileSaver.saveAs(blob, `Analysis_history_offwork_${self.$moment().format("YYYY-MM-DD")}.xlsx`);
  });
};

const changeHeaderColumn = (worksheet, columns) => {
  columns.forEach((column, index) => {
    worksheet.getColumn(index + 1).width = column.width;
  });

  worksheet.getRow(1).font = {
    bold: true
  };

  return worksheet;
};

const fillHeader = (worksheet, columns) => {
  let workSheetRow = worksheet.getRow(1);
  workSheetRow.values = columns;
  return worksheet;
};

const fillData = (worksheet, rawData, keys) => {
  rawData = flatRawData(rawData);
  rawData = sortRows(rawData);
  let rows = rawData.map(data => getRowData(data, keys));

  rows.forEach((row, index) => {
    let workSheetRow = worksheet.getRow(index + 2);
    workSheetRow.values = row;
  });

  return worksheet;
};

const flatRawData = dataSource => {
  return dataSource.map(item => {
    if (item.data) return { ...item, ...item.data };
    else return { ...item };
  });
};

const sortRows = rows => {
  return rows.sort((a, b) => {
    let early = selfVue.$moment(a.date_created);
    let later = selfVue.$moment(b.date_created);

    return early > later ? 1 : early < later ? -1 : 0;
  });
};

const getRowData = (row, keys) => {
  let data = [];
  keys.forEach(key => {
    switch (key.key) {
      case "request_type": {
        data.push(selfVue.$t(row.type));
        break;
      }

      case "day": {
        data.push(selfVue.$moment(row.date_created).format(CONST.DATE_FORMAT));
        break;
      }

      case "session_in_day": {
        if (row.session_in_day) data.push(selfVue.$t(row.session_in_day));
        else data.push("");
        break;
      }

      case "time_begin_work_compensate": {
        if (row.type == "leave_office_early" || row.type == "go_to_office_late") data.push("17:30");
        else data.push("");
        break;
      }

      default: {
        if (row[key.key]) data.push(row[key.key]);
        else data.push("");
        break;
      }
    }
  });
  return data;
};
