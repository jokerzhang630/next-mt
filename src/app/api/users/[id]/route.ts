import { supabase } from "@/app/api/superbase";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // context: { params: { id: string } }
  try {
    // const id = context.params.id;
    const { id } = await params;
    const { error } = await supabase.from("i_user").delete().eq("mobile", id);
    if (error) {
      throw error;
    }
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
