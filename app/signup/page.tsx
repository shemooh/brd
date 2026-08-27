"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {

  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  async function handleSignup(
    event: FormEvent
  ) {

    event.preventDefault();

    setError("");
    setLoading(true);


    try {

      const response = await fetch(
        "http://127.0.0.1:5000/api/auth/signup",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            name,
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
          "Could not create account"
        );

      }


      router.push("/");


    } catch (error) {

      setError(
        error instanceof Error
          ? error.message
          : "Could not create account"
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
      bg-gray-50
      px-6
    ">

      <div className="
        w-full
        max-w-md
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-8
        shadow-sm
      ">


        <div className="mb-8">

          <Link
            href="/"
            className="text-2xl font-semibold"
          >
            brd
          </Link>

          <h1 className="
            mt-8
            text-3xl
            font-semibold
          ">
            Create your account
          </h1>

          <p className="
            mt-2
            text-sm
            text-gray-500
          ">
            Find and inquire about digital services.
          </p>

        </div>


        <form
          onSubmit={handleSignup}
          className="space-y-5"
        >


          <div>

            <label className="
              mb-2
              block
              text-sm
              font-medium
            ">
              Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
              className="
                w-full
                rounded-xl
                border
                border-gray-300
                px-4
                py-3
                outline-none
                focus:border-gray-700
              "
              placeholder="Your name"
            />

          </div>


          <div>

            <label className="
              mb-2
              block
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
                w-full
                rounded-xl
                border
                border-gray-300
                px-4
                py-3
                outline-none
                focus:border-gray-700
              "
              placeholder="you@example.com"
            />

          </div>


          <div>

            <label className="
              mb-2
              block
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
              minLength={8}
              className="
                w-full
                rounded-xl
                border
                border-gray-300
                px-4
                py-3
                outline-none
                focus:border-gray-700
              "
              placeholder="At least 8 characters"
            />

          </div>


          {error && (

            <div className="
              rounded-xl
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-600
            ">
              {error}
            </div>

          )}


          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              rounded-xl
              bg-gray-900
              px-4
              py-3
              text-sm
              font-medium
              text-white
              transition
              hover:bg-gray-800
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >

            {loading
              ? "Creating account..."
              : "Sign up"}

          </button>

        </form>


        <p className="
          mt-6
          text-center
          text-sm
          text-gray-500
        ">

          Already have an account?{" "}

          <Link
            href="/login"
            className="
              font-medium
              text-gray-900
              hover:underline
            "
          >
            Log in
          </Link>

        </p>

      </div>

    </main>

  );
}