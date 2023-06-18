export function appendDetailTableWorklogToWorksheet(worksheet, columns, rows, duration) {
  worksheet.mergeCells(1, 1, 1, 8);
  const titleCell = worksheet.getCell(getColumnCellNameFromIndex(1, 0));
  const borderStyles = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" }
  };
  titleCell.value = `QCD Manegement Figures generated: From ${duration[0]} to ${duration[1]}`;
  titleCell.alignment = { vertical: "middle", horizontal: "center" };

  worksheet.getRow(1).height = 40;
  worksheet.getCell("A1").font = {
    name: "Arial Black",
    bold: true,
    family: 2,
    size: 12
  };

  worksheet.addTable({
    name: "AllWorklogs",
    ref: "A2",
    headerRow: true,
    columns: columns,
    rows: rows
  });

  columns.forEach((column, index) => {
    worksheet.getColumn(index + 1).width = column.width;
    let col = getColumnCellNameFromIndex(2, index);
    worksheet.getCell(col).alignment = { wrapText: true };
  });

  worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
    row.eachCell({ includeEmpty: true }, function (cell, colNumber) {
      cell.border = borderStyles;
    });
  });

  return worksheet;
}

export const resortDataExcel = dataExcelFile => {
  return dataExcelFile.map(row => {
    return [
      row.name,
      row.totalManHour,
      row.bugRatioByNumber,
      row.bugRatioByHour,
      row.degrateByNumber,
      row.degrateByHour,
      row.cost,
      row.delivery
    ];
  });
};

const getColumnCellNameFromIndex = (row, col) => {
  const listKeys = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let countCharacter = Math.floor(col / listKeys.length);
  if (countCharacter) {
    let prefix1 = countCharacter - 1;
    let prefix2 = col - listKeys.length * countCharacter;
    return `${listKeys[prefix1]}${listKeys[prefix2]}${row}`;
  } else return `${listKeys[col]}${row}`;
};

export const divide = (a, b) => {
  if (b == 0) return 0;
  return a / b;
};
