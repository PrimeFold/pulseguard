'use server'

import { redirect, useSearchParams } from "next/navigation";
import { auth } from "./auth";

export async function getUser(){
    try {
        const session = await auth.api.getSession();
        const user = session?.user;
        if(!user){
            redirect("/login");
        }
        return user;
    } catch (error) {
        throw new Error((error as Error).message);
    }
}

