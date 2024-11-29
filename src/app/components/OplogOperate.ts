import { supabase } from "../api/superbase";

export async function insertOplog(
  mobile: number,
  content: string,
  status: number = 0
): Promise<boolean> {
  try {
    const logData = {
      mobile,
      log_content: content,
      status,
      oper_time: new Date(),
      create_user: mobile,
    };

    const { error } = await supabase.from("i_log").insert(logData);

    if (error) {
      console.error("Error inserting log:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in insertOplog:", error);
    return false;
  }
}
