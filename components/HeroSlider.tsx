"use client";

import { useState, useEffect, useCallback } from "react";

interface SliderCta {
  title: Record<string, string>;
  subtitle: Record<string, string>;
  buttonA: { text: Record<string, string>; href: string; target: string };
  buttonB: { text: Record<string, string>; href: string; target: string };
}

interface HeroSliderProps {
  slides: { id: string; image: string }[];
  cta: SliderCta;
  locale: string;
  heroMode?: "slideshow" | "video";
  heroVideo?: string | null;
}

export default function HeroSlider({ slides, cta, locale, heroMode = "slideshow", heroVideo }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (heroMode !== "slideshow" || slides.length <= 1) return;
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [next, slides.length, heroMode]);

  const title = cta.title[locale] || cta.title.fr || "";
  const subtitle = cta.subtitle[locale] || cta.subtitle.fr || "";
  const btnAText = cta.buttonA.text[locale] || cta.buttonA.text.fr || "";
  const btnBText = cta.buttonB.text[locale] || cta.buttonB.text.fr || "";

  const isVideo = heroMode === "video" && heroVideo;
  const hasSlides = heroMode === "slideshow" && slides.length > 0;

  if (!isVideo && !hasSlides) return null;

  return (
    <section className="hero-slider" dir={locale === "ar" ? "rtl" : "ltr"}>
      {/* Background */}
      <div className="hero-slider__track">
        {isVideo ? (
          <video
            src={heroVideo!}
            className="hero-slider__video"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`hero-slider__slide ${index === current ? "hero-slider__slide--active" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={slide.image} alt="" className="hero-slider__img" />
            </div>
          ))
        )}
      </div>

      {/* Dark overlay */}
      <div className="hero-slider__overlay" />

      {/* CTA block */}
      {(title || subtitle || btnAText || btnBText) && (
        <div className="hero-slider__cta">
          {title && <h1 className="hero-slider__title">{title}</h1>}
          {subtitle && <span className="hero-slider__subtitle">{subtitle}</span>}
          {(btnAText || btnBText) && (
            <div className="hero-slider__buttons">
              {btnAText && cta.buttonA.href && (
                <a
                  href={cta.buttonA.href}
                  target={cta.buttonA.target || "_self"}
                  rel={cta.buttonA.target === "_blank" ? "noopener noreferrer" : undefined}
                  className="hero-slider__btn hero-slider__btn--primary"
                >
                  {btnAText}
                </a>
              )}
              {btnBText && cta.buttonB.href && (
                <a
                  href={cta.buttonB.href}
                  target={cta.buttonB.target || "_self"}
                  rel={cta.buttonB.target === "_blank" ? "noopener noreferrer" : undefined}
                  className="hero-slider__btn hero-slider__btn--secondary"
                >
                  {btnBText}
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Dots navigation (slideshow only) */}
      {heroMode === "slideshow" && slides.length > 1 && (
        <div className="hero-slider__dots">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`hero-slider__dot ${index === current ? "hero-slider__dot--active" : ""}`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        .hero-slider {
          position: relative;
          width: 100%;
          height: 700px;
          max-height: 700px;
          overflow: hidden;
          background: #0a0a0a;
          margin-top: -88px;
        }
        .hero-slider__track {
          position: relative;
          width: 100%;
          height: 100%;
        }
        .hero-slider__slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 1s ease-in-out;
        }
        .hero-slider__slide--active {
          opacity: 1;
        }
        .hero-slider__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .hero-slider__video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .hero-slider__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.3) 0%,
            rgba(0, 0, 0, 0.55) 100%
          );
          pointer-events: none;
        }
        .hero-slider__cta {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem;
          z-index: 10;
        }
        .hero-slider__title {
          font-size: clamp(2rem, 5vw, 4rem);
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          margin: 0 0 0.75rem 0;
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
          max-width: 900px;
          letter-spacing: -0.02em;
        }
        .hero-slider__subtitle {
          font-size: clamp(1rem, 2.5vw, 1.5rem);
          color: rgba(255, 255, 255, 0.85);
          margin-bottom: 2.5rem;
          text-shadow: 0 1px 10px rgba(0, 0, 0, 0.4);
          max-width: 650px;
          line-height: 1.5;
          font-weight: 300;
        }
        .hero-slider__buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        .hero-slider__btn {
          display: inline-flex;
          align-items: center;
          padding: 0.85rem 2.5rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 9999px;
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
          letter-spacing: 0.02em;
        }
        .hero-slider__btn--primary {
          background: var(--primary, #c8a55a);
          color: #fff;
          border: 2px solid var(--primary, #c8a55a);
          box-shadow: 0 4px 20px rgba(200, 165, 90, 0.3);
        }
        .hero-slider__btn--primary:hover {
          background: transparent;
          color: #fff;
          border-color: #fff;
          box-shadow: 0 4px 20px rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }
        .hero-slider__btn--secondary {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          border: 2px solid rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(8px);
        }
        .hero-slider__btn--secondary:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: #fff;
          transform: translateY(-2px);
        }
        .hero-slider__dots {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 0.5rem;
          z-index: 20;
        }
        .hero-slider__dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.7);
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
        }
        .hero-slider__dot--active {
          background: #fff;
          border-color: #fff;
          transform: scale(1.3);
        }
        @media (max-width: 640px) {
          .hero-slider {
            height: 500px;
            max-height: 500px;
          }
          .hero-slider__btn {
            padding: 0.7rem 1.75rem;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </section>
  );
}
