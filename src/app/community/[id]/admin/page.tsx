"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function CommunityAdminPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const [user, setUser] = useState<any | null>(null);
  const [pendingPosts, setPendingPosts] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [communityAdminEmail, setCommunityAdminEmail] = useState<string | null>(
    null
  );
  const [authorized, setAuthorized] = useState<boolean>(false);

  useEffect(() => {
    const un = onAuthStateChanged(auth, (u) => setUser(u));
    return () => un();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const postsRes = await fetch(`/api/posts?communityId=${id}`);
      const posts = await postsRes.json();
      // filter pending (approved=false)
      setPendingPosts(
        Array.isArray(posts) ? posts.filter((p: any) => !p.approved) : []
      );

      // fetch community info
      const commRes = await fetch(`/api/communities?id=${id}`);
      const commJson = await commRes.json();
      const community = Array.isArray(commJson) ? commJson[0] : null;
      setCommunityAdminEmail(community?.admin?.email ?? null);

      // fetch members via new admin endpoint
      const memRes = await fetch(`/api/admin/communities/${id}/members-list`);
      const memJson = await memRes.json();
      setMembers(Array.isArray(memJson) ? memJson : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // recompute authorization when user or community admin email changes
  useEffect(() => {
    const master = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase();
    const caller = user?.email?.toLowerCase() ?? null;
    if (!caller) {
      setAuthorized(false);
      return;
    }
    if (caller === master) setAuthorized(true);
    else if (
      communityAdminEmail &&
      caller === communityAdminEmail.toLowerCase()
    )
      setAuthorized(true);
    else setAuthorized(false);
  }, [user, communityAdminEmail]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const getToken = async () => {
    if (!user) return null;
    return user.getIdToken();
  };

  const approve = async (postId: number) => {
    const token = await getToken();
    if (!token) return alert("Sign in as admin to approve");
    await fetch(`/api/admin/communities/${id}/posts/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ postId }),
    });
    fetchData();
  };

  const reject = async (postId: number) => {
    const token = await getToken();
    if (!token) return alert("Sign in as admin to reject");
    await fetch(`/api/admin/communities/${id}/posts/reject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ postId }),
    });
    fetchData();
  };

  const removeMember = async (userId: number) => {
    const token = await getToken();
    if (!token) return alert("Sign in as admin to remove users");
    await fetch(`/api/admin/communities/${id}/members/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  };

  const promoteMember = async (memberEmail: string) => {
    const token = await getToken();
    if (!token) return alert("Sign in as admin to promote users");

    try {
      const res = await fetch(`/api/communities/${id}/promote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetEmail: memberEmail }),
      });
      const data = await res.json();
      if (data?.error) {
        alert(`Error: ${data.error}`);
      } else {
        alert(`Promoted ${memberEmail} to admin`);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to promote member");
    }

    fetchData();
  };

  if (loading)
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto p-6 bg-slate-800 rounded-md">
          <div className="text-white">Loading admin tools...</div>
        </div>
      </div>
    );

  if (!authorized)
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto p-6 bg-slate-800 border border-slate-700 rounded-md">
          <h3 className="text-lg font-semibold text-white">Access denied</h3>
          <p className="text-sm text-gray-400 mt-2">
            Only the community admin or the master admin can access this page.
          </p>
        </div>
      </div>
    );

  // compute master admin for display
  const masterAdmin = process.env.NEXT_PUBLIC_ADMIN_EMAIL || null;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main column: pending posts and core controls */}
        <div className="flex-1 space-y-6">
          <h2 className="text-2xl font-bold text-white">
            Community Admin — Manage r/{id}
          </h2>

          <section>
            <h3 className="text-lg font-semibold text-white mb-2">
              Pending Posts
            </h3>
            {pendingPosts.length === 0 ? (
              <div className="text-sm text-gray-400">No pending posts</div>
            ) : (
              pendingPosts.map((p: any) => (
                <article
                  key={p.id}
                  className="bg-slate-800 border border-slate-700 p-4 rounded-md mb-3 shadow-sm"
                  aria-labelledby={`post-${p.id}-title`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-white">{p.user}</div>
                      <h4
                        id={`post-${p.id}-title`}
                        className="text-white mt-1 font-medium"
                      >
                        {p.title}
                      </h4>
                    </div>
                  </div>
                  <div className="text-gray-300 mt-3">
                    <p className="whitespace-pre-line">{p.body}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => approve(p.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-sm"
                      aria-label={`Approve post ${p.title}`}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => reject(p.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-md text-sm"
                      aria-label={`Reject post ${p.title}`}
                    >
                      Reject
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>
        </div>
        {/* Right sidebar: admin info, master admin, members list */}
        <aside className="w-full lg:w-96">
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="bg-slate-800 border border-slate-700 p-4 rounded-md">
              <div className="text-xs text-gray-400">Community admin</div>
              <div className="font-semibold text-white truncate">
                {communityAdminEmail || "—"}
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 p-4 rounded-md">
              <div className="text-xs text-gray-400">Master admin</div>
              <div className="font-semibold text-white truncate">
                {masterAdmin || "—"}
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 p-4 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">Members</h4>
                  <div className="text-xs text-gray-400">
                    {members.length} total
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-2 max-h-72 overflow-auto">
                {members.length === 0 ? (
                  <div className="text-sm text-gray-400">No members</div>
                ) : (
                  members.map((m: any) => {
                    const memberEmail = m.user?.email ?? "";
                    const isCurrentAdmin =
                      memberEmail && communityAdminEmail
                        ? memberEmail.toLowerCase() ===
                          communityAdminEmail.toLowerCase()
                        : false;

                    return (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-slate-700"
                      >
                        <div>
                          <div className="font-medium text-white">
                            {m.user?.name || m.user?.email}
                          </div>
                          <div className="text-xs text-gray-400">
                            {m.user?.email}
                          </div>
                        </div>
                        <div className="text-right">
                          {isCurrentAdmin && (
                            <div className="text-xs text-amber-400">Admin</div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
