import { db } from "./db";
import { products, categories } from "../shared/schema";

async function clearDatabase() {
  console.log("🗑️  Mahsulotlarni o'chirish...");
  await db.delete(products);
  console.log("✅ Mahsulotlar o'chirildi");
  
  console.log("🗑️  Kategoriyalarni o'chirish...");
  await db.delete(categories);
  console.log("✅ Kategoriyalar o'chirildi");
  
  console.log("\n✨ Database tozalandi!");
  process.exit(0);
}

clearDatabase().catch((error) => {
  console.error("❌ Xato:", error);
  process.exit(1);
});
