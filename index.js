import xlsx from "node-xlsx";
import moment from "moment";
import fs from "fs";
import { flagMap } from "./flagMap.js";

const timeFormat = "YYYYMMDDTHHmmss";

const BEGIN = "BEGIN:VCALENDAR\n";
const VERSION = "VERSION:2.0\n";
const PRODID = "PRODID:-//WorldCup/World Cup Calendar//zh-CN\n";
const BEGIN_EVENT = "BEGIN:VEVENT\n";
const SUMMARY = "SUMMARY:";
const DTSTART = 'DTSTART;TZID="UTC+08:00";VALUE=DATE-TIME:';
const DTEND = 'DTEND;TZID="UTC+08:00";VALUE=DATE-TIME:';
const END_EVENT = "END:VEVENT\n";
const END = "END:VCALENDAR\n";

// 解析得到文档中的所有 sheet
var sheets = xlsx.parse("WorldCupSchedule.xlsx", {
	cellDates: true,
});

var calData = BEGIN + VERSION + PRODID;

// 遍历 sheet
sheets.forEach(function (sheet) {
	// 读取每行内容
	for (var rowId in sheet["data"]) {
		if (rowId == 0) {
			continue;
		}
		var row = sheet["data"][rowId];
		calData += BEGIN_EVENT;
		var group = row[0];
		var teamA = row[1];
		var teamB = row[2];
		calData += SUMMARY + group + "-" + row[1] + flagMap[row[1]] + "vs" + row[2] + flagMap[row[2]] + "\n";
		var beginTime = moment(new Date(row[3].getTime() + 43 * 1000)).format(timeFormat) + "Z";
		calData += DTSTART + beginTime + "\n";
		var endTime = moment(new Date(row[4].getTime() + 43 * 1000)).format(timeFormat) + "Z";
		calData += DTEND + endTime + "\n";
		calData += END_EVENT;
	}
});

calData += END;

fs.writeFile("WorldCupSchedule.ics", calData, function (err) {
	if (err) throw err;
	console.log("ics created successfully");
});
