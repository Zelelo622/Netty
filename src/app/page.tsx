import { MOCK_POSTS } from "@/lib/mock-data";
import PostList from "./components/Posts/PostList";

export default function Home() {
  return (
    <>
      <PostList posts={MOCK_POSTS} isLoading={false} />
    </>
  );
}
