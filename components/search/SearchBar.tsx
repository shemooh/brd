"use client";

import { useEffect, useRef, useState } from "react";

interface Service {
  id: number;
  name: string;
  provider: string;
  category: string;
}

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:5000";

export default function SearchBar({
  onSearch,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [showSuggestions, setShowSuggestions] =
    useState(false);

  const containerRef =
    useRef<HTMLDivElement>(null);

  /*
   * LOAD SERVICES FROM MYSQL
   */

  useEffect(() => {
    async function loadServices() {
      try {
        const response = await fetch(
          `${API_URL}/api/services`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setServices(data);
      } catch (error) {
        console.error(
          "Suggestion error:",
          error
        );
      }
    }

    loadServices();
  }, []);

  /*
   * CLOSE SUGGESTIONS
   * WHEN CLICKING OUTSIDE
   */

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /*
   * FILTER RECOMMENDATIONS
   */

  const recommendations =
    query.trim().length === 0
      ? []
      : services
          .filter((service) => {
            const search =
              query.toLowerCase();

            return (
              service.name
                .toLowerCase()
                .includes(search) ||
              service.category
                .toLowerCase()
                .includes(search) ||
              service.provider
                .toLowerCase()
                .includes(search)
            );
          })
          .slice(0, 6);

  /*
   * SEARCH
   */

  function submit(searchQuery?: string) {
    const value =
      searchQuery ?? query;

    if (!value.trim()) {
      return;
    }

    setQuery(value);
    setShowSuggestions(false);

    onSearch?.(value);
  }

  /*
   * INPUT CHANGE
   */

  function handleChange(
    value: string
  ) {
    setQuery(value);

    setShowSuggestions(
      value.trim().length > 0
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-3xl"
    >
      {/* SEARCH BOX */}

      <div
        className="
          flex
          h-14
          items-center
          rounded-full
          border
          border-gray-300
          bg-white
          px-5
          shadow-sm
          focus-within:border-gray-500
        "
      >
        <span className="text-xl text-gray-400">
          ⌕
        </span>

        <input
          className="
            flex-1
            bg-transparent
            px-4
            text-base
            outline-none
          "
          placeholder="Search anything..."
          value={query}
          onChange={(event) =>
            handleChange(
              event.target.value
            )
          }
          onFocus={() => {
            if (query.trim()) {
              setShowSuggestions(true);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              submit();
            }

            if (event.key === "Escape") {
              setShowSuggestions(false);
            }
          }}
        />
      </div>

      {/* RECOMMENDATIONS */}

      {showSuggestions &&
        recommendations.length > 0 && (
          <div
            className="
              absolute
              left-0
              right-0
              top-16
              z-50
              overflow-hidden
              rounded-2xl
              border
              border-gray-200
              bg-white
              shadow-lg
            "
          >
            {recommendations.map(
              (service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() =>
                    submit(service.name)
                  }
                  className="
                    flex
                    w-full
                    items-center
                    gap-4
                    px-5
                    py-4
                    text-left
                    transition
                    hover:bg-gray-50
                  "
                >
                  {/* SEARCH ICON */}

                  <span
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-gray-100
                      text-gray-500
                    "
                  >
                    ⌕
                  </span>

                  {/* SERVICE INFO */}

                  <div className="min-w-0">
                    <p
                      className="
                        truncate
                        text-sm
                        font-medium
                        text-gray-900
                      "
                    >
                      {service.name}
                    </p>

                    <p
                      className="
                        mt-0.5
                        truncate
                        text-xs
                        text-gray-500
                      "
                    >
                      {service.category}
                      {" · "}
                      {service.provider}
                    </p>
                  </div>
                </button>
              )
            )}
          </div>
        )}

      {/* BUTTONS */}

      <div
        className="
          mt-6
          flex
          justify-center
          gap-3
        "
      >
        <button
          type="button"
          onClick={() => submit()}
          className="
            rounded-md
            bg-gray-100
            px-5
            py-2
            text-sm
            text-gray-700
            hover:bg-gray-200
          "
        >
          Search
        </button>

        <button
          type="button"
          onClick={() => {
            if (services.length > 0) {
              const random =
                services[
                  Math.floor(
                    Math.random() *
                      services.length
                  )
                ];

              submit(random.name);
            }
          }}
          className="
            rounded-md
            bg-gray-100
            px-5
            py-2
            text-sm
            text-gray-700
            hover:bg-gray-200
          "
        >
          I'm Feeling Something
        </button>
      </div>
    </div>
  );
}