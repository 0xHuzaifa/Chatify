import dotenv from "dotenv";
dotenv.config();

import dbConnection from "../database/db.js";
import User from "../models/User.model.js";

const PASSWORD = "Huzaifa@1";

const users = [
  { fullName: "Ayesha Khan", email: "ayesha.khan@chatify.com" },
  { fullName: "Ali Raza", email: "ali.raza@chatify.com" },
  { fullName: "Sara Ahmed", email: "sara.ahmed@chatify.com" },
  { fullName: "Bilal Hussain", email: "bilal.hussain@chatify.com" },
  { fullName: "Fatima Noor", email: "fatima.noor@chatify.com" },
];

const main = async () => {
  if (process.env.NODE_ENV === "production" && process.env.FORCE_SEED !== "1") {
    console.error(
      "Refusing to seed users in production. Set FORCE_SEED=1 to override.",
    );
    process.exit(1);
  }

  await dbConnection.connect();

  const results = [];

  for (const u of users) {
    const email = u.email.toLowerCase();

    const existing = await User.findOne({ email }).select("+password");
    if (!existing) {
      const created = await User.create({
        fullName: u.fullName,
        email,
        password: PASSWORD,
        isVerified: true,
      });
      results.push({ action: "created", id: created._id.toString(), email });
      continue;
    }

    existing.fullName = u.fullName;
    existing.password = PASSWORD;
    existing.isVerified = true;
    await existing.save();

    results.push({ action: "updated", id: existing._id.toString(), email });
  }

  console.log("Seeded test users:");
  for (const r of results) {
    console.log(`- ${r.action}: ${r.email} (${r.id})`);
  }

  console.log(`Password for all users: ${PASSWORD}`);

  await dbConnection.disconnect();
};

main().catch(async (err) => {
  console.error("Seed script failed:", err);
  try {
    await dbConnection.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
