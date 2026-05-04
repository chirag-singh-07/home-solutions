import "dotenv/config";
import { db } from "./server/db";
import { users } from "./shared/schema";
import { eq } from "drizzle-orm";

async function updatePassword() {
  try {
    console.log("Updating password for user 'bichitra'...");
    
    const result = await db
      .update(users)
      .set({ password: "admin123" })
      .where(eq(users.username, "bichitra"))
      .returning();

    if (result.length > 0) {
      console.log("✅ Password updated successfully to: admin123");
    } else {
      console.log("❌ User 'bichitra' not found in the database.");
    }
  } catch (error) {
    console.error("Error updating password:", error);
  } finally {
    process.exit(0);
  }
}

updatePassword();
