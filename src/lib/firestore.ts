import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  onSnapshot,
  increment,
  setDoc,
  serverTimestamp,
  Timestamp,
  DocumentData,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from './firebase'
import type { Work, Episode, Comment, User, Draft } from '@/types'

function toDate(val: unknown): Date | undefined {
  if (!val) return undefined
  if (val instanceof Timestamp) return val.toDate()
  if (val instanceof Date) return val
  return undefined
}

function docToWork(id: string, data: DocumentData): Work {
  return {
    id,
    title: data.title ?? '',
    summary: data.summary,
    coverImageUrl: data.coverImageUrl,
    authorId: data.authorId ?? '',
    authorName: data.authorName ?? '',
    viewCount: data.viewCount ?? 0,
    likeCount: data.likeCount ?? 0,
    createdAt: toDate(data.createdAt),
  }
}

function docToEpisode(id: string, data: DocumentData): Episode {
  return {
    id,
    workId: data.workId ?? '',
    title: data.title ?? '',
    content: data.content ?? '',
    topImages: data.topImages ?? [],
    bottomImages: data.bottomImages ?? [],
    episodeNumber: data.episodeNumber ?? 1,
    likeCount: data.likeCount ?? 0,
    commentCount: data.commentCount ?? 0,
    createdAt: toDate(data.createdAt),
  }
}

function docToComment(id: string, data: DocumentData): Comment {
  return {
    id,
    episodeId: data.episodeId ?? '',
    userId: data.userId ?? '',
    userName: data.userName ?? '',
    userProfileImageUrl: data.userProfileImageUrl,
    content: data.content ?? '',
    createdAt: toDate(data.createdAt),
  }
}

function docToUser(id: string, data: DocumentData): User {
  return {
    id,
    userId: data.userId ?? id,
    displayName: data.displayName,
    email: data.email,
    profileImageUrl: data.profileImageUrl,
    bio: data.bio,
    createdAt: toDate(data.createdAt),
  }
}

// ---- Works ----

export async function fetchWorks(): Promise<Work[]> {
  const q = query(collection(db, 'works'), limit(50))
  const snap = await getDocs(q)
  const works = snap.docs.map((d) => docToWork(d.id, d.data()))
  return works.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
}

export function subscribeWorks(cb: (works: Work[]) => void) {
  const q = query(collection(db, 'works'), limit(50))
  return onSnapshot(q, (snap) => {
    const works = snap.docs.map((d) => docToWork(d.id, d.data()))
    works.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
    cb(works)
  })
}

export async function fetchWork(id: string): Promise<Work | null> {
  const snap = await getDoc(doc(db, 'works', id))
  if (!snap.exists()) return null
  return docToWork(snap.id, snap.data())
}

export async function searchWorks(query_: string): Promise<Work[]> {
  const snap = await getDocs(collection(db, 'works'))
  const lower = query_.toLowerCase()
  return snap.docs
    .map((d) => docToWork(d.id, d.data()))
    .filter((w) => w.title.toLowerCase().includes(lower))
}

export async function fetchWorksByAuthor(authorId: string): Promise<Work[]> {
  const q = query(collection(db, 'works'), where('authorId', '==', authorId))
  const snap = await getDocs(q)
  const works = snap.docs.map((d) => docToWork(d.id, d.data()))
  return works.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
}

export async function createWork(data: {
  title: string
  summary?: string
  coverImageUrl?: string
  authorId: string
  authorName: string
}): Promise<string> {
  const ref_ = await addDoc(collection(db, 'works'), {
    ...data,
    viewCount: 0,
    likeCount: 0,
    createdAt: serverTimestamp(),
  })
  return ref_.id
}

export async function updateWork(
  id: string,
  data: Partial<{ title: string; summary: string; coverImageUrl: string }>
) {
  await updateDoc(doc(db, 'works', id), data)
}

export async function deleteWork(id: string) {
  await deleteDoc(doc(db, 'works', id))
}

export async function incrementViewCount(workId: string, userId: string) {
  const viewRef = doc(db, 'views', `${workId}_${userId}`)
  const snap = await getDoc(viewRef)
  if (snap.exists()) return
  await setDoc(viewRef, { workId, userId, createdAt: serverTimestamp() })
  await updateDoc(doc(db, 'works', workId), { viewCount: increment(1) })
}

// ---- Episodes ----

export async function fetchEpisodes(workId: string): Promise<Episode[]> {
  const q = query(collection(db, 'episodes'), where('workId', '==', workId))
  const snap = await getDocs(q)
  const episodes = snap.docs.map((d) => docToEpisode(d.id, d.data()))
  return episodes.sort((a, b) => a.episodeNumber - b.episodeNumber)
}

export async function fetchEpisode(id: string): Promise<Episode | null> {
  const snap = await getDoc(doc(db, 'episodes', id))
  if (!snap.exists()) return null
  return docToEpisode(snap.id, snap.data())
}

export async function createEpisode(data: {
  workId: string
  title: string
  content: string
  topImages: string[]
  bottomImages: string[]
  episodeNumber: number
}): Promise<string> {
  const ref_ = await addDoc(collection(db, 'episodes'), {
    ...data,
    likeCount: 0,
    commentCount: 0,
    createdAt: serverTimestamp(),
  })
  return ref_.id
}

export async function updateEpisode(
  id: string,
  data: Partial<{ title: string; content: string; topImages: string[]; bottomImages: string[] }>
) {
  await updateDoc(doc(db, 'episodes', id), data)
}

export async function deleteEpisode(id: string) {
  await deleteDoc(doc(db, 'episodes', id))
}

// ---- Likes ----

export async function toggleEpisodeLike(episodeId: string, userId: string): Promise<boolean> {
  const likeRef = doc(db, 'episodeLikes', `${episodeId}_${userId}`)
  const snap = await getDoc(likeRef)
  if (snap.exists()) {
    await deleteDoc(likeRef)
    await updateDoc(doc(db, 'episodes', episodeId), { likeCount: increment(-1) })
    return false
  } else {
    await setDoc(likeRef, { episodeId, userId, createdAt: serverTimestamp() })
    await updateDoc(doc(db, 'episodes', episodeId), { likeCount: increment(1) })
    return true
  }
}

export async function isEpisodeLiked(episodeId: string, userId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'episodeLikes', `${episodeId}_${userId}`))
  return snap.exists()
}

export async function fetchLikedWorks(userId: string): Promise<Work[]> {
  const q = query(collection(db, 'episodeLikes'), where('userId', '==', userId))
  const snap = await getDocs(q)
  const episodeIds = snap.docs.map((d) => d.data().episodeId as string)
  if (episodeIds.length === 0) return []

  const workIdSet = new Set<string>()
  await Promise.all(
    episodeIds.map(async (eid) => {
      const ep = await fetchEpisode(eid)
      if (ep) workIdSet.add(ep.workId)
    })
  )

  const works = await Promise.all([...workIdSet].map((wid) => fetchWork(wid)))
  return works.filter(Boolean) as Work[]
}

// ---- Comments ----

export function subscribeComments(episodeId: string, cb: (comments: Comment[]) => void) {
  const q = query(collection(db, 'comments'), where('episodeId', '==', episodeId))
  return onSnapshot(q, (snap) => {
    const comments = snap.docs.map((d) => docToComment(d.id, d.data()))
    comments.sort((a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0))
    cb(comments)
  })
}

export async function addComment(data: {
  episodeId: string
  userId: string
  userName: string
  userProfileImageUrl?: string
  content: string
}) {
  await addDoc(collection(db, 'comments'), { ...data, createdAt: serverTimestamp() })
  await updateDoc(doc(db, 'episodes', data.episodeId), { commentCount: increment(1) })
}

export async function deleteComment(commentId: string, episodeId: string) {
  await deleteDoc(doc(db, 'comments', commentId))
  await updateDoc(doc(db, 'episodes', episodeId), { commentCount: increment(-1) })
}

// ---- Users ----

export async function fetchUser(id: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', id))
  if (!snap.exists()) return null
  return docToUser(snap.id, snap.data())
}

export async function createOrUpdateUser(user: {
  id: string
  userId: string
  displayName?: string
  email?: string
  profileImageUrl?: string
  bio?: string
}) {
  const ref_ = doc(db, 'users', user.id)
  const snap = await getDoc(ref_)
  if (!snap.exists()) {
    await setDoc(ref_, { ...user, createdAt: serverTimestamp() })
  } else {
    const updates: Record<string, unknown> = {}
    if (user.displayName !== undefined) updates.displayName = user.displayName
    if (user.profileImageUrl !== undefined) updates.profileImageUrl = user.profileImageUrl
    if (user.bio !== undefined) updates.bio = user.bio
    if (Object.keys(updates).length > 0) await updateDoc(ref_, updates)
  }
}

// ---- Follows ----

export async function toggleFollow(followerId: string, followingId: string): Promise<boolean> {
  const followRef = doc(db, 'follows', `${followerId}_${followingId}`)
  const snap = await getDoc(followRef)
  if (snap.exists()) {
    await deleteDoc(followRef)
    return false
  } else {
    await setDoc(followRef, { followerId, followingId, createdAt: serverTimestamp() })
    return true
  }
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'follows', `${followerId}_${followingId}`))
  return snap.exists()
}

export async function getFollowCounts(
  userId: string
): Promise<{ followers: number; following: number }> {
  const [followersSnap, followingSnap] = await Promise.all([
    getDocs(query(collection(db, 'follows'), where('followingId', '==', userId))),
    getDocs(query(collection(db, 'follows'), where('followerId', '==', userId))),
  ])
  return { followers: followersSnap.size, following: followingSnap.size }
}

// ---- Drafts ----

export async function fetchDrafts(userId: string): Promise<Draft[]> {
  const q = query(collection(db, 'drafts'), where('userId', '==', userId))
  const snap = await getDocs(q)
  const drafts = snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      userId: data.userId,
      draftType: data.draftType,
      workId: data.workId,
      episodeContent: data.episodeContent ?? '',
      topImages: data.topImages ?? [],
      bottomImages: data.bottomImages ?? [],
      workTitle: data.workTitle,
      workSummary: data.workSummary,
      episodeTitle: data.episodeTitle ?? '',
      coverImageUrl: data.coverImageUrl,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    } as Draft
  })
  return drafts.sort((a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0))
}

export async function saveDraft(draft: Omit<Draft, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref_ = await addDoc(collection(db, 'drafts'), {
    ...draft,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref_.id
}

export async function updateDraft(id: string, data: Partial<Draft>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { createdAt, updatedAt, ...rest } = data
  await updateDoc(doc(db, 'drafts', id), { ...rest, updatedAt: serverTimestamp() })
}

export async function deleteDraft(id: string) {
  await deleteDoc(doc(db, 'drafts', id))
}

// ---- Storage ----

export async function uploadImage(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}
