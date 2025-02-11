import { hashPassword } from "./auth";
import { storage } from "./storage";

async function createAdmin() {
  const hashedPassword = await hashPassword("admin123");
  const adminUser = await storage.createUser({
    email: "admin@example.com",
    password: hashedPassword,
    is_admin: true
  });
  console.log("Admin user created:", adminUser);
}

createAdmin().catch(console.error);