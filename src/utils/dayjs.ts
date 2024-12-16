// utils/dayjs.ts
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

const defaultTimezone = "Asia/Shanghai";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(defaultTimezone);
//设置默认时区为UTC

export default dayjs;

export function getServerTime() {
  return dayjs().tz(defaultTimezone).format("YYYY-MM-DD HH:mm:ss");
}

export function getServerMinute() {
  return dayjs().tz(defaultTimezone).minute();
}

export function getServerTimestamp() {
  return dayjs().tz(defaultTimezone).valueOf();
}

export function getServerDayTimestamp() {
  return dayjs().tz(defaultTimezone).startOf("day").valueOf();
}
