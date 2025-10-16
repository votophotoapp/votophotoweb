# VotoPhoto

## 🚀 Check it out

**[Visit VotoPhoto.com](https://www.votophoto.com)** - Experience the live application deployed on Vercel!

---

## Overview

VotoPhoto is a simple yet powerful photo contest application that allows users to participate in photography competitions, submit their entries, and vote on submissions. Built with modern web technologies, it provides a seamless experience for both contest organizers and participants.

## Features

### 🔐 Authentication & User Management

- Secure user registration and login
- Google OAuth integration with One-Tap sign-in
- Protected routes and middleware

### 📸 Photo Contest Platform

- Browse and participate in photo contests
- Submit photo entries (coming soon)
- Vote on contest submissions (coming soon)
- Real-time contest updates

### 🎨 Modern UI/UX

- Responsive design built with [Tailwind CSS](https://tailwindcss.com)
- Beautiful components powered by [shadcn/ui](https://ui.shadcn.com/)
- Mobile-first approach

### ⚡ Performance & Scalability

- Built on [Next.js 15](https://nextjs.org) with App Router
- Server-side rendering and static generation
- Turbopack for fast development builds
- Optimized for production deployment

## Architecture

### Tech Stack

- **Frontend**: Next.js 15 (React 19) with TypeScript
- **Backend**: Supabase (PostgreSQL database, Authentication, Real-time subscriptions)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Deployment**: Vercel → [www.votophoto.com](https://www.votophoto.com)

### Database Schema

The application uses Supabase PostgreSQL with the following key tables:

- `contest` - Photo contest information
- User profiles and authentication (managed by Supabase Auth)
- Photo submissions (planned)
- Voting records (planned)
