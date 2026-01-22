import xlsx from 'node-xlsx';
import moment from 'moment';
import fs from 'fs';
import flagMap from './src/flagMap.js';
import constant from './src/constant.js';

const timeFormat = 'YYYYMMDDTHHmmss';

// 解析得到文档中的所有 sheet
const sheets = xlsx.parse('WorldCupSchedule.xlsx', {
	cellDates: true,
});

let calData =
	constant.BEGIN + constant.VERSION + constant.PRODID + constant.CALSCALE + 'X-WR-CALNAME:2022卡塔尔世界杯⚽🏆\n' + constant.APPLE_COLOR;

// 遍历 sheet
sheets.forEach(function (sheet) {
	// 读取每行内容
	for (let rowId in sheet['data']) {
		if (rowId == 0) {
			continue;
		}
		let row = sheet['data'][rowId];
		let group = row[0]; // 分组
		let teamA = row[1]; // TeamA
		let teamB = row[2]; // TeamB
		if (!group) {
			break;
		}
		calData += constant.BEGIN_EVENT;
		calData +=
			constant.SUMMARY +
			group +
			'-' +
			teamA +
			(flagMap[teamA] ? flagMap[teamA] : flagMap.other) +
			'vs' +
			teamB +
			(flagMap[teamB] ? flagMap[teamB] : flagMap.other) +
			'\n';
		let beginTime = moment(new Date(row[6].getTime() + 43 * 1000)).format(timeFormat) + 'Z'; // 开始时间(UTC)
		calData += constant.DTSTART + beginTime + '\n';
		let endTime = moment(new Date(row[7].getTime() + 43 * 1000)).format(timeFormat) + 'Z'; // 结束时间(UTC)
		calData += constant.DTEND + endTime + '\n';
		if (row[5]) {
			calData += constant.DESCRIPTION + row[5] + '\n' + constant.DESC_TEXT;
		} else {
			calData += constant.DESCRIPTION + constant.DESC_TEXT;
		}
		calData += constant.END_EVENT;
	}
});

calData += constant.END;

fs.mkdir('./dist', { recursive: true }, (err) => {
	if (err) throw err;
	fs.writeFile('./dist/WorldCupSchedule.ics', calData, function (err) {
		if (err) throw err;
		console.log('ics created in dist successfully');
	});
});
fs.writeFile('./WorldCupSchedule.ics', calData, function (err) {
	if (err) throw err;
	console.log('ics created successfully');
});
