import fs from 'fs';
import { createReadStream } from 'fs';
import csv from 'csv-parser';
import moment from 'moment';
import constant from './src/constant.js';

const timeFormat = 'YYYYMMDDTHHmmss';

// 读取队伍信息
const teamInfo = JSON.parse(fs.readFileSync('./src/teamInfo_2026.json', 'utf8'));

// 创建队伍名称到国旗的映射
const flagMap = {};
teamInfo.forEach(team => {
  flagMap[team.nameCn] = team.flag;
});
flagMap.other = '❔';

// 读取并解析 CSV 文件
const data = [];

const parseCSV = () => {
  return new Promise((resolve, reject) => {
    createReadStream('Schedule_2026.csv')
      .pipe(csv())
      .on('data', (row) => {
        // 处理每一行数据
        const processedRow = {};
        Object.entries(row).forEach(([key, value]) => {
          // 去除引号
          processedRow[key.trim().replace(/"/g, '')] = value.trim().replace(/"/g, '');
        });
        data.push(processedRow);
      })
      .on('end', () => {
        resolve();
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

// 主函数
async function main() {
  try {
    // 解析 CSV 文件
    await parseCSV();
    
    let calData = 
      constant.BEGIN + constant.VERSION + constant.PRODID + constant.CALSCALE + 'X-WR-CALNAME:2026世界杯⚽🏆\n' + constant.APPLE_COLOR;

    // 处理每一行数据
    data.forEach(row => {
      const group = row['分组'];
      const teamA = row['TeamA'];
      const teamB = row['TeamB'];
      const startTimeUTC = row['开始时间(UTC)'];
      const endTimeUTC = row['结束时间(UTC)'];
      const note = row['备注'];

      if (!group || !teamA || !teamB) {
        return;
      }

      calData += constant.BEGIN_EVENT;

      // 添加摘要
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

      // 处理时间 - 明确使用 UTC 时区
      const beginTime = moment.utc(startTimeUTC).format(timeFormat) + 'Z'; // 开始时间(UTC)
      console.debug(`[index] ==>`, `beginTime: `, beginTime);
      const endTime = moment.utc(endTimeUTC).format(timeFormat) + 'Z'; // 结束时间(UTC)
      console.debug(`[index] ==>`, `endTime: `, endTime);
      calData += constant.DTSTART + beginTime + '\n';
      calData += constant.DTEND + endTime + '\n';

      // 添加描述
      if (note) {
        calData += constant.DESCRIPTION + note + '\n' + constant.DESC_TEXT;
      } else {
        calData += constant.DESCRIPTION + constant.DESC_TEXT;
      }

      calData += constant.END_EVENT;
    });

    calData += constant.END;

    // 写入到根目录
    fs.writeFileSync('./WorldCupSchedule.ics', calData);
    console.log('2026 World Cup ics created successfully');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// 运行主函数
main();
