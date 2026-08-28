import { auth } from "./lib/auth";

async function setPassword() {
  // We can't directly use auth.api.signUpEmail if the user exists.
  // Wait, better-auth stores the password hash in the `account` table.
  // How does better-auth hash?
  console.log("We need to manually link a password for Alex Mercer.");
}

setPassword();
