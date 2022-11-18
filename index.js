import xlsx from "node-xlsx";
import moment from "moment";
import fs from "fs";
import flagMap from "./src/flagMap.js";
import constant from "./src/constant.js";

const timeFormat = "YYYYMMDDTHHmmss";

// 解析得到文档中的所有 sheet
var sheets = xlsx.parse("WorldCupSchedule.xlsx", {
	cellDates: true,
});

var calData = constant.BEGIN + constant.VERSION + constant.PRODID + constant.CALSCALE + constant.CALNAME + constant.TIMEZONE + constant.APPLE_COLOR;

// 遍历 sheet
sheets.forEach(function (sheet) {
	// 读取每行内容
	for (var rowId in sheet["data"]) {
		if (rowId == 0) {
			continue;
		}
		var row = sheet["data"][rowId];
		calData += constant.BEGIN_EVENT;
		var group = row[0];
		var teamA = row[1];
		var teamB = row[2];
		calData += constant.SUMMARY + group + "-" + teamA + flagMap.teamA + "vs" + teamB + flagMap.teamB + "\n";
		var beginTime = moment(new Date(row[3].getTime() + 43 * 1000)).format(timeFormat) + "Z";
		calData += constant.DTSTART + beginTime + "\n";
		var endTime = moment(new Date(row[4].getTime() + 43 * 1000)).format(timeFormat) + "Z";
		calData += constant.DTEND + endTime + "\n";
		if (row[5]) {
			calData += constant.DESCRIPTION + row[5] + "\n" + constant.DESC_TEXT;
		} else {
			calData += constant.DESCRIPTION + constant.DESC_TEXT;
		}
		calData += constant.END_EVENT;
	}
});

calData += constant.END;

fs.writeFile("WorldCupSchedule1.ics", calData, function (err) {
	if (err) throw err;
	console.log("ics created successfully");
});
