// utils.js

export function filterMemos(memos, filter, myUserId, followingIds) {
  return memos.filter((memo) => {
    if (filter === "all") return true;
    if (filter === "me") return memo.userId === myUserId;
    if (filter === "following") return followingIds.includes(memo.userId);
    if (filter === "mine") return memo.userId === myUserId;
    return true;
  });
}
