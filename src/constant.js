export default {
	// 日历常量
	BEGIN: "BEGIN:VCALENDAR\n", // 日历开始
	VERSION: "VERSION:2.0\n", // 遵循iCalendar版本号
	PRODID: "PRODID:-//Ricky LL/World Cup Calendar//zh-CN\n", // 信息
	CALSCALE: "CALSCALE:GREGORIAN\n", // 历法:公历
	CALNAME: "X-WR-CALNAME:2022卡塔尔世界杯⚽🏆\n", // 通用扩展属性，表示本日历的名称
	TIMEZONE: "X-WR-TIMEZONE:Asia/Shanghai\n", // 通用扩展属性，表示时区
	APPLE_COLOR: "X-APPLE-CALENDAR-COLOR:#FFD700\n", // Apple 扩展属性，日历颜色
	END: "END:VCALENDAR\n",
	// 事件常量
	BEGIN_EVENT: "BEGIN:VEVENT\n", // 事件开始
	SUMMARY: "SUMMARY:", // 标题
	DTSTART: 'DTSTART;TZID="UTC+08:00";VALUE=DATE-TIME:', // 开始时间
	DTEND: 'DTEND;TZID="UTC+08:00";VALUE=DATE-TIME:', // 结束时间
	DESCRIPTION: "DESCRIPTION:",
	DESC_TEXT: "代码开源地址:https://github.com/lizijing98/world-cup-cal\n", // 描述
	END_EVENT: "END:VEVENT\n", // 事件结束
};
