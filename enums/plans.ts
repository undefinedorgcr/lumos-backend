/**
 * Enum representing the available Lumos subscription plans.
 */
export enum LumosPlan {
    Free = "FREE",
    Pro = "PRO",
    Degen = "DEGEN",
}
  
/**
 * Interface defining the structure of a Lumos plan.
 */
interface PlanDetails {
    expirationDays: number;
    dailyRequests: number;
}
  
/**
 * Mapping of Lumos plans to their respective details.
 */
const PlanDetailsMap: Record<LumosPlan, PlanDetails> = {
    [LumosPlan.Free]: {
        expirationDays: 0, // No expiration
        dailyRequests: 10,
    },
    [LumosPlan.Pro]: {
        expirationDays: 30,
        dailyRequests: 50,
    },
    [LumosPlan.Degen]: {
        expirationDays: 30,
        dailyRequests: Infinity,
    },
};
  
/**
 * Retrieves details of a given Lumos plan.
 * @param plan - The Lumos plan to retrieve details for.
 * @returns The corresponding plan details.
 */
export const getPlanDetails = (plan: LumosPlan): PlanDetails => {
    return PlanDetailsMap[plan];
}

/**
 * Validates if the user type is a valid Lumos plan.
 */
export const isValidUserType = (user_type: any): boolean => {
    return Object.values(LumosPlan).includes(user_type);
}

/**
 * Converts a string representing a Lumos plan into a corresponding LumosPlan enum.
 * @param planString - The string representing a Lumos plan (e.g., "FREE", "PRO", "DEGEN").
 * @returns The corresponding LumosPlan enum or null if invalid.
 */
export const getLumosPlanFromString = (planString: string): LumosPlan | null => {
    switch (planString.toUpperCase()) {
        case LumosPlan.Free:
            return LumosPlan.Free;
        case LumosPlan.Pro:
            return LumosPlan.Pro;
        case LumosPlan.Degen:
            return LumosPlan.Degen;
        default:
            return null; // Invalid plan string
    }
}