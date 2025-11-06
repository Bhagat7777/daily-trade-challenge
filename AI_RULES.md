# AI Development Rules

This document provides guidelines for the AI assistant to follow when developing and modifying this application. The goal is to maintain code quality, consistency, and adherence to the chosen technology stack.

## Tech Stack

This project is built with a modern, component-based architecture. The key technologies are:

- **Framework**: React (with TypeScript) for building the user interface.
- **Build Tool**: Vite for fast development and optimized builds.
- **Styling**: Tailwind CSS for a utility-first styling approach.
- **UI Components**: shadcn/ui, a collection of reusable components built on Radix UI and Tailwind CSS.
- **Routing**: React Router (`react-router-dom`) for client-side navigation.
- **Backend & Database**: Supabase for authentication, database, and storage.
- **Data Fetching**: TanStack Query (React Query) for managing server state, caching, and data synchronization.
- **Forms**: React Hook Form with Zod for robust and type-safe form handling and validation.
- **Icons**: Lucide React for a comprehensive and consistent set of icons.
- **Notifications**: Sonner for clean and simple toast notifications.

## Library Usage Guidelines

To ensure consistency, please adhere to the following rules when implementing new features or making changes.

### 1. UI Components & Styling
- **Primary UI Library**: **ALWAYS** use `shadcn/ui` components for all UI elements (Buttons, Cards, Forms, Dialogs, etc.). Import them from `@/components/ui/...`.
- **Styling**: **ONLY** use Tailwind CSS utility classes for styling. Do not write custom CSS in `.css` files unless it's for a complex, non-reusable animation or a global style definition in `index.css`.
- **Icons**: **EXCLUSIVELY** use icons from the `lucide-react` library.

### 2. State Management
- **Server State**: For any data fetched from or mutated in Supabase, **ALWAYS** use TanStack Query (`useQuery`, `useMutation`). This handles caching, refetching, and loading/error states.
- **Global Client State**: For client-side state that needs to be shared across many components (like user authentication), use React Context. The existing `AuthContext` is the template to follow.
- **Local Component State**: For state that is confined to a single component, use React's built-in `useState` and `useReducer` hooks.

### 3. Routing
- **Navigation**: All client-side routing **MUST** be handled by `react-router-dom`.
- **Route Definitions**: All routes should be defined within the `src/App.tsx` file to maintain a single source of truth for navigation.

### 4. Forms
- **Form Logic**: **ALWAYS** use `react-hook-form` for building forms.
- **Validation**: **ALWAYS** use `zod` to define validation schemas for forms.

### 5. Backend Interaction
- **Supabase Client**: All interactions with the backend (database, auth, storage) **MUST** go through the pre-configured Supabase client, imported from `@/integrations/supabase/client`.

### 6. Notifications
- **Toasts**: For user feedback (e.g., success messages, errors), use the `sonner` library, which is integrated as `<Sonner />` in `App.tsx`.

### 7. Code Structure
- **Pages**: Components that represent a full page/route should be placed in `src/pages/`.
- **Reusable Components**: Smaller, reusable components should be placed in `src/components/`. Create sub-folders within `components` for organization (e.g., `src/components/auth`, `src/components/layout`).
- **Hooks**: Custom hooks should be placed in `src/hooks/`.
- **Contexts**: React contexts should be placed in `src/contexts/`.