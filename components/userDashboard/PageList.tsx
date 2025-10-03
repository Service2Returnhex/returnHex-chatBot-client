"use client";
import { JwtPayload } from "@/types/jwtPayload.type";
import { IPageInfo } from "@/types/pageInfo.type";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Clipboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import PageActions from "./PageActions";

export default function PagesList() {
  const [pages, setPages] = useState<IPageInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // replace with toast if you use one
      toast.success("Copied to clipboard!");
      console.log("copied");
    } catch (err) {
      console.error("copy failed", err);
    }
  };

  const togglePage = async (pageId: string) => {
    try {
      const token = typeof window !== "undefined"
        ? localStorage.getItem("accessToken") : null;
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/${pageId}/toggle-status`,
        {},
        { headers: { Authorization: `${token}` } }
      );

      // update UI after success
      setPages((prev) =>
        prev.map((p) =>
          p._id === pageId ? { ...p, isStarted: !p.isStarted } : p
        )
      );
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  }



  useEffect(() => {
    let mounted = true;
    async function loadByOwner() {
      setLoading(true);
      try {
        const token = typeof window !== "undefined"
          ? localStorage.getItem("accessToken") : null;
        if (!token) {
          toast.error("Please login first");
          return;
        }

        const decoded = jwtDecode<JwtPayload>(token);
        const ownerId = decoded.userId ?? decoded._id ?? decoded.id;
        console.log("ownerid", ownerId);
        if (!ownerId) {
          toast.error("Could not get owner id from token");
          return;
        }

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/shop/owner/${ownerId}`,
          {
            headers: {
              Authorization: `${token}`,
              "ngrok-skip-browser-warning": "69420"
            }
          }
        );
        console.log("response", res);
        if (!res.data.success) {
          toast.error(res.data.message || "Failed to load pages");
          return;
        }

        if (mounted) {
          setPages(res.data.data as IPageInfo[]);
        }
        console.log("page null", pages);
      } catch (err: any) {
        console.error("loadByOwner error:", err);
        toast.error(err?.response?.data?.message || err?.message || "Could not load pages");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadByOwner();
    return () => { mounted = false; };
  }, []);
  console.log("page", pages);

  if (loading) return <div>Loading...</div>;
  if (!pages || pages.length === 0) return <div>No pages found for this owner.</div>;
  return (
    <div className="p-2">
      <div className="card-bg p-5 rounded-lg shadow border  border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Bot Pages Management</h2>

        {/* Desktop / tablet: table (md+) */}
        <div className="hidden md:block">
          {/* overflow wrapper — allows horizontal scroll without breaking layout */}
          <div className="overflow-x-auto -mx-5 px-5">
            {/* Make table use fixed layout so truncation works predictably */}
            <table className="w-full table-fixed text-left border-collapse min-w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-3 text-sm font-medium text-gray-300 w-[15%]">Page Name</th>
                  <th className="p-3 text-sm font-medium text-gray-300 w-[20%]">Page ID / Owner ID</th>
                  {/* <th className="p-3 text-sm font-medium text-gray-300 w-2/9">Owner Id</th> */}
                  <th className="p-3 text-sm font-medium text-gray-300 w-[40%]">Access Token / Created </th>
                  {/* <th className="p-3 text-sm font-medium text-gray-300 w-[10%]">Created</th> */}
                  <th className="p-3 text-sm font-medium text-gray-300 w-[10%]">Status</th>
                  <th className="p-3 text-sm font-medium text-gray-300 w-[10%]">Actions</th>
                </tr>
              </thead>

              <tbody>
                {pages.map((page, idx) => (
                  <tr
                    key={page.shopId || idx}
                    className="border-b border-gray-800 hover:bg-white/2 transition-colors"
                  >
                    <td className="p-3 align-top">
                      <div className="font-semibold text-white  max-w-[240px]">
                        {page.pageName}
                      </div>
                    </td>

                    <td className="p-3 align-top text-sm text-gray-300">
                      <div className="max-w-[120px]">
                        <div className="flex items-center gap-1">
                          <div className="flex flex-col ">
                            <div className="text-xs text-gray-400">Shop Id</div>
                            <div className="truncate max-w-[220px]">{page.shopId}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(page.shopId ?? "")}
                            className="p-1 rounded text-gray-400 hover:text-white/90 hover:bg-white/5 cursor-pointer"
                            aria-label="Copy token"
                          >
                            <Clipboard className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex flex-col ">
                            <div className="text-xs text-gray-400">Owner Id</div>
                            <div className="truncate max-w-[150px]">{page.ownerId}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(page?.ownerId ?? "")}
                            className="p-1 pt-4 rounded text-gray-400 hover:text-white/90 hover:bg-white/5"
                            aria-label="Copy shop id"
                          >
                            <Clipboard className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* <div className=" max-w-[350px]">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col ">
                          <div className="text-xs text-gray-400">Order Id</div>
                          <div className="truncate max-w-[200px]">{o._id}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(o._id ?? "")}
                          className="p-1 pt-4 rounded text-gray-400 hover:text-white/90 hover:bg-white/5"
                          aria-label="Copy order id"
                        >
                          <Clipboard className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex flex-col ">
                          <div className="text-xs text-gray-400">Shop Id</div>
                          <div className="truncate max-w-[200px]">{o.shopId}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(o.shopId)}
                          className="p-1 pt-4 rounded text-gray-400 hover:text-white/90 hover:bg-white/5"
                          aria-label="Copy shop id"
                        >
                          <Clipboard className="h-4 w-4" />
                        </button>
                      </div>

                    </div> */}

                    {/* <td className="p-3 align-top text-sm text-gray-300">
                      <div className="flex items-center gap-3">
                        <span className="truncate max-w-[160px] block break-words">
                          {page?.ownerId}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(page.ownerId ?? "")}
                          className="p-1 rounded text-gray-400 hover:text-white/90 hover:bg-white/5 cursor-pointer"
                          aria-label="Copy token"
                        >
                          <Clipboard className="h-4 w-4" />
                        </button>
                      </div>
                    </td> */}

                    <td className="p-3 align-top text-sm text-gray-300">
                      <div className="max-w-[380px]">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col ">
                            <div className="text-xs text-gray-400">Acess Token</div>
                            <span className="truncate  max-w-[300px] xl:max-w-[400px] block break-words">
                              {page.accessToken}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(page.accessToken ?? "")}
                            className="p-1 rounded text-gray-400 hover:text-white/90 hover:bg-white/5 cursor-pointer"
                            aria-label="Copy token"
                          >
                            <Clipboard className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex flex-col ">
                            <div className="text-xs text-gray-400">createdAt</div>
                            <div className="truncate max-w-[140px]">{new Date(page.createdAt ?? "").toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka" })}</div>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* <td className="p-3 align-top text-sm text-gray-300">
                      <div className="truncate max-w-[140px]">{new Date(page.createdAt ?? "").toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka" })}</div>
                    </td> */}

                    <td className="p-3 align-top cursor-pointer" onClick={() => togglePage(page._id)}>
                      <span
                        role="status"
                        aria-label={page.isStarted ? "Started" : "Not started"}
                        title={page.isStarted ? "Started" : "Not started"}
                        className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full ${page.isStarted ? "bg-green-600 text-white" : "bg-red-600 text-white"
                          }`}
                      >
                        <span

                          aria-hidden
                          className={`w-2 h-2 rounded-full ${page.isStarted ? "bg-white/90" : "bg-white/90"}`}
                        />
                        {page.isStarted ? "Started" : "Not started"}
                      </span>
                    </td>

                    <td className="p-3 align-top relative cursor-pointer items-center flex justify-center">
                      <PageActions
                        page={page}
                        onEdit={(p) => {
                          // parent decides what to do (e.g. log + navigate)
                          console.log("Edit:", p);
                          router.push(`/user-dashboard/update-pageInfo/${p.shopId}`);
                        }}
                        onView={(p) => {
                          console.log("View:", p);
                          router.push(`/user-dashboard/pages/${p.shopId}`);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile: stacked cards (sm and down) */}
        <div className="md:hidden space-y-3">
          {pages.map((page, idx) => (
            <article
              key={page.shopId || idx}
              className="bg-surface p-4 rounded-lg border border-gray-700 w-full break-words"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 w-full">
                    {/* Title */}
                    <h3
                      className="font-semibold text-white truncate text-base sm:text-lg w-full sm:w-auto"
                      title={page.pageName}
                    >
                      {page.pageName}
                    </h3>

                    {/* Status badge */}
                    <span
                      role="status"
                      aria-label={`Status ${page.isStarted ? "Started" : "Not Started"}`}
                      className={`self-start sm:self-auto inline-flex items-center text-xs px-3 py-1 rounded-full ${page.isStarted ? "bg-green-600 text-white" : "bg-red-600 text-white"
                        }`}
                    >
                      <span
                        aria-hidden
                        className={`inline-block w-2 h-2 rounded-full mr-2 ${page.isStarted ? "bg-white" : "bg-white"}`}
                      />
                      {page.isStarted ? "Started" : "Not Started"}
                    </span>
                  </div>

                  <dl className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-300">
                    <div>
                      <dt className="text-xs text-gray-400 flex items-center justify-between">
                        <span>Page ID</span>
                        <button
                          onClick={() => copyToClipboard(page.shopId ?? "")}
                          className="text-xs text-gray-300 hover:text-white/90 border border-gray-500 py-1 px-2 rounded-xl cursor-pointer"
                        >
                          Copy
                        </button></dt>
                      <dd className="truncate break-words max-w-full">{page.shopId}</dd>
                    </div>

                    <div>
                      <dt className="text-xs text-gray-400">Owner</dt>
                      <dd className="truncate break-words max-w-full">{page.ownerId}</dd>
                    </div>

                    <div>
                      <dt className="text-xs text-gray-400 flex items-center justify-between">
                        <span>Access Token</span>
                        <button
                          onClick={() => copyToClipboard(page.accessToken ?? "")}
                          className="text-xs text-gray-300 hover:text-white/90 border border-gray-500 py-1 px-2 rounded-xl cursor-pointer"
                        >
                          Copy
                        </button>
                      </dt>
                      <dd className="truncate break-words max-w-full">{page.accessToken}</dd>
                    </div>

                    <div>
                      <dt className="text-xs text-gray-400">Created</dt>
                      <dd>{page.createdAt}</dd>
                    </div>
                  </dl>
                </div>

                <div className="flex-shrink-0 ml-2">
                  <PageActions
                    page={page}
                    onEdit={(p) => {
                      // parent decides what to do (e.g. log + navigate)
                      console.log("Edit:", p);
                      router.push(`/user-dashboard/update-pageInfo/${p.shopId}`);
                    }}
                    onView={(p) => {
                      console.log("View:", p);
                      router.push(`/user-dashboard/pages/${p.shopId}`);
                    }}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>

  );
}
