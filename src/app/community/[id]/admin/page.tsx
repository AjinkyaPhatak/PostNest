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

  if (loading) return <div>Loading admin tools...</div>;

  if (!authorized)
    return (
      <div className="p-6 bg-slate-900/50 rounded">
        <h3 className="text-lg font-semibold text-white">Access denied</h3>
        <p className="text-sm text-gray-400">
          Only the community admin or the master admin can access this page.
        </p>
      </div>
    );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">
        Community Admin — Manage r/{id}
      </h2>

      <section>
        <h3 className="text-lg font-semibold text-white mb-2">Pending Posts</h3>
        {pendingPosts.length === 0 ? (
          <div className="text-sm text-gray-400">No pending posts</div>
        ) : (
          pendingPosts.map((p: any) => (
            <div key={p.id} className="bg-slate-900/50 p-4 rounded-md mb-3">
              <div className="font-semibold text-white">{p.user}</div>
              <div className="text-gray-300 mt-2">
                <strong className="block text-white">{p.title}</strong>
                <span className="text-gray-300">{p.body}</span>
              </div>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={() => approve(p.id)}
                  className="px-3 py-1 bg-green-600 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => reject(p.id)}
                  className="px-3 py-1 bg-red-600 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-2">Members</h3>
        {members.length === 0 ? (
          <div className="text-sm text-gray-400">No members</div>
        ) : (
          <div className="space-y-2">
            {members.map((m: any) => {
              const memberEmail = m.user?.email ?? "";
              const isCurrentAdmin =
                memberEmail && communityAdminEmail
                  ? memberEmail.toLowerCase() ===
                    communityAdminEmail.toLowerCase()
                  : false;

              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between bg-slate-900/50 p-3 rounded-md mb-2"
                >
                  <div>
                    <div className="font-semibold text-white">
                      {m.user?.name || m.user?.email}
                    </div>
                    <div className="text-sm text-gray-400">
                      Joined: {new Date(m.joinedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!isCurrentAdmin && (
                      <button
                        onClick={() => promoteMember(memberEmail)}
                        className="px-3 py-1 bg-amber-600 rounded"
                      >
                        Promote
                      </button>
                    )}
                    <button
                      onClick={() => removeMember(m.userId)}
                      className="px-3 py-1 bg-red-600 rounded"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
