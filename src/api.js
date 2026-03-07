import fs from 'fs';
import path from 'path';
import axios from 'axios';

const BASE_URL = 'https://api.football-data.org';
const CACHE_FILE = path.join(process.cwd(), 'cache', 'api-cache.json');
const RATE_LIMIT_DELAY = 6000;

let lastRequestTime = 0;

/**
 * 强制执行速率限制，确保请求间隔符合API限制
 * @async
 * @function enforceRateLimit
 * @returns {Promise<void>}
 */
async function enforceRateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    const delayNeeded = RATE_LIMIT_DELAY - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, delayNeeded));
  }
  
  lastRequestTime = Date.now();
}

/**
 * 确保缓存目录存在，不存在则创建
 * @function ensureCacheDirectory
 */
function ensureCacheDirectory() {
  const cacheDir = path.dirname(CACHE_FILE);
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
}

/**
 * 读取缓存数据
 * @function readCache
 * @returns {Object|null} 缓存的数据对象，如果缓存不存在或已过期则返回null
 */
function readCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const cacheData = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      const cacheAge = Date.now() - new Date(cacheData.timestamp).getTime();
      const maxAge = parseInt(process.env.CACHE_DURATION_HOURS || '24') * 60 * 60 * 1000;
      
      if (cacheAge < maxAge) {
        console.log('使用缓存的API响应数据');
        return cacheData.data;
      } else {
        console.log('缓存已过期，获取最新数据');
      }
    }
  } catch (error) {
    console.warn('读取缓存失败:', error.message);
  }
  return null;
}

/**
 * 将数据写入缓存文件
 * @function writeCache
 * @param {Object} data - 要缓存的数据
 */
function writeCache(data) {
  try {
    ensureCacheDirectory();
    const cacheData = {
      timestamp: new Date().toISOString(),
      data: data
    };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2));
    console.log('API响应数据已成功缓存');
  } catch (error) {
    console.warn('写入缓存失败:', error.message);
  }
}

/**
 * 从football-data.org API获取世界杯比赛数据
 * @async
 * @function fetchWorldCupMatches
 * @param {number} [season=2026] - 赛季年份
 * @returns {Promise<Object>} 返回包含比赛数据的对象
 * @throws {Error} 当API密钥未设置或API请求失败时抛出错误
 * @example
 * const matches = await fetchWorldCupMatches(2026);
 * console.log(matches.matches.length);
 */
export async function fetchWorldCupMatches(season = 2026) {
  const cachedData = readCache();
  if (cachedData) {
    return cachedData;
  }

  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  
  if (!apiKey) {
    throw new Error('FOOTBALL_DATA_API_KEY 环境变量未设置');
  }

  try {
    await enforceRateLimit();
    
    const url = `${BASE_URL}/v4/competitions/WC/matches`;
    const params = { season };
    
    console.log(`从API获取比赛数据: ${url}?season=${season}`);
    
    const response = await axios.get(url, {
      params,
      headers: {
        'X-Auth-Token': apiKey
      },
      timeout: 30000
    });

    const data = response.data;
    
    writeCache(data);
    
    console.log(`成功获取 ${data.matches?.length || 0} 场比赛数据`);
    
    return data;
    
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;
      
      if (status === 403) {
        throw new Error(`API速率限制超出或API密钥无效: ${message}`);
      } else if (status === 404) {
        throw new Error(`资源未找到: ${message}`);
      } else if (status === 429) {
        throw new Error(`请求过于频繁: ${message}`);
      } else {
        throw new Error(`API请求失败，状态码 ${status}: ${message}`);
      }
    } else if (error.request) {
      throw new Error(`API未响应: ${error.message}`);
    } else {
      throw new Error(`从API获取数据失败: ${error.message}`);
    }
  }
}

/**
 * 清除缓存文件
 * @function clearCache
 */
export function clearCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      fs.unlinkSync(CACHE_FILE);
      console.log('缓存已清除');
    }
  } catch (error) {
    console.warn('清除缓存失败:', error.message);
  }
}
