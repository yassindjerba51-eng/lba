1. Product Requirements Document (PRD)
   Project Overview
   A professional, multilingual (FR, EN, AR) fullstack website for a law firm. The system includes a public-facing dynamic site and a private administrative dashboard to manage content, appointments, and news.

Core Tech Stack
Framework: Next.js 14+ (App Router)

Styling: Tailwind CSS + shadcn/ui

Database: MySQL via Prisma ORM

Auth: Auth.js (NextAuth) for /webadmin/ access

i18n: next-intl or middleware-based routing for FR, EN, AR (RTL support)

Site Map & Features
Public Pages:

Accueil: Hero section, USP, latest news snippet.

Le Cabinet: History, values, and team.

Compétences: Practice areas.

Services: (7 distinct sub-services as listed in the menu).

Actualités: Blog/News feed with category filtering.

Contact: Lead generation form with email integration.

Prendre rendez-vous: Booking system integrated with the DB.

Admin Dashboard (/webadmin/):

Content Management (CMS): CRUD for Services, Practice Areas, and News.

Lead Management: View/Manage contact form submissions.

Appointment Manager: View and status-track (Pending/Confirmed) appointments.

Translation Manager: Interface to edit text strings for the 3 languages.

Key Functional Requirements
RTL Support: The layout must flip automatically when the Arabic language is selected.

Dynamic Metadata: SEO-optimized titles and descriptions for every page and news post.

Performance: Server-side rendering (SSR) for news and services to ensure SEO indexing.
