export interface User {
  id: string
  userId: string
  displayName?: string
  email?: string
  profileImageUrl?: string
  bio?: string
  createdAt?: Date
}

export interface Work {
  id: string
  title: string
  summary?: string
  coverImageUrl?: string
  authorId: string
  authorName: string
  createdAt?: Date
  viewCount: number
  likeCount: number
}

export interface Episode {
  id: string
  workId: string
  title: string
  content: string
  topImages: string[]
  bottomImages: string[]
  episodeNumber: number
  likeCount: number
  commentCount: number
  createdAt?: Date
}

export interface Comment {
  id: string
  episodeId: string
  userId: string
  userName: string
  userProfileImageUrl?: string
  content: string
  createdAt?: Date
}

export interface Draft {
  id: string
  userId: string
  draftType: 'newWork' | 'episode'
  workId?: string
  episodeContent: string
  topImages: string[]
  bottomImages: string[]
  workTitle?: string
  workSummary?: string
  episodeTitle: string
  coverImageUrl?: string
  createdAt?: Date
  updatedAt?: Date
}
