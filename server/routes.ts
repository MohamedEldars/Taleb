import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { insertPostSchema, insertCommentSchema, insertReportSchema } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
    }
  },
});

// Mock authentication middleware for development
const mockAuth = (req: any, res: any, next: any) => {
  // Mock user for development
  req.user = {
    claims: {
      sub: "student-1",
      email: "student@example.com",
      first_name: "أحمد",
      last_name: "محمد",
      profile_image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
    }
  };
  next();
};

// Mock admin middleware
const mockAdminAuth = (req: any, res: any, next: any) => {
  req.user = {
    claims: {
      sub: "admin-1",
      email: "admin@school.edu",
      first_name: "إدارة",
      last_name: "المدرسة",
      profile_image_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
    }
  };
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Initialize mock users
  await storage.upsertUser({
    id: "student-1",
    email: "student@example.com",
    firstName: "أحمد",
    lastName: "محمد",
    profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
    grade: "الصف الحادي عشر - علمي",
    school: "مدرسة الشارقة الثانوية",
    role: "student"
  });

  await storage.upsertUser({
    id: "admin-1",
    email: "admin@school.edu",
    firstName: "إدارة",
    lastName: "المدرسة",
    profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
    role: "admin"
  });

  // Auth routes (mock for development)
  app.get('/api/auth/user', mockAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get('/api/login', (req, res) => {
    res.redirect('/');
  });

  app.get('/api/logout', (req, res) => {
    res.redirect('/');
  });

  // Post routes
  app.get('/api/posts', mockAuth, async (req: any, res) => {
    try {
      const posts = await storage.getPosts();
      const userId = req.user.claims.sub;
      
      // Add isLiked status for each post
      const postsWithLikeStatus = await Promise.all(
        posts.map(async (post) => ({
          ...post,
          isLiked: await storage.isPostLiked(userId, post.id),
        }))
      );
      
      res.json(postsWithLikeStatus);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.post('/api/posts', mockAuth, upload.array('attachments', 5), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postData = insertPostSchema.parse(req.body);
      
      // Process uploaded files
      const attachments = req.files ? req.files.map((file: any) => file.filename) : [];
      
      const post = await storage.createPost(userId, {
        ...postData,
        attachments,
      });
      
      res.json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.get('/api/posts/user/:userId', mockAuth, async (req, res) => {
    try {
      const posts = await storage.getUserPosts(req.params.userId);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      res.status(500).json({ message: "Failed to fetch user posts" });
    }
  });

  app.delete('/api/posts/:id', mockAuth, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPost(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Allow deletion if user is author or admin
      if (post.authorId !== userId && user?.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to delete this post" });
      }
      
      await storage.deletePost(postId);
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Like routes
  app.post('/api/posts/:id/like', mockAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = parseInt(req.params.id);
      
      const isLiked = await storage.isPostLiked(userId, postId);
      
      if (isLiked) {
        await storage.unlikePost(userId, postId);
        res.json({ liked: false });
      } else {
        await storage.likePost(userId, postId);
        res.json({ liked: true });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  // Comment routes
  app.get('/api/posts/:id/comments', mockAuth, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getPostComments(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/posts/:id/comments', mockAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = parseInt(req.params.id);
      const commentData = insertCommentSchema.parse({
        ...req.body,
        postId,
      });
      
      const comment = await storage.createComment(userId, commentData);
      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Report routes
  app.post('/api/posts/:id/report', mockAuth, async (req: any, res) => {
    try {
      const reporterId = req.user.claims.sub;
      const postId = parseInt(req.params.id);
      const reportData = insertReportSchema.parse({
        ...req.body,
        postId,
      });
      
      const report = await storage.createReport(reporterId, reportData);
      res.json(report);
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  // Admin routes
  app.get('/api/admin/reports', mockAdminAuth, async (req, res) => {
    try {
      const reports = await storage.getReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.patch('/api/admin/reports/:id', mockAdminAuth, async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      const { status } = req.body;
      
      await storage.resolveReport(reportId, status);
      res.json({ message: "Report resolved successfully" });
    } catch (error) {
      console.error("Error resolving report:", error);
      res.status(500).json({ message: "Failed to resolve report" });
    }
  });

  app.get('/api/admin/stats', mockAdminAuth, async (req, res) => {
    try {
      const stats = {
        totalStudents: await storage.getUsersCount(),
        totalPosts: await storage.getPostsCount(),
        reportedPosts: await storage.getReportsCount(),
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
