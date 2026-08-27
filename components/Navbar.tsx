"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://brd-7oq0.onrender.com";

export default function Navbar() {

  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);


  async function checkUser() {

    try {

      const response = await fetch(
        `${API_URL}/api/auth/me`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );


      const data =
        await response.json();


      if (
        response.ok &&
        data.user
      ) {

        setUser(data.user);

      } else {

        setUser(null);

      }

    } catch (error) {

      console.error(
        "Authentication check failed:",
        error
      );

      setUser(null);

    } finally {

      setLoading(false);

    }
  }


  useEffect(() => {

    checkUser();

    function handleFocus() {
      checkUser();
    }

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {

      window.removeEventListener(
        "focus",
        handleFocus
      );

    };

  }, []);


  async function handleSignOut() {

    try {

      await fetch(
        `${API_URL}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      setUser(null);

      window.location.href = "/";

    } catch (error) {

      console.error(
        "Sign out error:",
        error
      );

    }
  }


  return (

    <header className="
      sticky
      top-0
      z-50
      w-full
      border-b
      border-gray-200
      bg-white/80
      backdrop-blur
    ">

      <div className="
        mx-auto
        flex
        h-16
        max-w-7xl
        items-center
        justify-between
        px-6
      ">

        {/* LOGO */}

        <Link
          href="/"
          className="
            text-2xl
            font-semibold
            tracking-tight
            text-gray-900
          "
        >
          brd
        </Link>


        {/* RIGHT SIDE */}

        <div className="
          flex
          items-center
          gap-3
        ">

          {loading ? (

            <div className="
              h-9
              w-24
              animate-pulse
              rounded-full
              bg-gray-100
            " />

          ) : user ? (

            <>

              <span className="
                hidden
                text-sm
                text-gray-600
                sm:block
              ">
                Hi, {user.name}
              </span>


              <button
                onClick={handleSignOut}
                className="
                  rounded-full
                  px-5
                  py-2
                  text-sm
                  font-medium
                  text-gray-700
                  transition
                  hover:bg-gray-100
                "
              >
                Sign out
              </button>

            </>

          ) : (

            <>

              <Link
                href="/login"
                className="
                  rounded-full
                  px-5
                  py-2
                  text-sm
                  font-medium
                  text-gray-700
                  transition
                  hover:bg-gray-100
                "
              >
                Log in
              </Link>


              <Link
                href="/signup"
                className="
                  rounded-full
                  bg-gray-900
                  px-5
                  py-2
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:bg-gray-800
                "
              >
                Sign up
              </Link>

            </>

          )}

        </div>

      </div>

    </header>
  );
}