"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Service {
  id: number;
  name: string;
  provider: string;
  category: string;
  description: string;
  price: number;
  image_url?: string | null;
}

interface User {
  id: number;
  name: string;
  email: string;
}

const API_URL = "http://localhost:5000";

export default function ServicePage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [service, setService] = useState<Service | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);
  const [checkingUser, setCheckingUser] = useState(true);

  const [showInquiry, setShowInquiry] = useState(false);
  const [message, setMessage] = useState("");

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // =====================================================
  // IMAGE URL
  // =====================================================

  function getImageUrl(imageUrl?: string | null) {
    if (!imageUrl) {
      return null;
    }

    if (
      imageUrl.startsWith("http://") ||
      imageUrl.startsWith("https://")
    ) {
      return imageUrl;
    }

    if (imageUrl.startsWith("/")) {
      return `${API_URL}${imageUrl}`;
    }

    return `${API_URL}/${imageUrl}`;
  }

  // =====================================================
  // LOAD SERVICE
  // =====================================================

  useEffect(() => {
    async function loadService() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/services/${id}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Service not found"
          );
        }

        setService(data);
      } catch (error) {
        console.error("Service error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Could not load service"
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadService();
    }
  }, [id]);

  // =====================================================
  // CHECK CURRENT USER
  // =====================================================

  useEffect(() => {
    async function checkUser() {
      try {
        setCheckingUser(true);

        const response = await fetch(
          `${API_URL}/api/auth/me`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const data = await response.json();

        console.log(
          "Current user response:",
          data
        );

        if (response.ok && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error(
          "User check error:",
          error
        );

        setUser(null);
      } finally {
        setCheckingUser(false);
      }
    }

    checkUser();
  }, []);

  // =====================================================
  // INQUIRE
  // =====================================================

  function handleInquire() {
    setError("");
    setSuccess(false);

    if (user) {
      setShowInquiry(true);
      return;
    }

    router.push(
      `/login?redirect=/service/${id}`
    );
  }

  // =====================================================
  // SEND INQUIRY
  // =====================================================

  async function handleSendInquiry() {
    if (!service) {
      return;
    }

    const trimmedMessage =
      message.trim();

    if (!trimmedMessage) {
      setError(
        "Please write a message."
      );
      return;
    }

    setSending(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/inquiries`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            service_id: service.id,
            message: trimmedMessage,
          }),
        }
      );

      const data =
        await response.json();

      if (response.status === 401) {
        router.push(
          `/login?redirect=/service/${id}`
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Could not send inquiry"
        );
      }

      setMessage("");
      setShowInquiry(false);
      setSuccess(true);
    } catch (error) {
      console.error(
        "Inquiry error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Could not send inquiry"
      );
    } finally {
      setSending(false);
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-gray-500">
          Loading service...
        </p>
      </main>
    );
  }

  // =====================================================
  // SERVICE NOT FOUND
  // =====================================================

  if (!service) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="text-center">

          <h1 className="text-2xl font-semibold text-gray-900">
            Service not found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {error ||
              "This service does not exist."}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/")
            }
            className="
              mt-6
              rounded-full
              bg-gray-900
              px-5
              py-2.5
              text-sm
              font-medium
              text-white
              hover:bg-gray-800
            "
          >
            Back to services
          </button>

        </div>
      </main>
    );
  }

  const imageUrl =
    getImageUrl(
      service.image_url
    );

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-white">

      {/* =================================================
          NAVIGATION
      ================================================= */}

      <header className="border-b border-gray-100 bg-white">

        <div
          className="
            mx-auto
            flex
            max-w-6xl
            items-center
            justify-between
            px-6
            py-4
          "
        >

          <button
            type="button"
            onClick={() =>
              router.push("/")
            }
            className="
              text-xl
              font-semibold
              tracking-tight
              text-gray-900
            "
          >
            brd
          </button>

          <button
            type="button"
            onClick={() =>
              router.back()
            }
            className="
              rounded-full
              border
              border-gray-200
              px-4
              py-2
              text-sm
              text-gray-600
              transition
              hover:bg-gray-50
              hover:text-gray-900
            "
          >
            ← Back
          </button>

        </div>

      </header>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div
        className="
          mx-auto
          max-w-6xl
          px-6
          py-8
        "
      >

        {/* BREADCRUMB */}

        <div className="mb-6">

          <button
            type="button"
            onClick={() =>
              router.push("/")
            }
            className="
              text-sm
              text-gray-500
              hover:text-gray-900
            "
          >
            Home
          </button>

          <span className="mx-2 text-gray-300">
            /
          </span>

          <span className="text-sm text-gray-500">
            {service.category}
          </span>

        </div>

        {/* =================================================
            SERVICE LAYOUT
        ================================================= */}

        <div
          className="
            grid
            gap-10
            lg:grid-cols-[1.5fr_1fr]
          "
        >

          {/* =================================================
              LEFT
          ================================================= */}

          <div>

            {/* IMAGE */}

            <div
              className="
                overflow-hidden
                rounded-2xl
                bg-gray-100
              "
            >

              {imageUrl ? (

                <img
                  src={imageUrl}
                  alt={service.name}
                  className="
                    h-[420px]
                    w-full
                    object-cover
                  "
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";

                    const parent =
                      event.currentTarget
                        .parentElement;

                    if (
                      parent &&
                      !parent.querySelector(
                        "[data-image-fallback]"
                      )
                    ) {
                      const fallback =
                        document.createElement(
                          "div"
                        );

                      fallback.setAttribute(
                        "data-image-fallback",
                        "true"
                      );

                      fallback.className =
                        "flex h-[420px] w-full items-center justify-center text-sm text-gray-400";

                      fallback.textContent =
                        "No image available";

                      parent.appendChild(
                        fallback
                      );
                    }
                  }}
                />

              ) : (

                <div
                  className="
                    flex
                    h-[420px]
                    items-center
                    justify-center
                    text-sm
                    text-gray-400
                  "
                >
                  No image available
                </div>

              )}

            </div>

            {/* DESCRIPTION */}

            <div className="mt-8">

              <h2
                className="
                  text-xl
                  font-semibold
                  text-gray-900
                "
              >
                About this service
              </h2>

              <p
                className="
                  mt-4
                  whitespace-pre-line
                  text-base
                  leading-7
                  text-gray-600
                "
              >
                {service.description}
              </p>

            </div>

          </div>

          {/* =================================================
              RIGHT
          ================================================= */}

          <div>

            <div
              className="
                sticky
                top-6
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-7
                shadow-sm
              "
            >

              {/* CATEGORY */}

              <span
                className="
                  inline-flex
                  rounded-full
                  bg-gray-100
                  px-3
                  py-1
                  text-xs
                  font-medium
                  text-gray-600
                "
              >
                {service.category}
              </span>

              {/* NAME */}

              <h1
                className="
                  mt-5
                  text-3xl
                  font-semibold
                  leading-tight
                  tracking-tight
                  text-gray-900
                "
              >
                {service.name}
              </h1>

              {/* PROVIDER */}

              <p
                className="
                  mt-3
                  text-sm
                  text-gray-500
                "
              >
                Provided by{" "}

                <span
                  className="
                    font-medium
                    text-gray-900
                  "
                >
                  {service.provider}
                </span>
              </p>

              {/* PRICE */}

              <div
                className="
                  mt-8
                  border-t
                  border-gray-100
                  pt-6
                "
              >

                <p
                  className="
                    text-xs
                    text-gray-400
                  "
                >
                  Starting from
                </p>

                <p
                  className="
                    mt-1
                    text-3xl
                    font-semibold
                    text-gray-900
                  "
                >
                  ₱
                  {Number(
                    service.price
                  ).toLocaleString()}
                </p>

              </div>

              {/* ERROR */}

              {error && (
                <div
                  className="
                    mt-5
                    rounded-xl
                    border
                    border-red-200
                    bg-red-50
                    p-4
                  "
                >
                  <p className="text-sm text-red-600">
                    {error}
                  </p>
                </div>
              )}

              {/* SUCCESS */}

              {success && (
                <div
                  className="
                    mt-5
                    rounded-xl
                    border
                    border-green-200
                    bg-green-50
                    p-4
                  "
                >

                  <p
                    className="
                      font-medium
                      text-green-800
                    "
                  >
                    Inquiry sent
                  </p>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-green-700
                    "
                  >
                    Your inquiry has been
                    sent to{" "}
                    {service.provider}.
                  </p>

                </div>
              )}

              {/* =================================================
                  INQUIRE BUTTON
              ================================================= */}

              {!showInquiry &&
                !success && (

                  <button
                    type="button"
                    onClick={handleInquire}
                    disabled={checkingUser}
                    className="
                      mt-8
                      w-full
                      rounded-xl
                      bg-gray-900
                      px-5
                      py-3.5
                      text-sm
                      font-medium
                      text-white
                      transition
                      hover:bg-gray-800
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {checkingUser
                      ? "Checking..."
                      : "Inquire"}
                  </button>

                )}

              {/* =================================================
                  INQUIRY FORM
              ================================================= */}

              {showInquiry &&
                !success && (

                  <div
                    className="
                      mt-8
                      border-t
                      border-gray-100
                      pt-7
                    "
                  >

                    <h2
                      className="
                        text-lg
                        font-semibold
                        text-gray-900
                      "
                    >
                      Send an inquiry
                    </h2>

                    {user && (
                      <p
                        className="
                          mt-2
                          text-sm
                          text-gray-500
                        "
                      >
                        Sending as{" "}

                        <span
                          className="
                            font-medium
                            text-gray-900
                          "
                        >
                          {user.name}
                        </span>
                      </p>
                    )}

                    <textarea
                      value={message}
                      onChange={(event) =>
                        setMessage(
                          event.target.value
                        )
                      }
                      placeholder="Tell the provider what you need..."
                      className="
                        mt-5
                        min-h-36
                        w-full
                        resize-none
                        rounded-xl
                        border
                        border-gray-200
                        p-4
                        text-sm
                        text-gray-900
                        outline-none
                        transition
                        placeholder:text-gray-400
                        focus:border-gray-900
                      "
                    />

                    {error && (
                      <p
                        className="
                          mt-3
                          text-sm
                          text-red-600
                        "
                      >
                        {error}
                      </p>
                    )}

                    <div
                      className="
                        mt-4
                        flex
                        gap-3
                      "
                    >

                      <button
                        type="button"
                        onClick={() => {
                          setShowInquiry(
                            false
                          );
                          setError("");
                        }}
                        disabled={sending}
                        className="
                          flex-1
                          rounded-xl
                          border
                          border-gray-200
                          px-4
                          py-3
                          text-sm
                          font-medium
                          text-gray-700
                          hover:bg-gray-50
                          disabled:opacity-50
                        "
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={
                          handleSendInquiry
                        }
                        disabled={sending}
                        className="
                          flex-1
                          rounded-xl
                          bg-gray-900
                          px-4
                          py-3
                          text-sm
                          font-medium
                          text-white
                          hover:bg-gray-800
                          disabled:opacity-50
                        "
                      >
                        {sending
                          ? "Sending..."
                          : "Send Inquiry"}
                      </button>

                    </div>

                  </div>

                )}

              {/* =================================================
                  SUCCESS ACTION
              ================================================= */}

              {success && (

                <button
                  type="button"
                  onClick={() =>
                    router.push("/")
                  }
                  className="
                    mt-6
                    w-full
                    rounded-xl
                    bg-gray-900
                    px-5
                    py-3
                    text-sm
                    font-medium
                    text-white
                    hover:bg-gray-800
                  "
                >
                  Back to services
                </button>

              )}

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}