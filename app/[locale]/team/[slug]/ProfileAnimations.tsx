"use client";

import { useEffect } from "react";

export default function ProfileAnimations() {
  useEffect(() => {
    // Intersection Observer for scroll-triggered animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    // Observe all profile sections and cards
    document.querySelectorAll(".profile-section, .profile-card").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <style>{`
      /* ─── Entry Animations ─── */
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes slideUpDelayed {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .animate-fade-in {
        animation: fadeIn 0.6s ease-out both;
      }

      .animate-slide-up {
        animation: slideUp 0.7s ease-out both;
        animation-delay: 0.1s;
      }

      .animate-slide-up-delayed {
        animation: slideUpDelayed 0.7s ease-out both;
        animation-delay: 0.3s;
      }

      /* ─── Scroll-triggered Animations ─── */
      .profile-section,
      .profile-card {
        opacity: 0;
        transform: translateY(24px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
      }

      .profile-section.is-visible,
      .profile-card.is-visible {
        opacity: 1;
        transform: translateY(0);
      }

      /* Stagger animation for cards */
      .profile-card:nth-child(2) {
        transition-delay: 0.1s;
      }
      .profile-card:nth-child(3) {
        transition-delay: 0.2s;
      }

      /* ─── Safe Area for Mobile CTA ─── */
      .safe-area-bottom {
        padding-bottom: max(12px, env(safe-area-inset-bottom));
      }

      /* Add bottom padding to main content to account for sticky CTA on mobile */
      @media (max-width: 1023px) {
        main {
          padding-bottom: 72px;
        }
      }

      /* ─── Prose refinements ─── */
      .prose p {
        margin-bottom: 1.25em;
      }

      .prose h2 {
        margin-top: 2em;
        margin-bottom: 0.75em;
      }

      .prose h3 {
        margin-top: 1.5em;
        margin-bottom: 0.5em;
      }

      .prose ul, .prose ol {
        margin-bottom: 1.25em;
      }

      .prose li {
        margin-bottom: 0.25em;
      }


    `}</style>
  );
}
