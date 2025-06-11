import { type NextRequest, NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/auth";
import { getUsersCollection } from "@/lib/mongodb";
import bcrypt from "bcrypt";

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromSession(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const users = await getUsersCollection();

    // Ambil user beserta password hash
    const userWithPassword = await users.findOne({ _id: user._id });
    if (!userWithPassword) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verifikasi current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      userWithPassword.password
    );
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    const SALT_ROUNDS = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password di database
    await users.updateOne(
      { _id: user._id },
      { $set: { password: hashedNewPassword } }
    );

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
