
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

const API_URL = "https://brd-7oq0.onrender.com";

export default function Decks() {
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // BUILD IMAGE URL
  // =====================================================

  function getImageUrl(
    imageUrl?: string | null
  ) {
    if (!imageUrl) {
      return null;
    }

    // Full URL
    if (
      imageUrl.startsWith("http://") ||
      imageUrl.startsWith("https://")
    ) {
      return imageUrl;
    }

    // Flask upload path
    if (imageUrl.startsWith("/")) {
      return `${API_URL}${imageUrl}`;
    }

    // Relative path
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

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load services"
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

      if (!category) {
        return;
      }

      const normalized =
        category.toLowerCase();

      if (
        !uniqueCategories.has(
          normalized
        )
      ) {
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

  function openService(
    serviceId: number
  ) {
    router.push(
      `/service/${serviceId}`
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <section className="mt-16 w-full max-w-7xl">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6">

        <h2 className="text-2xl font-medium text-gray-900">
          Explore digital services
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Find services from independent providers.
        </p>

      </div>

      {/* =================================================
          CATEGORIES
      ================================================= */}

      {!loading &&
        !error &&
        categories.length > 1 && (

          <div className="relative mb-8 w-full">

            <div
              className="
                flex
                w-full
                gap-2
                overflow-x-auto
                pb-2
              "
              style={{
                scrollbarWidth: "none",
                msOverflowStyle:
                  "none",
              }}
            >

              {categories.map(
                (category) => {

                  const active =
                    selectedCategory ===
                    category;

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
                        whitespace-nowrap
                        rounded-full
                        px-5
                        py-2.5
                        text-sm
                        font-medium
                        transition
                        ${
                          active
                            ? "bg-gray-900 text-white"
                            : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                        }
                      `}
                    >
                      {category}
                    </button>
                  );
                }
              )}

            </div>

          </div>
        )}

      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (

        <div
          className="
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-10
            text-center
          "
        >

          <p className="text-sm text-gray-500">
            Loading services...
          </p>

        </div>

      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {!loading && error && (

        <div
          className="
            rounded-2xl
            border
            border-red-200
            bg-white
            p-10
            text-center
          "
        >

          <p className="text-sm text-red-600">
            {error}
          </p>

        </div>

      )}

      {/* =================================================
          NO SERVICES
      ================================================= */}

      {!loading &&
        !error &&
        filteredServices.length === 0 && (

          <div
            className="
              rounded-2xl
              border
              border-gray-200
              bg-white
              p-10
              text-center
            "
          >

            <p className="text-gray-500">
              No services available in this category.
            </p>

          </div>

        )}

      {/* =================================================
          SERVICE CARDS
      ================================================= */}

      {!loading &&
        !error &&
        filteredServices.length > 0 && (

          <div
            className="
              grid
              w-full
              grid-cols-1
              gap-6
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
            "
          >

            {filteredServices.map(
              (service) => {

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
                      rounded-2xl
                      border
                      border-gray-200
                      bg-white
                      shadow-sm
                      transition
                      duration-200
                      hover:-translate-y-1
                      hover:shadow-lg
                    "
                  >

                    {/* =================================
                        IMAGE
                    ================================= */}

                    <button
                      type="button"
                      onClick={() =>
                        openService(
                          service.id
                        )
                      }
                      className="
                        block
                        h-52
                        w-full
                        overflow-hidden
                        bg-gray-100
                        text-left
                      "
                    >

                      {imageUrl ? (

                        <img
                          src={imageUrl}
                          alt={
                            service.name
                          }
                          className="
                            h-full
                            w-full
                            object-cover
                            transition
                            duration-300
                            group-hover:scale-105
                          "
                          onError={(
                            event
                          ) => {

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
                                "flex h-full w-full items-center justify-center text-sm text-gray-400";

                              fallback.textContent =
                                "Image unavailable";

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
                            h-full
                            w-full
                            items-center
                            justify-center
                            bg-gray-100
                            text-sm
                            text-gray-400
                          "
                        >
                          No image available
                        </div>

                      )}

                    </button>

                    {/* =================================
                        CONTENT
                    ================================= */}

                    <div className="flex min-h-[300px] flex-col p-5">

                      {/* HEADER */}

                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-3
                        "
                      >

                        <div className="min-w-0">

                          <h3
                            className="
                              truncate
                              text-lg
                              font-semibold
                              text-gray-900
                            "
                          >
                            {service.name}
                          </h3>

                          <p
                            className="
                              mt-1
                              truncate
                              text-sm
                              text-gray-500
                            "
                          >
                            {service.provider}
                          </p>

                        </div>

                        <span
                          className="
                            max-w-[110px]
                            shrink-0
                            truncate
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

                      </div>

                      {/* DESCRIPTION */}

                      <p
                        className="
                          mt-5
                          line-clamp-4
                          text-sm
                          leading-6
                          text-gray-600
                        "
                      >
                        {service.description}
                      </p>

                      {/* FOOTER */}

                      <div
                        className="
                          mt-auto
                          flex
                          items-end
                          justify-between
                          gap-4
                          border-t
                          border-gray-100
                          pt-5
                        "
                      >

                        <div>

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
                              text-lg
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

                        <button
                          type="button"
                          onClick={() =>
                            openService(
                              service.id
                            )
                          }
                          className="
                            shrink-0
                            rounded-full
                            bg-gray-900
                            px-4
                            py-2.5
                            text-sm
                            font-medium
                            text-white
                            transition
                            hover:bg-gray-800
                          "
                        >
                          View service
                        </button>

                      </div>

                    </div>

                  </article>

                );
              }
            )}

          </div>

        )}

    </section>
  );
}