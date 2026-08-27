"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {

  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setError("");
    setLoading(true);


    try {

      const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.error ||
          "Login failed"
        );

      }


      // Go home after successful login
      router.push("/");

    } catch (error) {

      setError(
        error instanceof Error
          ? error.message
          : "Login failed"
      );

    } finally {

      setLoading(false);

    }
  }


  return (

    <main className="
      flex
      min-h-screen
      items-center
      justify-center
      px-6
    ">

      <div className="
        w-full
        max-w-md
      ">

        <Link
          href="/"
          className="
            text-2xl
            font-semibold
          "
        >
          brd
        </Link>


        <h1 className="
          mt-10
          text-3xl
          font-semibold
        ">
          Log in
        </h1>


        <p className="
          mt-2
          text-gray-500
        ">
          Welcome back.
        </p>


        <form
          onSubmit={handleLogin}
          className="
            mt-8
            space-y-5
          "
        >

          <div>

            <label className="
              text-sm
              font-medium
            ">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
              className="
                mt-2
                w-full
                rounded-xl
                border
                border-gray-300
                px-4
                py-3
                outline-none
                focus:border-gray-900
              "
            />

          </div>


          <div>

            <label className="
              text-sm
              font-medium
            ">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
              className="
                mt-2
                w-full
                rounded-xl
                border
                border-gray-300
                px-4
                py-3
                outline-none
                focus:border-gray-900
              "
            />

          </div>


          {error && (

            <p className="
              text-sm
              text-red-600
            ">
              {error}
            </p>

          )}


          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              rounded-xl
              bg-gray-900
              px-5
              py-3
              text-sm
              font-medium
              text-white
              hover:bg-gray-800
              disabled:opacity-50
            "
          >

            {loading
              ? "Logging in..."
              : "Log in"}

          </button>

        </form>


        <p className="
          mt-6
          text-sm
          text-gray-500
        ">

          Don't have an account?{" "}

          <Link
            href="/signup"
            className="
              font-medium
              text-gray-900
            "
          >
            Sign up
          </Link>

        </p>

      </div>

    </main>

  );
}