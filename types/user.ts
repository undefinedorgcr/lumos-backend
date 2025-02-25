export type User = { 
    _id?: string;
    email: string;
    ekubo_fav_pools?: string[];
    user_type?: string;
    plan_exp_date?:Date;
    remaining_requests?: number;
    uId: string;
};