import {
  users,
  posts,
  likes,
  comments,
  reports,
  type User,
  type UpsertUser,
  type Post,
  type InsertPost,
  type Like,
  type Comment,
  type InsertComment,
  type Report,
  type InsertReport,
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Post operations
  createPost(authorId: string, post: InsertPost): Promise<Post>;
  getPosts(): Promise<(Post & { author: User; isLiked?: boolean })[]>;
  getUserPosts(userId: string): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;
  deletePost(id: number): Promise<void>;
  
  // Like operations
  likePost(userId: string, postId: number): Promise<Like>;
  unlikePost(userId: string, postId: number): Promise<void>;
  isPostLiked(userId: string, postId: number): Promise<boolean>;
  
  // Comment operations
  createComment(userId: string, comment: InsertComment): Promise<Comment>;
  getPostComments(postId: number): Promise<(Comment & { author: User })[]>;
  
  // Report operations
  createReport(reporterId: string, report: InsertReport): Promise<Report>;
  getReports(): Promise<(Report & { reporter: User; post: Post })[]>;
  resolveReport(id: number, status: string): Promise<void>;
  
  // Admin operations
  getUsersCount(): Promise<number>;
  getPostsCount(): Promise<number>;
  getReportsCount(): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private posts: Map<number, Post>;
  private likes: Map<string, Like>;
  private comments: Map<number, Comment>;
  private reports: Map<number, Report>;
  private currentPostId: number;
  private currentCommentId: number;
  private currentReportId: number;
  private currentLikeId: number;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.likes = new Map();
    this.comments = new Map();
    this.reports = new Map();
    this.currentPostId = 1;
    this.currentCommentId = 1;
    this.currentReportId = 1;
    this.currentLikeId = 1;
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    const user: User = {
      id: userData.id!,
      role: userData.role ?? null,
      email: userData.email ?? null,
      firstName: userData.firstName ?? null,
      lastName: userData.lastName ?? null,
      profileImageUrl: userData.profileImageUrl ?? null,
      grade: userData.grade ?? null,
      school: userData.school ?? null,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userData.id!, user);
    return user;
  }

  // Post operations
  async createPost(authorId: string, postData: InsertPost): Promise<Post> {
    const id = this.currentPostId++;
    const post: Post = {
      id,
      authorId,
      content: postData.content,
      type: postData.type,
      subject: postData.subject ?? null,
      attachments: postData.attachments ?? null,
      privacy: postData.privacy ?? null,
      likesCount: 0,
      commentsCount: 0,
      isReported: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.posts.set(id, post);
    return post;
  }

  async getPosts(): Promise<(Post & { author: User; isLiked?: boolean })[]> {
    const postsArray = Array.from(this.posts.values())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
    
    const postsWithAuthors = [];
    for (const post of postsArray) {
      const author = this.users.get(post.authorId);
      if (author) {
        postsWithAuthors.push({ ...post, author });
      }
    }
    return postsWithAuthors;
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.authorId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async deletePost(id: number): Promise<void> {
    this.posts.delete(id);
  }

  // Like operations
  async likePost(userId: string, postId: number): Promise<Like> {
    const likeKey = `${userId}-${postId}`;
    if (this.likes.has(likeKey)) {
      return this.likes.get(likeKey)!;
    }

    const like: Like = {
      id: this.currentLikeId++,
      userId,
      postId,
      createdAt: new Date(),
    };
    this.likes.set(likeKey, like);

    // Update post likes count
    const post = this.posts.get(postId);
    if (post) {
      post.likesCount = (post.likesCount || 0) + 1;
      this.posts.set(postId, post);
    }

    return like;
  }

  async unlikePost(userId: string, postId: number): Promise<void> {
    const likeKey = `${userId}-${postId}`;
    if (this.likes.has(likeKey)) {
      this.likes.delete(likeKey);

      // Update post likes count
      const post = this.posts.get(postId);
      if (post) {
        post.likesCount = Math.max(0, (post.likesCount || 0) - 1);
        this.posts.set(postId, post);
      }
    }
  }

  async isPostLiked(userId: string, postId: number): Promise<boolean> {
    const likeKey = `${userId}-${postId}`;
    return this.likes.has(likeKey);
  }

  // Comment operations
  async createComment(userId: string, commentData: InsertComment): Promise<Comment> {
    const id = this.currentCommentId++;
    const comment: Comment = {
      ...commentData,
      id,
      userId,
      createdAt: new Date(),
    };
    this.comments.set(id, comment);

    // Update post comments count
    const post = this.posts.get(commentData.postId);
    if (post) {
      post.commentsCount = (post.commentsCount || 0) + 1;
      this.posts.set(commentData.postId, post);
    }

    return comment;
  }

  async getPostComments(postId: number): Promise<(Comment & { author: User })[]> {
    const postComments = Array.from(this.comments.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
    
    const commentsWithAuthors = [];
    for (const comment of postComments) {
      const author = this.users.get(comment.userId);
      if (author) {
        commentsWithAuthors.push({ ...comment, author });
      }
    }
    return commentsWithAuthors;
  }

  // Report operations
  async createReport(reporterId: string, reportData: InsertReport): Promise<Report> {
    const id = this.currentReportId++;
    const report: Report = {
      ...reportData,
      id,
      reporterId,
      status: "pending",
      createdAt: new Date(),
    };
    this.reports.set(id, report);

    // Mark post as reported
    const post = this.posts.get(reportData.postId);
    if (post) {
      post.isReported = true;
      this.posts.set(reportData.postId, post);
    }

    return report;
  }

  async getReports(): Promise<(Report & { reporter: User; post: Post })[]> {
    const reportsArray = Array.from(this.reports.values())
      .filter(report => report.status === "pending")
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
    
    const reportsWithDetails = [];
    for (const report of reportsArray) {
      const reporter = this.users.get(report.reporterId);
      const post = this.posts.get(report.postId);
      if (reporter && post) {
        reportsWithDetails.push({ ...report, reporter, post });
      }
    }
    return reportsWithDetails;
  }

  async resolveReport(id: number, status: string): Promise<void> {
    const report = this.reports.get(id);
    if (report) {
      report.status = status;
      this.reports.set(id, report);
    }
  }

  // Admin operations
  async getUsersCount(): Promise<number> {
    return this.users.size;
  }

  async getPostsCount(): Promise<number> {
    return this.posts.size;
  }

  async getReportsCount(): Promise<number> {
    return Array.from(this.reports.values()).filter(r => r.status === "pending").length;
  }
}

export const storage = new MemStorage();
