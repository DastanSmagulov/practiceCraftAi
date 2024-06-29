"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import signUp from "@/firebase/auth/signup";
import { useRouter } from "next/navigation";

function Page() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();

  const handleForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { result, error } = await signUp(email, password);

    if (error) {
      console.log(error);
      return;
    }

    // else successful
    console.log(result);
    router.push("/admin");
  };

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  return (
    <div className="wrapper">
      <div className="form-wrapper">
        <h1 className="mt-60 mb-30">Sign up</h1>
        <form onSubmit={handleForm} className="form">
          <label htmlFor="email">
            <p>Email</p>
            <input
              onChange={handleEmailChange}
              required
              type="email"
              name="email"
              id="email"
              placeholder="example@mail.com"
            />
          </label>
          <label htmlFor="password">
            <p>Password</p>
            <input
              onChange={handlePasswordChange}
              required
              type="password"
              name="password"
              id="password"
              placeholder="password"
            />
          </label>
          <button type="submit">Sign up</button>
        </form>
      </div>
    </div>
  );
}

export default Page;
