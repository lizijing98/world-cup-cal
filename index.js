import xlsx from "node-xlsx";
import moment from "moment";
import fs from "fs";

// const timeFormat = "YYYY-MM-DD HH:mm:ss";
const timeFormat = "YYYYMMDDTHHmmss";

const BEGIN = "BEGIN:VCALENDAR\n";
const VERSION = "VERSION:1.0\n";
const PRODID = "PRODID:-//WorldCup//World Cup Calendar//zh-CN\n";
const BEGIN_EVENT = "BEGIN:VEVENT\n";
const SUMMARY = "SUMMARY:";
const DTSTART = "DTSTART:";
const DTEND = "DTEND:";
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
		var title = row[0];
		calData += SUMMARY + title + "\n";
		var beginTime = moment(new Date(row[1].getTime() + 43 * 1000)).format(timeFormat) + "Z";
		calData += DTSTART + beginTime + "\n";
		var endTime = moment(new Date(row[2].getTime() + 43 * 1000)).format(timeFormat) + "Z";
		calData += DTEND + endTime + "\n";
		calData += END_EVENT;
	}
});

calData += END;

fs.writeFile("WorldCupSchedule.ics", calData, function (err) {
	if (err) throw err;
	console.log("ics created successfully");
});
