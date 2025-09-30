import { IImageItem, TPost } from "@/types/post.type";
import { TTrainedPost } from "@/types/trainedPost.type";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
type NTProps = {
  post: TPost;
  handleTrainPosts: (post: TPost) => void;
  trainLoading: string | null;
  setTrainLoading: Dispatch<SetStateAction<string | null>>;
};


function extractImagesFromFB(post: Partial<TPost>): IImageItem[] {
  const out: IImageItem[] = [];

  try {
    const attachments = (post as any).attachments?.data;
    if (Array.isArray(attachments) && attachments.length > 0) {
      const first = attachments[0];

      // album with subattachments
      if (first?.subattachments?.data && Array.isArray(first.subattachments.data)) {
        for (const sub of first.subattachments.data) {
          const url = sub?.media?.image?.src ?? sub?.media?.image?.url;
          const caption = sub?.description ?? sub?.title ?? post?.message ?? "";
          if (url) out.push({ url: String(url), caption: String(caption ?? "") });
        }
        if (out.length) return out;
      }

      // single photo case
      const singleUrl = first?.media?.image?.src ?? first?.media?.image?.url;
      const singleCaption = first?.description ?? first?.title ?? post?.message ?? "";
      if (singleUrl) {
        out.push({ url: String(singleUrl), caption: String(singleCaption ?? "") });
        return out;
      }
    }
  } catch (e) {
    console.warn("extractImagesFromFB parse error", e);
  }

  // fallback to post.images
  if (Array.isArray(post.images) && post.images.length > 0) {
    for (const i of post.images) {
      if (i?.url) out.push({ url: String(i.url), caption: String(i.caption ?? "") });
    }
    if (out.length) return out;
  }

  // fallback to full_picture
  if (post.full_picture) {
    out.push({ url: String(post.full_picture), caption: post.message ?? "" });
  }

  return out;
}


export function PostCardNotTrained(props: NTProps) {
  const { post, handleTrainPosts, trainLoading } = props;

  // normalized image list
  const images = useMemo(() => extractImagesFromFB(post), [post]);

  // gallery state
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);

  // show up to 4 thumbs, last thumb shows +N overlay if more
  const maxThumbs = 4;
  const visibleThumbs = images.slice(0, maxThumbs);
  const remaining = Math.max(0, images.length - visibleThumbs.length);

  const mainImage = images[0] ?? null;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
      if (e.key === "ArrowRight" && images.length) setIndex((s) => (s + 1) % images.length);
      if (e.key === "ArrowLeft" && images.length) setIndex((s) => (s - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, images.length]);

  const openGalleryAt = (i: number) => {
    setIndex(i);
    setIsOpen(true);
  };

  const onTrainClick = async () => {
    try {
      await handleTrainPosts(post);
    } catch (err: any) {
      console.error("Train error", err);
      toast.error("Training failed");
    }
  };

  // console.log("post", post);
  return (
    <>
      <article
        key={post?.id}
        className="group relative w-full max-w-[350px] min-h-[500px] rounded-lg p-4 shadow-lg bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 hover:scale-[1.02] transition-transform duration-300 text-white overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none" />

        {/* image */}
        <div className="relative rounded overflow-hidden bg-black/10">
          {mainImage ? (
            <Image
              height={500}
              width={500}
              src={mainImage.url}
              alt={mainImage.caption || post.message || "Post image"}
              className="w-full h-[260px] object-cover rounded"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-[260px] flex items-center justify-center bg-gray-900 rounded">
              <svg className="w-16 h-16 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M3 3h18v18H3z" />
              </svg>
            </div>
          )}

          {/* thumbs grid overlay bottom-left */}
          {images.length > 0 && (
            <div className="absolute left-3 bottom-3 flex gap-2">
              {visibleThumbs.map((img, i) => {
                const isLastAndMore = i === visibleThumbs.length - 1 && remaining > 0;
                return (
                  <button
                    key={img.url + i}
                    onClick={() => openGalleryAt(i)}
                    className="relative w-16 h-16 rounded overflow-hidden border-2 border-transparent focus:outline-none"
                    aria-label={`Open image ${i + 1}`}
                  >
                    <Image src={img.url} alt={img.caption ?? `thumb ${i + 1}`} height={500} width={500} className="w-full h-full object-cover" loading="lazy" />
                    {isLastAndMore && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-sm font-semibold">
                        +{remaining}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-col gap-2">
          <p className="font-semibold text-lg my-2 line-clamp-3">{post?.message || "No message"}</p>
          <p className="text-xs text-gray-300">Created:{new Date(post.created_time).toLocaleString()}</p>

          <div className="flex gap-2 mt-3">
            <button
              onClick={onTrainClick}
              disabled={trainLoading === post.id}
              className="px-3 py-1 bg-green-600 text-white rounded hover:scale-105 transition-transform duration-200 disabled:opacity-60"
            >
              {trainLoading === post.id ? "Training…" : "Train"}
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(String(post.id)).then(() => toast.success("Copied post id"));
              }}
              className="px-2 py-1 bg-white/5 rounded text-sm text-gray-200 hover:bg-white/10"
            >
              Copy ID
            </button>
          </div>
        </div>
      </article>

      {/* Modal gallery */}
      {isOpen && images.length > 0 && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative z-10 max-w-[95vw] max-h-[95vh] w-full flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIndex((s) => (s - 1 + images.length) % images.length);
              }}
              aria-label="Previous"
              className="absolute left-2 md:left-6 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2"
            >
              <ChevronLeft />
            </button>

            <div className="max-w-[90vw] max-h-[80vh] p-2 rounded">
              <img src={images[index].url} alt={images[index].caption || post.message} className="max-w-full max-h-[70vh] object-contain rounded-lg" />
              {images[index].caption && <div className="mt-2 text-xl text-gray-300 text-center">{images[index].caption}</div>}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIndex((s) => (s + 1) % images.length);
              }}
              aria-label="Next"
              className="absolute right-2 md:right-6 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2"
            >
              <ChevronRight />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              aria-label="Close"
              className="absolute right-4 top-4 text-white bg-black/30 hover:bg-black/50 rounded-full p-2"
            >
              <X />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

type TProps = {
  post: TTrainedPost;
  handleNoTrain: (shopId: string, postId: string) => void;
  notTrainLoading: string | null;
  setNotTrainLoading: Dispatch<SetStateAction<string | null>>;
};
export function PostCardTrained(props: TProps) {
  const { post, handleNoTrain, notTrainLoading, setNotTrainLoading } = props;

  const images = useMemo(() => extractImagesFromFB(post), [post]);
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const maxThumbs = 4;
  const visibleThumbs = images.slice(0, maxThumbs);
  const remaining = Math.max(0, images.length - visibleThumbs.length);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
      if (e.key === "ArrowRight" && images.length) setIndex((s) => (s + 1) % images.length);
      if (e.key === "ArrowLeft" && images.length) setIndex((s) => (s - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, images.length]);

  const openGalleryAt = (i: number) => {
    setIndex(i);
    setIsOpen(true);
  };

  const onNotTrainClick = async () => {
    try {
      setNotTrainLoading(post.postId);
      const maybePromise = handleNoTrain(post.shopId, post.postId);
      // if (maybePromise instanceof Promise) await maybePromise;
    } catch (e) {
      console.error("handleNoTrain error", e);
    } finally {
      setNotTrainLoading(null);
    }
  };


  console.log("train post", post);
  return (
    <>
      <div
        key={post?.postId}
        className="group relative w-full max-w-[350px] min-h-[505px] rounded-lg p-4 shadow-lg bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 hover:scale-[1.02] transition-transform duration-300 text-white overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none" />

        {/* main image / placeholder */}
        <div className="relative rounded overflow-hidden bg-black/10">
          {images[0] ? (
            <Image
              src={images[0].url}
              alt={images[0].caption || post.message || "Post image"}
              height={500}
              width={500}
              className="w-full h-[300px] object-cover rounded"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-[300px] flex items-center justify-center bg-gray-900 rounded">
              <svg className="w-16 h-16 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M3 3h18v18H3z" />
              </svg>
            </div>
          )}

          {/* thumbnail strip */}
          {visibleThumbs.length > 0 && (
            <div className="absolute left-3 bottom-3 flex gap-2">
              {visibleThumbs.map((img, i) => {
                const isLastAndMore = i === visibleThumbs.length - 1 && remaining > 0;
                return (
                  <button
                    key={img.url + i}
                    onClick={() => openGalleryAt(i)}
                    className="relative w-16 h-16 rounded overflow-hidden border-2 border-transparent focus:outline-none"
                    aria-label={`Open image ${i + 1}`}
                  >
                    <Image src={img.url} alt={img.caption ?? `thumb ${i + 1}`} height={500} width={500} className="w-full h-full object-cover" loading="lazy" />
                    {isLastAndMore && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-sm font-semibold">
                        +{remaining}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* content */}
        <div className="mt-3 flex flex-col gap-2">
          <p className="font-semibold text-lg my-2 line-clamp-3">{post?.message || "No message"}</p>
          <p className="text-xs text-gray-300">Created: {new Date(post.createdAt).toLocaleString()}</p>

          <div className="flex gap-2 mt-3">
            <button
              onClick={onNotTrainClick}
              disabled={notTrainLoading === post.postId}
              className="px-3 py-1 bg-red-600 text-white rounded hover:scale-105 transition-transform duration-200 disabled:opacity-60"
            >
              {notTrainLoading === post.postId ? "Processing…" : "Not Train"}
            </button>

            <button
              onClick={() => {
                try {
                  navigator.clipboard.writeText(String(post.postId));
                } catch {
                  // ignore
                }
              }}
              className="px-2 py-1 bg-white/5 rounded text-sm text-gray-200 hover:bg-white/10"
            >
              Copy ID
            </button>
          </div>
        </div>
      </div>

      {/* modal */}
      {isOpen && images.length > 0 && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <div className="relative z-10 max-w-[95vw] max-h-[95vh] w-full flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIndex((s) => (s - 1 + images.length) % images.length);
              }}
              aria-label="Previous"
              className="absolute left-2 md:left-6 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2"
            >
              <ChevronLeft />
            </button>

            <div className="max-w-[90vw] max-h-[80vh] p-2 rounded">
              <Image src={images[index].url} alt={images[index].caption || post.message} height={500} width={500} className="max-w-full max-h-[80vh] object-contain rounded-lg" />
              {images[index].caption && <div className="mt-2 text-lg text-gray-300 text-center">{images[index].caption}</div>}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIndex((s) => (s + 1) % images.length);
              }}
              aria-label="Next"
              className="absolute right-2 md:right-6 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2"
            >
              <ChevronRight />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              aria-label="Close"
              className="absolute right-4 top-4 text-white bg-black/30 hover:bg-black/50 rounded-full p-2"
            >
              <X />
            </button>

            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] px-2">
                {images.map((img, i) => (
                  <button
                    key={img.url + i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIndex(i);
                    }}
                    className={`w-14 h-14 rounded overflow-hidden border-2 ${i === index ? "border-white" : "border-transparent"}`}
                    aria-label={`Show image ${i + 1}`}
                  >
                    <Image src={img.url} alt={img.caption ?? `thumb ${i + 1}`} height={500} width={500} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
