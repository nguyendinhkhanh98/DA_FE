const localesMess = require("locales-message");

const sheetId = "1lLpjuQZLXLO1ZkKxpw0FRyw-1cI3PLGFNnwAHE8NEVY";
const range = "A2:D";
const pathFolder = "locales";
localesMess.genMessage(sheetId, range, pathFolder);
