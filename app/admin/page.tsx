
"use client";

import { useEffect, useRef, useState } from "react";

interface Service {
  id: number;
  name: string;
  provider: string;
  category: string;
  description: string;
  price: number;
  image_url?: string | null;
}

const API_URL = "http://127.0.0.1:5000";
const ADMIN_KEY = "my-admin-key";

export default function AdminPage() {
  const [services, setServices] = useState<Service[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [name, setName] = useState("");
  const [provider, setProvider] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] =
    useState("");
  const [price, setPrice] = useState("");

  const [image, setImage] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  // =====================================================
  // IMAGE URL
  // =====================================================

  function getImageUrl(
    imageUrl?: string | null
  ) {
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
  // LOAD
  // =====================================================

  async function loadServices() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/services`,
        {
          method: "GET",
          headers: {
            "X-Admin-Key": ADMIN_KEY,
          },
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Could not load services"
        );
      }

      setServices(data);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Could not load services"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
  }, []);

  // =====================================================
  // RESET FORM
  // =====================================================

  function resetForm() {
    setEditingId(null);
    setName("");
    setProvider("");
    setCategory("");
    setDescription("");
    setPrice("");
    setImage(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // =====================================================
  // SELECT IMAGE
  // =====================================================

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setImage(file);

    const preview =
      URL.createObjectURL(file);

    setImagePreview(preview);
  }

  // =====================================================
  // EDIT
  // =====================================================

  function startEdit(
    service: Service
  ) {
    setEditingId(service.id);

    setName(service.name);
    setProvider(service.provider);
    setCategory(service.category);
    setDescription(
      service.description || ""
    );

    setPrice(
      String(service.price)
    );

    setImage(null);

    setImagePreview(
      getImageUrl(service.image_url)
    );

    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // =====================================================
  // SUBMIT
  // =====================================================

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setError("");
    setMessage("");
    setSaving(true);

    try {
      const formData =
        new FormData();

      formData.append(
        "name",
        name
      );

      formData.append(
        "provider",
        provider
      );

      formData.append(
        "category",
        category
      );

      formData.append(
        "description",
        description
      );

      formData.append(
        "price",
        price
      );

      // Only add an image if
      // the user selected one.
      if (image) {
        formData.append(
          "image",
          image
        );
      }

      const url =
        editingId !== null
          ? `${API_URL}/api/admin/services/${editingId}`
          : `${API_URL}/api/admin/services`;

      const response =
        await fetch(url, {
          method:
            editingId !== null
              ? "PUT"
              : "POST",

          headers: {
            "X-Admin-Key": ADMIN_KEY,
          },

          // IMPORTANT:
          // Do NOT set Content-Type.
          // Browser automatically creates
          // multipart/form-data boundary.
          body: formData,
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Could not save service"
        );
      }

      setMessage(
        editingId !== null
          ? "Service updated successfully."
          : "Service created successfully."
      );

      resetForm();

      await loadServices();

    } catch (error) {
      console.error(
        "Save service error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Could not save service"
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // DELETE
  // =====================================================

  async function deleteService(
    id: number
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this service?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response =
        await fetch(
          `${API_URL}/api/admin/services/${id}`,
          {
            method: "DELETE",
            headers: {
              "X-Admin-Key":
                ADMIN_KEY,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Could not delete service"
        );
      }

      setMessage(
        "Service deleted successfully."
      );

      if (editingId === id) {
        resetForm();
      }

      await loadServices();

    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Could not delete service"
      );
    }
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">

      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-10">

          <p className="text-sm font-medium text-gray-500">
            Admin
          </p>

          <h1 className="mt-1 text-4xl font-semibold tracking-tight text-gray-900">
            Service dashboard
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Create, edit, upload images and manage your services.
          </p>

        </div>

        {/* =================================================
            MESSAGES
        ================================================= */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm text-green-700">
              {message}
            </p>
          </div>
        )}

        {/* =================================================
            FORM
        ================================================= */}

        <section className="mb-12 rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">

          <div className="mb-6 flex items-center justify-between">

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {editingId !== null
                  ? "Edit service"
                  : "Add service"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {editingId !== null
                  ? "Update any service information or replace its image."
                  : "Create a new service with an image."}
              </p>
            </div>

            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel edit
              </button>
            )}

          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-6 lg:grid-cols-2"
          >

            {/* NAME */}

            <div>
              <label className="text-sm font-medium text-gray-700">
                Service name
              </label>

              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                required
                placeholder="Mobile App Development"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
              />
            </div>

            {/* PROVIDER */}

            <div>
              <label className="text-sm font-medium text-gray-700">
                Provider
              </label>

              <input
                value={provider}
                onChange={(e) =>
                  setProvider(e.target.value)
                }
                required
                placeholder="App Studio"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
              />
            </div>

            {/* CATEGORY */}

            <div>
              <label className="text-sm font-medium text-gray-700">
                Category
              </label>

              <input
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                required
                placeholder="Development"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
              />
            </div>

            {/* PRICE */}

            <div>
              <label className="text-sm font-medium text-gray-700">
                Starting price
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
                required
                placeholder="25000"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
              />
            </div>

            {/* DESCRIPTION */}

            <div className="lg:col-span-2">

              <label className="text-sm font-medium text-gray-700">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                rows={5}
                placeholder="Describe what the provider offers..."
                className="mt-2 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
              />

            </div>

            {/* IMAGE */}

            <div className="lg:col-span-2">

              <label className="text-sm font-medium text-gray-700">
                Service image
              </label>

              <div className="mt-2 grid gap-5 md:grid-cols-[1fr_240px]">

                <div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={
                      handleImageChange
                    }
                    className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm"
                  />

                  <p className="mt-2 text-xs text-gray-400">
                    PNG, JPG, JPEG, WEBP or GIF.
                  </p>

                  {editingId !== null && (
                    <p className="mt-1 text-xs text-gray-400">
                      Leave the image unchanged to keep the current image.
                    </p>
                  )}

                </div>

                {/* PREVIEW */}

                <div className="overflow-hidden rounded-xl bg-gray-100">

                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Service preview"
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center text-sm text-gray-400">
                      No image selected
                    </div>
                  )}

                </div>

              </div>

            </div>

            {/* SUBMIT */}

            <div className="flex gap-3 lg:col-span-2">

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                  ? "Save changes"
                  : "Create service"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}

            </div>

          </form>

        </section>

        {/* =================================================
            SERVICES
        ================================================= */}

        <section>

          <div className="mb-5 flex items-end justify-between">

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Services
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {services.length} service
                {services.length === 1
                  ? ""
                  : "s"}
              </p>
            </div>

            <button
              type="button"
              onClick={loadServices}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Refresh
            </button>

          </div>

          {loading ? (

            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
              <p className="text-sm text-gray-500">
                Loading services...
              </p>
            </div>

          ) : services.length === 0 ? (

            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
              <p className="text-sm text-gray-500">
                No services yet.
              </p>
            </div>

          ) : (

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {services.map(
                (service) => {

                  const imageUrl =
                    getImageUrl(
                      service.image_url
                    );

                  return (

                    <article
                      key={service.id}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                    >

                      {/* IMAGE */}

                      <div className="h-48 bg-gray-100">

                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={
                              service.name
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-gray-400">
                            No image
                          </div>
                        )}

                      </div>

                      {/* CONTENT */}

                      <div className="p-5">

                        <div className="flex items-start justify-between gap-3">

                          <div className="min-w-0">

                            <h3 className="truncate text-lg font-semibold text-gray-900">
                              {service.name}
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                              {service.provider}
                            </p>

                          </div>

                          <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                            {service.category}
                          </span>

                        </div>

                        <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-600">
                          {service.description}
                        </p>

                        <p className="mt-4 text-lg font-semibold text-gray-900">
                          ₱
                          {Number(
                            service.price
                          ).toLocaleString()}
                        </p>

                        {/* ACTIONS */}

                        <div className="mt-5 flex gap-2 border-t border-gray-100 pt-5">

                          <button
                            type="button"
                            onClick={() =>
                              startEdit(
                                service
                              )
                            }
                            className="flex-1 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteService(
                                service.id
                              )
                            }
                            className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                          >
                            Delete
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

      </div>

    </main>
  );
}
