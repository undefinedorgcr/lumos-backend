import { ObjectId } from "mongodb";
import clientPromise from "../lib/mongodb";
import { getFutureDate } from "../utils/utils";
import { LumosPlan, getLumosPlanFromString, getPlanDetails } from "../enums/plans";

const getDB = async () => {
    const client = await clientPromise.connect();
    return client.db("lumos").collection("users");
};

const getAllUsers = async (): Promise<any[]> => {
    try {
        const users = await (await getDB())
            .find({})
            .sort({ metacritic: -1 })
            .limit(100)
            .toArray();
        return users;
    } catch (e) {
        console.error(e);
        return [];
    }
};

const getUserById = async (id: string): Promise<any | null> => {
    try {
        const user = await (await getDB()).findOne({ _id: new ObjectId(id) });
        return user;
    } catch (e) {
        console.error(e);
        return null;
    }
};

const getUserByUId = async (uId: string): Promise<any | null> => {
    try {
        const user = await (await getDB()).findOne({ uId });
        return user;
    } catch (e) {
        console.error(e);
        return null;
    }
};

const createUser = async (user: any): Promise<string | null> => {
    try {
        const db = await getDB();
        const existingUser = await db.findOne({ uId: user.uId });

        if (existingUser) {
            console.log("User with this uId already exists.");
            return existingUser._id.toString();
        }

        const planDetails = getPlanDetails(user.user_type);
        if (planDetails) {
            if (user.user_type === LumosPlan.Free) {
                user.plan_exp_date = null;
            } else {
                user.plan_exp_date = getFutureDate(planDetails.expirationDays);
            }
            user.remaining_requests = planDetails.dailyRequests;
        }
        const result = await db.insertOne(user);
        return result.insertedId.toString();  
    } catch (e) {
        console.error("Database error:", e);
        return null;
    }
};

const updateUser = async (user: any): Promise<any | null> => {
    try {
        const { _id, ...updateData } = user;
        const objectId = new ObjectId(_id);

        const result = await (await getDB()).updateOne(
            { _id: objectId },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            console.error("User not found.");
            return null;
        }

        return { _id, ...updateData };
    } catch (error) {
        console.error("Error updating user:", error);
        return null;
    }
};

const deleteUser = async (id: string): Promise<boolean> => {
    try {
        const result = await (await getDB()).deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    } catch (e) {
        console.error(e);
        return false;
    }
};

const updateUserType = async (uId: string, newUserType: string): Promise<Object | null> => {
    try {
        const db = await getDB();
        const userDb = await db.findOne({ uId });

        if (!userDb) {
            console.error("User not found.");
            return null;
        }
        const newPlan = getLumosPlanFromString(newUserType);
        if (!newPlan) {
            console.error("User plan not found");
            return null;
        }

        const planDetails = getPlanDetails(newPlan);
        if (!planDetails) {
            console.error("Plan details not found.");
            return null;
        }

        const updateData = {
            user_type: newPlan,
            remaining_requests: planDetails.dailyRequests,
            plan_exp_date: newPlan === LumosPlan.Free ? null : getFutureDate(planDetails.expirationDays),
        };

        const result = await db.updateOne({ uId }, { $set: updateData });

        if (result.matchedCount === 0) {
            console.error("User not found.");
            return null;
        }

        return { uId, ...updateData };
    } catch (error) {
        console.error("Error updating user plan:", error);
        return null;
    }
};

const updateEkuboFavPools = async (uId: string, newEkuboFavPool: {
    token1LogoUrl: string;
    token0LogoUrl: string; token0: string; token1: string; fee: number; tickSpacing: number 
}): Promise<Object | null> => {
    try {
        const db = await getDB();
        const userDb = await db.findOne({ uId });

        if (!userDb) {
            console.error("User not found.");
            return null;
        }

        const existingPools: Array<{ token0: string; token1: string; fee: number; tickSpacing: number; token0LogoUrl: string; token1LogoUrl: string}> = userDb.ekubo_fav_pools || [];

        const isDuplicate = existingPools.some(
            pool =>
                pool.token0 === newEkuboFavPool.token0 &&
                pool.token1 === newEkuboFavPool.token1 &&
                pool.fee === newEkuboFavPool.fee &&
                pool.tickSpacing === newEkuboFavPool.tickSpacing &&
                pool.token0LogoUrl === newEkuboFavPool.token0LogoUrl &&
                pool.token1LogoUrl === newEkuboFavPool.token1LogoUrl
        );

        if (isDuplicate) {
            console.log("Pool already exists in favorites.");
            return { uId, ekubo_fav_pools: existingPools };
        }

        const updatedPools = [...existingPools, newEkuboFavPool];

        const result = await db.updateOne({ uId }, { $set: { ekubo_fav_pools: updatedPools } });

        if (result.matchedCount === 0) {
            console.error("User not found.");
            return null;
        }

        return { uId, ekubo_fav_pools: updatedPools };
    } catch (error) {
        console.error("Error updating ekubo fav pools:", error);
        return null;
    }
};

const removeEkuboFavPool = async (
    uId: string,
    pool: { token0: string; token1: string; fee: number; tickSpacing: number }
  ): Promise<Object | null> => {
    try {
      const db = await getDB();
      const userDb = await db.findOne({ uId });
  
      if (!userDb) {
        console.error("User not found.");
        return null;
      }
  
      const existingPools: Array<{ token0: string; token1: string; fee: number; tickSpacing: number }> =
        userDb.ekubo_fav_pools || [];
  
      const updatedPools = existingPools.filter(
        (p) =>
          !(p.token0 === pool.token0 && p.token1 === pool.token1 && p.fee === pool.fee && p.tickSpacing === pool.tickSpacing)
      );
  
      if (existingPools.length === updatedPools.length) {
        console.log("Pool not found in favorites.");
        return null;
      }

      const result = await db.updateOne({ uId }, { $set: { ekubo_fav_pools: updatedPools } });
  
      if (result.matchedCount === 0) {
        console.error("User not found.");
        return null;
      }
  
      return { uId, ekubo_fav_pools: updatedPools };
    } catch (error) {
      console.error("Error removing Ekubo favorite pool:", error);
      return null;
    }
};

export default { 
    getAllUsers, 
    getUserById, 
    createUser, 
    updateUser, 
    deleteUser, 
    getUserByUId, 
    updateUserType,
    updateEkuboFavPools,
    removeEkuboFavPool
};