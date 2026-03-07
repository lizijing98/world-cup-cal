import 'dotenv/config';
import { fetchWorldCupMatches } from './src/api.js';
import { generateAndSaveICal } from './src/ical-generator.js';

/**
 * 主函数 - 获取世界杯数据并生成iCal日历文件
 * @async
 * @function main
 * @returns {Promise<void>}
 */
async function main() {
  try {
    console.log('启动世界杯日历生成器...');
    
    const season = parseInt(process.env.SEASON_YEAR || '2026');
    console.log(`获取赛季数据: ${season}`);
    
    const apiData = await fetchWorldCupMatches(season);
    
    if (!apiData || !apiData.matches || apiData.matches.length === 0) {
      throw new Error('API响应中未找到比赛数据');
    }
    
    console.log(`找到 ${apiData.matches.length} 场比赛`);
    
    generateAndSaveICal(apiData.matches, season);
    
    console.log('世界杯日历生成成功！');
    console.log(`文件: WorldCupSchedule.ics`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('生成日历失败:', error.message);
    console.error('错误堆栈:', error.stack);
    
    if (process.env.GITHUB_ACTIONS === 'true') {
      console.log('::error::生成日历失败: ' + error.message);
    }
    
    process.exit(1);
  }
}

main();
