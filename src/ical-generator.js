import fs from 'fs';
import moment from 'moment-timezone';
import constant from './constant.js';
import { formatMatchTitle, getStageName, getTeamMapping } from './team-mapper.js';

const TIME_FORMAT = 'YYYYMMDDTHHmmss';

/**
 * 格式化比赛结果信息
 * @function formatMatchResult
 * @param {Object} match - 比赛对象
 * @returns {string} 格式化的比赛结果字符串
 */
function formatMatchResult(match) {
  if (match.status !== 'FINISHED' || !match.score) {
    return '';
  }

  const homeTeam = getTeamMapping(match.homeTeam?.name);
  const awayTeam = getTeamMapping(match.awayTeam?.name);
  const homeScore = match.score.fullTime?.home;
  const awayScore = match.score.fullTime?.away;

  if (homeScore === null || homeScore === undefined || 
      awayScore === null || awayScore === undefined) {
    return '';
  }

  return `${homeTeam.nameCn}${homeTeam.flag} ${homeScore}:${awayScore} ${awayTeam.nameCn}${awayTeam.flag}`;
}

/**
 * 格式化 iCal 文本，确保换行符兼容性
 * @function formatICalText
 * @param {string} text - 原始文本
 * @returns {string} 格式化后的 iCal 文本
 */
function formatICalText(text) {
  return text.replace(/\n/g, '\\n');
}

/**
 * 生成iCal格式的日历文件内容
 * @function generateICalFile
 * @param {Array<Object>} matches - 比赛数据数组
 * @param {number} [season=2026] - 赛季年份
 * @returns {string} iCal格式的日历文件内容
 * @throws {Error} 当没有提供比赛数据时抛出错误
 * @example
 * const calData = generateICalFile(matches, 2026);
 */
export function generateICalFile(matches, season = 2026) {
  if (!matches || matches.length === 0) {
    throw new Error('未提供比赛数据用于生成iCal文件');
  }

  let calData = 
    constant.BEGIN + 
    constant.VERSION + 
    constant.PRODID + 
    constant.CALSCALE + 
    `X-WR-CALNAME:${season}世界杯⚽🏆\n` + 
    constant.APPLE_COLOR;

  const sortedMatches = [...matches].sort((a, b) => 
    new Date(a.utcDate) - new Date(b.utcDate)
  );

  const updateTime = moment().tz('Asia/Shanghai').format('YYYY/MM/DD');

  sortedMatches.forEach(match => {
    if (!match.utcDate || !match.homeTeam || !match.awayTeam) {
      console.warn('跳过无效比赛:', match.id);
      return;
    }

    calData += constant.BEGIN_EVENT;

    const title = formatMatchTitle(match);
    calData += constant.SUMMARY + title + '\n';

    const startTime = moment.utc(match.utcDate).format(TIME_FORMAT) + 'Z';
    const endTime = moment.utc(match.utcDate).add(2, 'hours').format(TIME_FORMAT) + 'Z';
    
    calData += constant.DTSTART + startTime + '\n';
    calData += constant.DTEND + endTime + '\n';

    let description = '';
    
    if (match.stage) {
      description += `阶段: ${getStageName(match.stage)}\n`;
    }
    
    if (match.matchday) {
      description += `轮次: 第${match.matchday}轮\n`;
    }

    const matchResult = formatMatchResult(match);
    if (matchResult) {
      description += `比分: ${matchResult}\n`;
    }

    description += `更新时间: ${updateTime}\n`;
    description += `开源地址:https://github.com/lizijing98/world-cup-cal`;
    
    calData += constant.DESCRIPTION + formatICalText(description) + '\n';

    calData += constant.END_EVENT;
  });

  calData += constant.END;

  return calData;
}

/**
 * 保存iCal文件到磁盘
 * @function saveICalFile
 * @param {string} calData - iCal格式的日历数据
 * @param {string} [filename='WorldCupSchedule.ics'] - 输出文件名
 * @returns {boolean} 保存成功返回true
 * @throws {Error} 当文件保存失败时抛出错误
 * @example
 * saveICalFile(calData, 'WorldCupSchedule.ics');
 */
export function saveICalFile(calData, filename = 'WorldCupSchedule.ics') {
  try {
    fs.writeFileSync(filename, calData, 'utf8');
    console.log(`iCal文件保存成功: ${filename}`);
    return true;
  } catch (error) {
    console.error('保存iCal文件失败:', error.message);
    throw error;
  }
}

/**
 * 生成并保存iCal文件
 * @function generateAndSaveICal
 * @param {Array<Object>} matches - 比赛数据数组
 * @param {number} [season=2026] - 赛季年份
 * @param {string} [filename='WorldCupSchedule.ics'] - 输出文件名
 * @returns {string} 生成的iCal数据
 * @example
 * const calData = generateAndSaveICal(matches, 2026, 'WorldCupSchedule.ics');
 */
export function generateAndSaveICal(matches, season = 2026, filename = 'WorldCupSchedule.ics') {
  const calData = generateICalFile(matches, season);
  saveICalFile(calData, filename);
  return calData;
}
