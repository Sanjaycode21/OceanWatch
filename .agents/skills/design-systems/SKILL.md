---
name: design-systems
description: Guidelines, references, and best practices for creating consistent, high-impact user interfaces using modern design system principles.
---

# Design Systems Guide

This skill provides behavioral constraints and references for building stunning, premium web and mobile UIs inspired by industry-leading design systems (e.g., Atlassian Design System, IBM Carbon, primers, Google Material Design).

## Core Principles

### 1. Unified Grid & Spatial Systems
*   **Spacing Scale**: Use a strict 4px/8px incremental spatial scale (e.g., `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`) for margins, padding, and layout bounds.
*   **Grid Layouts**: Align content cards to clean column structures (12 columns on desktops, 4 columns on mobile).

### 2. High-Impact Color Harmonies
*   **Contrast Bounds**: Maintain high contrast accessibility (minimum WCAG AA ratings).
*   **Premium Dark Modes**: Build deep background layers using dark blue/slate tones (e.g., `#070A10`, `#0E1422`) instead of generic pitch black (`#000`).
*   **System Indicators**: Use structured semantic color ranges:
    *   **Primary**: Deep Blue / Vivid Cyan (`#3B82F6`)
    *   **Error**: Coral Red (`#EF4444`)
    *   **Success**: Forest Green (`#10B981`)
    *   **Warning**: Golden Amber (`#F59E0B`)

### 3. Glassmorphism & Depth
*   Use subtle borders (`1px border border-[#1F2E4D]`) and translucent background blurs (`backdrop-filter backdrop-blur-md bg-opacity-30`) to represent overlay depths and floating panels.

### 4. Interactive Micro-Animations
*   Always include smooth transitions (`transition-all duration-300`) on hovers, card selections, form submissions, and active navigation indicators.
*   Incorporate pulsing animations for alarms, indicators, and distress beacons to draw operator focus without distracting.

### 5. Semantic Typography
*   Never use browser default fonts. Maintain clean sans-serif/monospace font scales (e.g., Inter, Outfit, Roboto Mono).
*   Utilize distinct weight metrics: `Bold (700)` for section headers, `Medium (500)` for secondary triggers, and `Regular (400)` for body data logs.
