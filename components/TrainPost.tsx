"use client";
import { TPost } from "@/types/post.type";
import { TTrainedPost } from "@/types/trainedPost.type";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { PostCardNotTrained, PostCardTrained } from "./PostCard";
import { FormField } from "./ui/FormField";

export default function TrainPost() {
  const router = useRouter();
  const [pageId, setPageId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [posts, setPosts] = useState([]);
  const [trainedPosts, setTrainedPosts] = useState<TTrainedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [trainLoading, setTrainLoading] = useState<string | null>(null);
  const [notTrainLoading, setNotTrainLoading] = useState<string | null>(null);

  const [isTrained, setIsTraind] = useState(false);

  useEffect(() => {
    const savedPageId = typeof window !== "undefined"
      ? localStorage.getItem("pageId") : null;
    if (!savedPageId) return;
    axios
      .get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/shop/${savedPageId}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        }
      )
      .then((res) => {
        const { data } = res;
        if (data.success) {
          setPageId(data.data.shopId);
          setAccessToken(data.data.accessToken);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [accessToken]);
  const fields = [
    "message",
    // request attachments and subattachments with description/title/media
    "created_time", "attachments{media_type,media,description,title,subattachments{media,description,title,target}}",
  ].join(",");

  const fetchPosts = async () => {
    if (!pageId || !accessToken) return;
    setLoading(true);


    // const url = `https://graph.facebook.com/v19.0/${pageId}/posts`;
    // const response = await axios.get(url, {
    //   params: { fields, access_token: accessToken },
    //   timeout: 10000,
    // });
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v19.0/${pageId}/posts?access_token=${accessToken}`,
        {
          params: { fields, },
        }
      );
      const res1 = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/trained-products?pageId=${pageId}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        }
      );
      console.log("response", response.data.data);
      console.log("res1", res1);
      setPosts(response.data.data);
      setTrainedPosts(res1.data.data);

      toast.success("Post Retrieved!");
      typeof window !== "undefined"
        ? localStorage.setItem("pageId", pageId) : null;
    } catch (error) {
      console.error("Failed to fetch posts", error);
      toast.error(
        "Failed to fetch posts. Check your Page ID and Access Token."
      );
    } finally {
      setLoading(false);
    }
  };
  console.log("all post", posts);

  const handleTrainPosts = async (post: TPost) => {
    try {
      setTrainLoading(post.id);
      console.log("post image", post);

      // Build images[] from common shapes. Adapt to your post shape.
      const images: Array<{ url: string; caption?: string; embedding?: number[]; phash?: string }> = [];

      // Example: attachments array with media.image.src
      if (Array.isArray((post as any).attachments) && (post as any).attachments.length > 0) {
        for (const att of (post as any).attachments) {
          const url =
            (att.media && att.media.image && att.media.image.src) ||
            att.media?.image?.uri ||
            att.url ||
            att.src ||
            att.image ||
            "";
          if (!url) continue;
          const caption = att.title ?? att.caption ?? att.alt_text ?? post.message ?? "";
          images.push({ url: String(url), caption: String(caption) });
        }
      }

      // Example: if post.images array exists
      if (images.length === 0 && Array.isArray((post as any).images) && (post as any).images.length > 0) {
        for (const img of (post as any).images) {
          const url = img.url ?? img.src ?? "";
          if (!url) continue;
          images.push({ url: String(url), caption: img.caption ?? post.message ?? "" });
        }
      }

      // Fallback to full_picture single-image
      if (images.length === 0 && post.full_picture) {
        images.push({ url: String(post.full_picture), caption: post.message ?? "" });
      }

      // FINAL payload: include shopId/postId + the raw post + normalized images
      const payload = {
        shopId: pageId,
        postId: post.id,
        message: post.message ?? "",
        summarizedMsg: post.summarizedMsg ?? "",
        aggregatedEmbedding: post.aggregatedEmbedding ?? [],
        full_picture: post.full_picture ?? (images[0]?.url ?? ""),
        createdAt: post.created_time ?? new Date().toISOString(),
        images,
        rawPost: post,
      };

      console.debug("train payload", payload);

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/product`, payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 60_000,
        }
      );
      console.log("data", data);
      if (data.success) {
        toast.success("Post Trained");
        await fetchPosts();
      }
    } catch (error) {
      console.error("Training post failed:", error);
      toast.error("Training failed. Please try again.");
    } finally {
      setTrainLoading(null);
    }
  };

  const handleNoTrain = async (shopId: string, postId: string) => {
    try {
      setNotTrainLoading(postId);
      const { data } = await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/product/${postId}?shopId=${shopId}`
      );
      if (data.success) {
        toast.warning("Post removed from Training");
        await fetchPosts();
      }
    } catch (error) {
      console.error("Training removed post failed:", error);
      toast.error("Training remoded failed. Please try again.");
    } finally {
      setNotTrainLoading(null);
    }
  };
  return (
    <div className=" min-h-screen w-full relative bg-radial-aurora container">
      {/* <Navigation title="Train Bot" /> */}
      <div className="container mx-auto p-6">
        <div className="w-full text-white space-y-6 bg-gray-500/20  border border-white/50 filter bg-blur-md p-4  backdrop-blur-xl transition-transform rounded-2xl">
          <h1 className="text-2xl font-bold text-blue-500 mb-4">
            Train Post Data
          </h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchPosts();
            }}
            className="mb-6 space-y-4"
          >
            <div>
              <FormField
                label="Page ID"
                id="pageId"
                value={pageId}
                onChange={(val) => setPageId(val)}
                placeholder="Enter your Facebook pageId"
                required
              />
            </div>
            <div>
              <FormField
                label="Access Token"
                id="accessToken"
                value={accessToken}
                onChange={(val) => setAccessToken(val)}
                placeholder="Enter your Facebook Access"
                required
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:scale-105
    transition-transform duration-300 hover:shadow-2xl hover:shadow-blue-600 cursor-pointer"
            >
              {loading ? "Loading..." : "Fetch Posts"}
            </button>
          </form>
        </div>
        {/* button section */}
        <div className="flex justify-center gap-3  my-8 relative">
          <button
            onClick={() => {
              setIsTraind(false);
            }}
            type="button"
            className="px-4 py-2 bg-red-600 text-white rounded hover:scale-105
    transition-transform duration-300 hover:shadow-2xl hover:shadow-red-600 cursor-pointer"
          >
            Not Trained
          </button>
          <button
            onClick={() => {
              setIsTraind(true);
            }}
            type="button"
            className="px-4 py-2 bg-green-600 text-white rounded hover:scale-105
    transition-transform duration-300 hover:shadow-2xl hover:shadow-green-600 cursor-pointer"
          >
            Trained
          </button>
        </div>
        {/* post card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 place-items-center">
          {!isTrained
            ? posts
              .filter((post: TPost) => {
                if (!trainedPosts?.length) return true;

                const matched = trainedPosts.find(
                  (trainedPost) =>
                    trainedPost.shopId === pageId &&
                    trainedPost.postId === post.id
                );

                if (matched) {
                  return !matched.isTrained;
                }
                return true;
              })
              .map((post: TPost, idx: number) => (
                <PostCardNotTrained
                  key={idx}
                  post={post}
                  handleTrainPosts={handleTrainPosts}
                  trainLoading={trainLoading}
                  setTrainLoading={setTrainLoading}
                />
              ))
            : trainedPosts?.map((post: TTrainedPost, idx: number) => {
              return (
                <PostCardTrained
                  key={idx}
                  post={post}
                  handleNoTrain={handleNoTrain}
                  notTrainLoading={notTrainLoading}
                  setNotTrainLoading={setNotTrainLoading}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
}
