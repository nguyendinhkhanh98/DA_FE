import _ from "lodash";

export const columns = [
  {
    slots: { title: "no_" },
    key: "no",
    scopedSlots: { customRender: "no" },
    align: "center",
    canModify: false,
    isHiden: false
  },
  {
    slots: { title: "user" },
    dataIndex: "worklogAuthor",
    key: "user",
    canModify: false,
    isHiden: false
  },
  {
    slots: { title: "project" },
    dataIndex: "project",
    key: "project",
    canModify: false,
    isHiden: false
  }
];

export const typeView = {
  viewChart: "viewChart",
  viewTable: "viewTable",
  viewCalendarWeek: "viewCalendarWeek"
};

export function handleDataForExportAllVersion2(self, dayColumns, dataSource) {
  // handler list day to columns for first table
  let columns = [
    { name: self.$t("no_"), width: 5 },
    { name: self.$t("user"), width: 20 },
    { name: self.$t("project"), width: 20 }
  ];
  for (let i = 3; i < dayColumns.length; i++) {
    let date = dayColumns[i].title;
    columns.push({ name: date, width: 11 });
  }
  columns.push({ name: "Total", width: 11 });

  // Handler data for first table
  let rows = [];
  dataSource.forEach((item, index) => {
    let row = [];
    row.push(index + 1);
    row.push(item.worklogAuthor);
    row.push(item.project);
    let total = 0;
    for (let i = 3; i < columns.length; i++) {
      if (i === columns.length - 1) {
        row.push(Math.round((total / 3600) * 100) / 100);
      } else {
        let itemValue = item[columns[i].name];
        if (itemValue && itemValue.value) {
          let timeSpentSeconds = itemValue.value;
          row.push(Math.round((timeSpentSeconds / 3600) * 100) / 100);
          total += timeSpentSeconds;
        } else {
          row.push("");
        }
      }
    }
    rows.push(row);
  });
  let lastRow = ["", "Total", ""];
  let totalSum = 0;
  for (let i = 3; i < rows[0].length - 1; i++) {
    let totalDay = 0;
    for (const row of rows) {
      if (row[i]) {
        totalDay += row[i];
      }
    }
    lastRow.push(totalDay);
    totalSum += totalDay;
  }
  lastRow.push(totalSum);
  rows.push(lastRow);

  return { columns, rows };
}

export function appendDetailTableWorklogToWorksheet(worksheet, columns, rows) {
  worksheet.addTable({
    name: "AllWorklogs",
    ref: "A1",
    headerRow: true,
    columns: columns,
    rows: rows
  });

  columns.forEach((column, index) => {
    // column width
    worksheet.getColumn(index + 1).width = column.width;
  });

  return worksheet;
}

export function appendSumarryTableWorklogToWorksheet(worksheet, columns, rows, duration, index) {
  worksheet.mergeCells(index - 1, 1, index - 1, 5);
  worksheet.getCell(getColumnCellNameFromIndex(index - 1, 0)).value = `SUMARRY: From ${duration[0]} to ${duration[1]}`;

  worksheet.addTable({
    name: "SumarryWorklog",
    ref: `A${index}`,
    headerRow: true,
    columns: columns,
    rows: rows
  });

  return worksheet;
}

export function handleDataSumarryForExportAllVersion2(columns, rows) {
  let resultRows = [];
  let sumarryColumns = [
    {
      name: "No",
      width: 5
    },
    {
      name: "User",
      width: 5
    },
    {
      name: "Man-Hour",
      width: 5
    },
    {
      name: "Man-Day",
      width: 5
    },
    {
      name: "Man-Month",
      width: 5
    }
  ];
  let duration = getDurationFromOriginColumns(columns);
  let listUsers = getListUserFromOriginRows(rows);
  let maxLengthOneRow = rows[0].length;

  listUsers.forEach((user, userIndex) => {
    let listDataUsers = rows.filter(row => row[1] == user);
    let arrayTotalTime = listDataUsers.map(data => data[maxLengthOneRow - 1]);
    let totalTimeByUser = arrayTotalTime.reduce((sum, value) => (sum += value), 0);
    let newRow = [];

    newRow.push(userIndex + 1);
    newRow.push(user);
    newRow.push(+totalTimeByUser.toFixed(2));
    newRow.push(getTotalTimeByDay(totalTimeByUser));
    newRow.push(getTotalTimeByMonth(totalTimeByUser));
    resultRows.push(newRow);
  });

  let lastRow = [];
  lastRow.push("");
  lastRow.push("Total");
  lastRow.push(getTotalTimeFromTotalRowByIndex(resultRows, 2));
  lastRow.push(getTotalTimeFromTotalRowByIndex(resultRows, 3));
  lastRow.push(getTotalTimeFromTotalRowByIndex(resultRows, 4));
  resultRows.push(lastRow);

  return { sumarryRows: resultRows, sumarryColumns, sumarryDuration: duration };
}

function getTotalTimeFromTotalRowByIndex(rows, index) {
  return rows.reduce((sum, item) => {
    return (sum += item[index]);
  }, 0);
}

function getDurationFromOriginColumns(columns) {
  if (columns.length <= 3) return ["", ""];
  return [columns[3], columns[columns.length - 2]].map(item => item.name);
}

function getListUserFromOriginRows(rows) {
  let listUsers = rows.map(item => item[1]);
  listUsers.pop();
  listUsers = _.uniq(listUsers);
  return listUsers;
}

function getTotalTimeByDay(totalHour) {
  if (!totalHour) return "";

  return +(totalHour / 8).toFixed(2);
}

function getTotalTimeByMonth(totalHour) {
  if (!totalHour) return "";

  let totalHourOneMonth = 8 * 20;

  return +(totalHour / totalHourOneMonth).toFixed(2);
}

const getColumnCellNameFromIndex = (row, col) => {
  const listKeys = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let countCharacter = Math.floor(col / listKeys.length);
  if (countCharacter) {
    let prefix1 = countCharacter - 1;
    let prefix2 = col - listKeys.length * countCharacter;
    return `${listKeys[prefix1]}${listKeys[prefix2]}${row}`;
  } else return `${listKeys[col]}${row}`;
};

const getListDateInDuration = (dateFormat, startDate, endDate) => {
  let listDate = [];
  while (startDate <= endDate) {
    listDate.push(startDate.format(dateFormat));
    startDate = startDate.add(1, "day");
  }
  return listDate;
};

const getListColumn = (columns, listDate) => {
  let dayColumns = [];
  listDate.forEach(date => {
    dayColumns.push({
      title: date,
      dataIndex: date,
      key: date,
      align: "center",
      scopedSlots: { customRender: "timeSpentSeconds" },
      customTitle: true,
      isHiden: true,
      canModify: true
    });
  });

  dayColumns = columns.concat(dayColumns);
  return dayColumns;
};

const fillFullDataForDataSource = (dataSource, listDate) => {
  dataSource.forEach(row => {
    listDate.forEach(date => {
      if (!row[date]) {
        row[date] = {
          dayTrigger: date
        };
      }
    });
  });
  return dataSource;
};

const getDataTable = (dayColumns, dataSrc, listDate) => {
  let dataTable = [];

  dataSrc.issues.forEach(issue => {
    issue.fields.worklog.worklogs.forEach(worklog => {
      let started = worklog.started.substring(0, 10).replace(/-/g, "/");

      // Find in list full column, mark it as column have value
      let itemColumn = dayColumns.find(item => item.title == started);
      if (itemColumn) {
        itemColumn.isHiden = false;
        itemColumn.canModify = false;
      }

      // data table
      let worklogAuthor = worklog.author.displayName;
      let authorItem = dataTable.find(
        item => item.worklogAuthor == worklogAuthor && item.project == issue.fields.project.name
      );

      if (authorItem) {
        if (authorItem[started]) {
          authorItem[started].value += worklog.timeSpentSeconds;
          authorItem[started].worklogs.push({ ...worklog, issueKey: issue.key });
        } else {
          authorItem[started] = {
            value: worklog.timeSpentSeconds,
            worklogs: [{ ...worklog, issueKey: issue.key }],
            dayTrigger: started
          };
        }
      } else {
        let el = {
          worklogAuthor: worklogAuthor,
          [started]: {
            value: worklog.timeSpentSeconds,
            worklogs: [{ ...worklog, issueKey: issue.key }],
            dayTrigger: started
          },
          project: issue.fields.project.name
        };
        dataTable.push(el);
      }
    });
  });

  dataTable.sort(function(a, b) {
    return a.worklogAuthor.localeCompare(b.worklogAuthor);
  });

  dataTable = fillFullDataForDataSource(dataTable, listDate);
  return dataTable;
};

export { getListDateInDuration, getListColumn, getDataTable };
