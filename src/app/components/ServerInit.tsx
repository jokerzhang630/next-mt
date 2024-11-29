import { initScheduler } from "@/app/lib/schedule";

let isSchedulerInitialized = false;

export function ServerInit() {
  if (!isSchedulerInitialized) {
    initScheduler();
    isSchedulerInitialized = true;
  }
  return null;
}
