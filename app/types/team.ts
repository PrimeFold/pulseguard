import { User } from "@/lib/generated/prisma/client";
import { Role } from "@/lib/generated/prisma/enums";

export interface TeamParams{
    organizationId:string;
    page:number;
    limit:number;
    id?:string;
    role?:Role;
    searchQuery?:string;
}