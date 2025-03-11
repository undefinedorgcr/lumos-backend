export enum LumosPlan {
	Free = 'FREE',
	Pro = 'PRO',
	Degen = 'DEGEN',
}
interface PlanDetails {
	expirationDays: number;
	dailyRequests: number;
}

const PlanDetailsMap: Record<LumosPlan, PlanDetails> = {
	[LumosPlan.Free]: {
		expirationDays: 0,
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

export const getPlanDetails = (plan: LumosPlan): PlanDetails => {
	return PlanDetailsMap[plan];
};

export const isValidUserType = (user_type: any): boolean => {
	return Object.values(LumosPlan).includes(user_type);
};

export const getLumosPlanFromString = (
	planString: string
): LumosPlan | null => {
	switch (planString.toUpperCase()) {
		case LumosPlan.Free:
			return LumosPlan.Free;
		case LumosPlan.Pro:
			return LumosPlan.Pro;
		case LumosPlan.Degen:
			return LumosPlan.Degen;
		default:
			return null;
	}
};
