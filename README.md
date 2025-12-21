# 🎮 AlgoPlayground

An interactive educational platform for learning data structures and algorithms through visualization and hands-on practice.

## ✨ Features

- **Interactive Visualizations**: Watch algorithms come to life with step-by-step animations
- **Comprehensive Coverage**: Sorting, searching, graph, tree, and linear data structure algorithms
- **Pre & Post Testing**: Measure understanding before and after practice
- **Session Persistence**: Resume where you left off
- **Progress Tracking**: Track completion and scores across all algorithms
- **Drag & Drop Questions**: Interactive test questions for engaging assessment

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Visualization**: React Flow
- **Drag & Drop**: @dnd-kit
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Authentication**: Supabase Auth (Google OAuth)

## 📁 Project Structure

```
algoplayground/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/              # Authentication pages
│   │   ├── playground/[slug]/ # Algorithm playground
│   │   ├── api/               # API routes
│   │   └── page.tsx           # Home page
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   ├── visualizers/       # Algorithm visualizers
│   │   ├── playground/        # Playground components
│   │   ├── test/              # Test/quiz components
│   │   └── layout/            # Layout components
│   ├── algorithms/            # Algorithm implementations
│   │   ├── sorting/
│   │   ├── searching/
│   │   ├── graph/
│   │   ├── tree/
│   │   └── linear/
│   ├── stores/                # Zustand state stores
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   │   ├── supabase/          # Supabase client
│   │   ├── prisma.ts          # Prisma client
│   │   └── utils.ts           # Utility functions
│   ├── types/                 # TypeScript definitions
│   └── data/                  # Static data (algorithm metadata)
├── prisma/
│   └── schema.prisma          # Database schema
└── public/                    # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works)
- Google Cloud Console account (for OAuth)

### 1. Clone and Install

```bash
git clone <repository-url>
cd algoplayground
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings > API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Go to **Project Settings > Database** and copy:
   - Connection string (pooler) → `DATABASE_URL`
   - Direct connection → `DIRECT_URL`

### 3. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable the Google+ API
4. Go to **Credentials > Create Credentials > OAuth Client ID**
5. Configure consent screen
6. Create Web application credentials
7. Add authorized redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
8. Copy Client ID and Client Secret
9. In Supabase, go to **Authentication > Providers > Google**
10. Enable and paste your Google credentials

### 4. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
```

### 5. Set Up Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed with sample data
npm run db:seed
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed database |

## 🎯 Algorithms Covered

### Sorting
- Bubble Sort
- Selection Sort
- Insertion Sort
- Merge Sort

### Searching
- Linear Search
- Binary Search

### Graph
- Breadth-First Search (BFS)
- Depth-First Search (DFS)
- Dijkstra's Algorithm
- Bellman-Ford Algorithm
- Prim's Algorithm
- Kruskal's Algorithm

### Tree
- Binary Search Tree (BST)
- AVL Tree
- Min Heap
- Max Heap
- Tree Traversals (Inorder, Preorder, Postorder)

### Linear Structures
- Singly Linked List
- Doubly Linked List
- Stack
- Queue

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [React Flow](https://reactflow.dev/) for graph visualization
- [Framer Motion](https://www.framer.com/motion/) for animations
- [dnd-kit](https://dndkit.com/) for drag and drop
- [Supabase](https://supabase.com/) for backend services
