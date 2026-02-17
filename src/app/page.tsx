"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

interface Bookmark {
  id: string;
  title: string;
  url: string;
  created_at: string;
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  // Check user on page load
  useEffect(() => {
    async function checkUser() {
      const supabase = await getSupabaseClient();
      const { data } = await supabase.auth.getUser();
      setUser(data.user || null);
      if (data.user) fetchBookmarks(data.user);
    }

    checkUser();
    // Listen for auth changes
    let listenerSub: any = null;
    let supabaseForListener: any = null;

    (async () => {
      supabaseForListener = await getSupabaseClient();
      const { data } = supabaseForListener.auth.onAuthStateChange(
        (_event: any, session: any) => {
          const currentUser = session?.user || null;
          setUser(currentUser);
          if (currentUser) fetchBookmarks(currentUser);
          else setBookmarks([]);
        },
      );

      listenerSub = data?.subscription || null;
    })();

    return () => {
      if (listenerSub && supabaseForListener) {
        listenerSub.unsubscribe();
      }
    };
  }, []);

  // Fetch bookmarks safely
  async function fetchBookmarks(currentUser?: any) {
    const activeUser = currentUser || user;
    if (!activeUser) return;

    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", activeUser.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bookmarks:", error);
      return;
    }

    setBookmarks(data || []);
  }

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    let subscription: any = null;
    let supabaseForCleanup: any = null;

    (async () => {
      const supabase = await getSupabaseClient();
      supabaseForCleanup = supabase;

      subscription = supabase
        .channel("public:bookmarks")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookmarks",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchBookmarks();
          },
        )
        .subscribe();
    })();

    return () => {
      if (subscription && supabaseForCleanup) {
        supabaseForCleanup.removeChannel(subscription);
      }
    };
  }, [user]);

  // Login with Google
  async function loginWithGoogle() {
    const supabase = await getSupabaseClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) console.error("Login error:", error);
  }

  // Logout
  async function logout() {
    const supabase = await getSupabaseClient();
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Logout error:", error);
    setUser(null);
    setBookmarks([]);
  }

  // Add bookmark
  async function addBookmark(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !url) return alert("Title and URL are required");
    if (!user) return;

    const supabase = await getSupabaseClient();

    const { error } = await supabase.from("bookmarks").insert({
      title,
      url,
      user_id: user.id,
    });

    if (error) {
      console.error("Error adding bookmark:", error);
      return;
    }

    setTitle("");
    setUrl("");
    fetchBookmarks();
  }

  // Delete bookmark
  async function deleteBookmark(id: string) {
    const supabase = await getSupabaseClient();
    const { error } = await supabase.from("bookmarks").delete().eq("id", id);
    if (error) console.error("Error deleting bookmark:", error);
    fetchBookmarks();
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <button
          onClick={loginWithGoogle}
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Smart Bookmarks</h1>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <form onSubmit={addBookmark} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 flex-1 rounded"
        />
        <input
          type="url"
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="border p-2 flex-1 rounded"
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 rounded hover:bg-green-600"
        >
          Add
        </button>
      </form>

      <ul className="space-y-2">
        {bookmarks.map((bm) => (
          <li
            key={bm.id}
            className="flex justify-between items-center border p-2 rounded"
          >
            <a
              href={bm.url}
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              {bm.title}
            </a>
            <button
              onClick={() => deleteBookmark(bm.id)}
              className="bg-red-500 text-white px-2 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
