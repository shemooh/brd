"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface Service {
  id: number;
  name: string;
  provider: string;
  category: string;
  description: string;
  price: number;
  image_url?: string | null;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://brd-7oq0.onrender.com";

export default function Decks() {
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // IMAGE URL
  // =====================================================

  function getImageUrl(imageUrl?: string | null) {
    if (!imageUrl) return null;

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
  // LOAD SERVICES
  // =====================================================

  useEffect(() => {
    async function loadServices() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/services`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          let message = "Failed to load services";

          try {
            const data = await response.json();
            message = data.error || message;
          } catch {
            // Ignore invalid JSON
          }

          throw new Error(
            `${message} (${response.status})`
          );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error(
            "Invalid services response"
          );
        }

        setServices(data);
      } catch (error) {
        console.error(
          "Services error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load services"
        );
      } finally {
        setLoading(false);
      }
    }

    loadServices();
  }, []);

  // =====================================================
  // CATEGORIES
  // =====================================================

  const categories = useMemo(() => {
    const uniqueCategories =
      new Map<string, string>();

    services.forEach((service) => {
      const category =
        service.category?.trim();

      if (!category) return;

      const normalized =
        category.toLowerCase();

      if (!uniqueCategories.has(normalized)) {
        uniqueCategories.set(
          normalized,
          category
        );
      }
    });

    return [
      "All",
      ...Array.from(
        uniqueCategories.values()
      ),
    ];
  }, [services]);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredServices =
    selectedCategory === "All"
      ? services
      : services.filter(
          (service) =>
            service.category
              ?.trim()
              .toLowerCase() ===
            selectedCategory
              .trim()
              .toLowerCase()
        );

  // =====================================================
  // OPEN SERVICE
  // =====================================================

  function openService(serviceId: number) {
    router.push(`/service/${serviceId}`);
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <section className="mt-24 w-full max-w-7xl">

      {/* =================================================
          SECTION HEADER
      ================================================= */}

      <div className="mb-10">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              Marketplace
            </p>

            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              Explore digital services
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
              Discover trusted digital services from
              independent providers.
            </p>
          </div>

          {!loading && !error && (
            <p className="text-sm text-gray-400">
              {filteredServices.length}{" "}
              {filteredServices.length === 1
                ? "service"
                : "services"}
            </p>
          )}

        </div>

      </div>

      {/* =================================================
          CATEGORY NAVIGATION
      ================================================= */}

      {!loading &&
        !error &&
        categories.length > 1 && (

          <div className="mb-10">

            <div
              className="
                flex
                gap-2
                overflow-x-auto
                pb-2
                [-ms-overflow-style:none]
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
              "
            >

              {categories.map((category) => {

                const active =
                  selectedCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() =>
                      setSelectedCategory(
                        category
                      )
                    }
                    className={`
                      shrink-0
                      rounded-full
                      px-5
                      py-2.5
                      text-sm
                      font-medium
                      transition-all
                      duration-200
                      ${
                        active
                          ? "bg-gray-900 text-white shadow-sm"
                          : "border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                  >
                    {category}
                  </button>
                );
              })}

            </div>

          </div>
        )}

      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {Array.from({ length: 8 }).map(
            (_, index) => (

              <div
                key={index}
                className="
                  overflow-hidden
                  rounded-3xl
                  border
                  border-gray-200
                  bg-white
                "
              >

                <div className="h-56 animate-pulse bg-gray-100" />

                <div className="space-y-4 p-5">

                  <div className="h-5 w-3/4 animate-pulse rounded bg-gray-100" />

                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />

                  <div className="h-16 animate-pulse rounded bg-gray-100" />

                  <div className="h-px bg-gray-100" />

                  <div className="flex justify-between">

                    <div className="h-7 w-20 animate-pulse rounded bg-gray-100" />

                    <div className="h-10 w-28 animate-pulse rounded-full bg-gray-100" />

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {!loading && error && (

        <div className="
          rounded-3xl
          border
          border-red-100
          bg-red-50/50
          p-12
          text-center
        ">

          <div className="
            mx-auto
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-full
            bg-white
            text-red-500
            shadow-sm
          ">
            !
          </div>

          <h3 className="mt-4 text-base font-semibold text-gray-900">
            Unable to load services
          </h3>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <p className="mt-3 text-xs text-gray-400">
            {API_URL}/api/services
          </p>

        </div>

      )}

      {/* =================================================
          EMPTY
      ================================================= */}

      {!loading &&
        !error &&
        filteredServices.length === 0 && (

          <div className="
            rounded-3xl
            border
            border-gray-200
            bg-gray-50
            px-6
            py-16
            text-center
          ">

            <div className="
              mx-auto
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-full
              bg-white
              text-gray-400
              shadow-sm
            ">
              ⌕
            </div>

            <h3 className="mt-5 text-lg font-semibold text-gray-900">
              No services found
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              There are no services in this category
              yet.
            </p>

            <button
              type="button"
              onClick={() =>
                setSelectedCategory("All")
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
                transition
                hover:bg-gray-800
              "
            >
              View all services
            </button>

          </div>

        )}

      {/* =================================================
          SERVICE GRID
      ================================================= */}

      {!loading &&
        !error &&
        filteredServices.length > 0 && (

          <div className="
            grid
            w-full
            grid-cols-1
            gap-x-5
            gap-y-8
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
          ">

            {filteredServices.map((service) => {

              const imageUrl =
                getImageUrl(
                  service.image_url
                );

              return (

                <article
                  key={service.id}
                  className="
                    group
                    overflow-hidden
                    rounded-3xl
                    border
                    border-gray-200
                    bg-white
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-gray-300
                    hover:shadow-xl
                  "
                >

                  {/* =================================================
                      IMAGE
                  ================================================= */}

                  <button
                    type="button"
                    onClick={() =>
                      openService(
                        service.id
                      )
                    }
                    className="
                      relative
                      block
                      h-56
                      w-full
                      overflow-hidden
                      bg-gray-100
                      text-left
                    "
                  >

                    {imageUrl ? (

                      <img
                        src={imageUrl}
                        alt={service.name}
                        className="
                          h-full
                          w-full
                          object-cover
                          transition-transform
                          duration-500
                          ease-out
                          group-hover:scale-105
                        "
                        onError={(event) => {

                          const image =
                            event.currentTarget;

                          image.style.display =
                            "none";

                          const parent =
                            image.parentElement;

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
                              "flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-400";

                            fallback.textContent =
                              "Image unavailable";

                            parent.appendChild(
                              fallback
                            );
                          }

                        }}
                      />

                    ) : (

                      <div className="
                        flex
                        h-full
                        w-full
                        items-center
                        justify-center
                        bg-gray-100
                        text-sm
                        text-gray-400
                      ">
                        No image available
                      </div>

                    )}

                    {/* CATEGORY OVERLAY */}

                    <div className="
                      absolute
                      left-4
                      top-4
                    ">

                      <span className="
                        rounded-full
                        bg-white/90
                        px-3
                        py-1.5
                        text-xs
                        font-medium
                        text-gray-700
                        shadow-sm
                        backdrop-blur
                      ">
                        {service.category}
                      </span>

                    </div>

                  </button>

                  {/* =================================================
                      CONTENT
                  ================================================= */}

                  <div className="
                    flex
                    min-h-[285px]
                    flex-col
                    p-5
                  ">

                    {/* TITLE */}

                    <div>

                      <h3 className="
                        line-clamp-2
                        text-lg
                        font-semibold
                        leading-6
                        tracking-tight
                        text-gray-900
                      ">
                        {service.name}
                      </h3>

                      <p className="
                        mt-2
                        truncate
                        text-sm
                        text-gray-500
                      ">
                        by {service.provider}
                      </p>

                    </div>

                    {/* DESCRIPTION */}

                    <p className="
                      mt-5
                      line-clamp-3
                      text-sm
                      leading-6
                      text-gray-600
                    ">
                      {service.description}
                    </p>

                    {/* FOOTER */}

                    <div className="
                      mt-auto
                      border-t
                      border-gray-100
                      pt-5
                    ">

                      <div className="
                        flex
                        items-end
                        justify-between
                        gap-4
                      ">

                        <div>

                          <p className="
                            text-xs
                            text-gray-400
                          ">
                            Starting from
                          </p>

                          <p className="
                            mt-1
                            text-xl
                            font-semibold
                            tracking-tight
                            text-gray-900
                          ">
                            ₱
                            {Number(
                              service.price
                            ).toLocaleString()}
                          </p>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            openService(
                              service.id
                            )
                          }
                          className="
                            rounded-full
                            bg-gray-900
                            px-4
                            py-2.5
                            text-sm
                            font-medium
                            text-white
                            transition-all
                            duration-200
                            hover:bg-gray-700
                            active:scale-95
                          "
                        >
                          View service
                        </button>

                      </div>

                    </div>

                  </div>

                </article>

              );
            })}

          </div>

        )}

    </section>
  );
}