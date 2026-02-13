"use client";

import { useEffect, useState } from "react";
import PostList from "./components/Posts/PostList";
import { useAuth } from "@/context/AuthContext";
import { IPost } from "@/types/types";
import { PostsService } from "@/services/posts";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { TTabType } from "./components/Posts/types";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TTabType>("all");

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setPosts([]);

      try {
        switch (activeTab) {
          case "all": {
            const allPosts = await PostsService.getAllPosts();
            setPosts(allPosts);
            break;
          }

          case "feed": {
            if (!user) {
              setPosts([]);
              break;
            }

            const userDoc = await getDoc(doc(db, "users", user.uid));
            const communityIds = userDoc.data()?.subscribedCommunities || [];

            if (communityIds.length > 0) {
              const feedPosts = await PostsService.getFeedPosts(communityIds);
              setPosts(feedPosts);
            } else {
              setPosts([]);
            }
            break;
          }

          case "mine": {
            if (!user) break;
            const myPosts = await PostsService.getUserPosts(user.uid);
            setPosts(myPosts);
            break;
          }
        }
      } catch (error) {
        console.error("Ошибка при загрузке постов:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchPosts();
    }
  }, [user, activeTab, authLoading]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="flex gap-6 mb-6 border-b border-border overflow-x-auto no-scrollbar">
        {[
          { id: "all", label: "Все посты" },
          { id: "feed", label: "Подписки" },
          { id: "mine", label: "Мои посты" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TTabType)}
            className={cn(
              "cursor-pointer pb-2 px-1 text-sm font-medium transition-colors relative whitespace-nowrap",
              activeTab === tab.id
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <PostList
        posts={posts}
        isLoading={loading}
        activeTab={activeTab}
        isAuth={!!user}
      />
    </div>
  );
}
