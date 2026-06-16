import mongoose from "mongoose";
import dotenv from "dotenv";
import Plan from "../models/Plan.js";

dotenv.config();

const plans = [
  {
    name: "Starter",
    slug: "starter",
    price: 5,
    plays: 10,
    description: "Perfect for trying the platform.",
  },
  {
    name: "Basic",
    slug: "basic",
    price: 10,
    plays: 50,
    description: "Affordable plan for regular users.",
  },
  {
    name: "Pro",
    slug: "pro",
    price: 19,
    plays: 150,
    description: "Best value for frequent users.",
  },
  {
    name: "Ultra",
    slug: "ultra",
    price: 49,
    plays: 500,
    description: "Ideal for power users.",
  },
];

const seedPlans = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    for (const plan of plans) {
      const exists = await Plan.findOne({ slug: plan.slug });
      if (!exists) {
        await Plan.create(plan);
        console.log(`✅ ${plan.name} plan created`);
      } else {
        console.log(`⚡ ${plan.name} already exists`);
      }
    }

    console.log("🎉 Plan seeding completed");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedPlans();
