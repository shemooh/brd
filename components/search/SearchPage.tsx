
"use client";

import { useState } from "react";

import SearchBar from "@/components/search/SearchBar";
import Decks from "@/components/decks/Decks";

interface Service {
  id: number;
  name: string;
  provider: string;
  category: string;
  description: string;
  price: number;
  image_url?: string;
}

export default function SearchPage() {
  const [query, setQuery] =
    useState("");

  const [results, setResults] =
    useState<Service[]>([]);

  const [loading, setLoading] =
    useState(false);

  async function handleSearch(
    searchQuery: string
  ) {
    setQuery(searchQuery);

    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          `https://brd-7oq0.onrender.com/api/search?q=${encodeURIComponent(
            searchQuery
          )}`
        );

      if (!response.ok) {
        throw new Error(
          "Search request failed"
        );
      }

      const data =
        await response.json();

      setResults(data);

    } catch (error) {
      console.error(
        "Search error:",
        error
      );

      setResults([]);

    } finally {
      setLoading(false);
    }
  }

  function inquire(
    serviceId: number
  ) {
    window.location.href =
      `/service/${serviceId}`;
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-6 pt-24">

      {/* TITLE */}

      <h1 className="mb-10 text-center text-7xl font-light tracking-tight">
        Search Solutions 
      </h1>

      {/* SEARCH */}

      <SearchBar
        onSearch={handleSearch}
      />

      <p className="mt-10 text-sm text-gray-500">
        Search digital services, providers,
        and categories.
      </p>

      {/* LOADING */}

      {loading && (
        <p className="mt-8 text-sm text-gray-500">
          Searching...
        </p>
      )}

      {/* SEARCH RESULTS */}

      {!loading &&
        query && (
          <section className="mt-10 w-full max-w-5xl">

            <div className="mb-6">

              <h2 className="text-2xl font-medium">
                Results for "{query}"
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {results.length} service
                {results.length === 1
                  ? ""
                  : "s"} found
              </p>

            </div>

            {results.length === 0 ? (

              <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">

                <p className="text-gray-500">
                  No services found.
                </p>

              </div>

            ) : (

              <div className="grid gap-5 md:grid-cols-2">

                {results.map(
                  (service) => (

                    <article
                      key={service.id}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >

                      {/* IMAGE */}

                      {service.image_url && (
                        <img
                          src={
                            service.image_url.startsWith(
                              "http"
                            )
                              ? service.image_url
                              : `https://brd-7oq0.onrender.com${service.image_url}`
                          }
                          alt={
                            service.name
                          }
                          className="h-48 w-full object-cover"
                        />
                      )}

                      <div className="p-6">

                        <div className="flex items-start justify-between gap-4">

                          <div className="min-w-0">

                            <h3 className="truncate text-xl font-semibold">
                              {service.name}
                            </h3>

                            <p className="mt-1 truncate text-sm text-gray-500">
                              {service.provider}
                            </p>

                          </div>

                          <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs">
                            {service.category}
                          </span>

                        </div>

                        <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">
                          {service.description}
                        </p>

                        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5">

                          <p className="text-lg font-semibold">
                            ₱
                            {Number(
                              service.price
                            ).toLocaleString()}
                          </p>

                          <button
                            onClick={() =>
                              inquire(
                                service.id
                              )
                            }
                            className="rounded-full bg-gray-900 px-5 py-2.5 text-sm text-white hover:bg-gray-800"
                          >
                            View Service
                          </button>

                        </div>

                      </div>

                    </article>

                  )
                )}

              </div>

            )}

          </section>
        )}

      {/* FRONT PAGE SERVICES */}

      {!query && <Decks />}

    </main>
  );
}
