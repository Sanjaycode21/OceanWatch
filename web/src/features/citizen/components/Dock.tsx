'use client';

import React, { Children, cloneElement, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

import './Dock.css';

interface DockItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  mouseX: any;
  spring: any;
  distance: number;
  magnification: number;
  baseItemSize: number;
  label: string;
  index: number;
  itemCoords: React.RefObject<number[]>;
}

function DockItem({
  children,
  className = '',
  onClick,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
  label,
  index,
  itemCoords
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const particleBoxRef = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);

  const noise = (n = 1) => n / 2 - Math.random() * n;

  const getXY = (distance: number, pointIndex: number, totalPoints: number) => {
    const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  };

  const triggerGooeyAnimation = () => {
    const box = particleBoxRef.current;
    if (!box) return;

    // Clean up existing particles
    const existing = box.querySelectorAll('.particle');
    existing.forEach(p => {
      try {
        box.removeChild(p);
      } catch (err) {}
    });

    const particleCount = 15;
    const animationTime = 600;
    const timeVariance = 300;
    const particleDistances: [number, number] = [90, 10];
    const particleR = 100;
    const colors = [1, 2, 3, 1, 2, 3, 1, 4];

    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(timeVariance * 2);
      const rotateValue = noise(particleR / 10);
      const start = getXY(particleDistances[0], particleCount - i, particleCount);
      const end = getXY(particleDistances[1] + noise(7), particleCount - i, particleCount);
      const scale = 1 + noise(0.2);
      const color = colors[Math.floor(Math.random() * colors.length)];
      const rot = rotateValue > 0 ? (rotateValue + particleR / 20) * 10 : (rotateValue - particleR / 20) * 10;

      setTimeout(() => {
        const particle = document.createElement('span');
        const point = document.createElement('span');
        particle.classList.add('particle');
        particle.style.setProperty('--start-x', `${start[0]}px`);
        particle.style.setProperty('--start-y', `${start[1]}px`);
        particle.style.setProperty('--end-x', `${end[0]}px`);
        particle.style.setProperty('--end-y', `${end[1]}px`);
        particle.style.setProperty('--time', `${t}ms`);
        particle.style.setProperty('--scale', `${scale}`);
        particle.style.setProperty('--color', `var(--color-${color}, white)`);
        particle.style.setProperty('--rotate', `${rot}deg`);

        point.classList.add('point');
        particle.appendChild(point);
        box.appendChild(particle);

        setTimeout(() => {
          try {
            box.removeChild(particle);
          } catch (err) {}
        }, t);
      }, 30);
    }
  };

  const handleItemClick = () => {
    triggerGooeyAnimation();
    onClick?.();
  };

  const mouseDistance = useTransform(mouseX, (val: number) => {
    // If we have cached coordinates from panel entry, use them to break layout shift feedback loops
    if (itemCoords.current && itemCoords.current[index] !== undefined) {
      return val - itemCoords.current[index];
    }
    
    // Fallback if mouse coordinate calculation falls outside active cached coordinates
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      left: 0,
      width: baseItemSize
    };
    const elementX = rect.left !== undefined ? rect.left : rect.x;
    return val - elementX - baseItemSize / 2;
  });

  const targetSize = useTransform(mouseDistance, [-distance, 0, distance], [baseItemSize, magnification, baseItemSize]);
  const size = useSpring(targetSize, spring);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleItemClick();
    }
  };

  return (
    <motion.div
      ref={ref}
      style={{
        width: size,
        height: size
      }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={handleItemClick}
      className={`dock-item ${className}`}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
      aria-label={label}
      onKeyDown={handleKeyDown}
    >
      <div className="gooey-particle-box" ref={particleBoxRef} />
      {Children.map(children, child => {
        if (React.isValidElement(child)) {
          return cloneElement(child as React.ReactElement<any>, { isHovered });
        }
        return child;
      })}
    </motion.div>
  );
}

interface DockLabelProps {
  children: React.ReactNode;
  className?: string;
  isHovered?: any;
}

function DockLabel({ children, className = '', ...rest }: DockLabelProps) {
  const { isHovered } = rest;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    const unsubscribe = isHovered.on('change', (latest: number) => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`dock-label ${className}`}
          role="tooltip"
          style={{ x: '-50%', left: '50%' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface DockIconProps {
  children: React.ReactNode;
  className?: string;
}

function DockIcon({ children, className = '' }: DockIconProps) {
  return <div className={`dock-icon ${className}`}>{children}</div>;
}

interface DockProps {
  items: Array<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    className?: string;
  }>;
  className?: string;
  spring?: { mass: number; stiffness: number; damping: number };
  magnification?: number;
  distance?: number;
  panelHeight?: number;
  dockHeight?: number;
  baseItemSize?: number;
}

export default function Dock({
  items,
  className = '',
  spring = { mass: 0.1, stiffness: 300, damping: 25 },
  magnification = 70,
  distance = 200,
  panelHeight = 68,
  dockHeight = 256,
  baseItemSize = 50
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);
  
  const panelRef = useRef<HTMLDivElement>(null);
  const itemCoords = useRef<number[]>([]);

  const maxHeight = useMemo(
    () => Math.max(dockHeight, magnification + magnification / 2 + 4),
    [magnification, dockHeight]
  );
  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(heightRow, spring);

  const handleMouseEnter = () => {
    isHovered.set(1);
    // Cache the static, unmagnified centers of items to break dynamic layout shift feedback loop
    if (panelRef.current) {
      const itemElements = panelRef.current.querySelectorAll('.dock-item');
      itemCoords.current = Array.from(itemElements).map(el => {
        const rect = el.getBoundingClientRect();
        return rect.left + rect.width / 2;
      });
    }
  };

  return (
    <motion.div style={{ height, scrollbarWidth: 'none' }} className="dock-outer">
      <motion.div
        ref={panelRef}
        onMouseEnter={handleMouseEnter}
        onMouseMove={({ clientX }) => {
          isHovered.set(1);
          mouseX.set(clientX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
          itemCoords.current = [];
        }}
        className={`dock-panel ${className}`}
        style={{ height: panelHeight }}
        role="toolbar"
        aria-label="Application dock"
      >
        {items.map((item, index) => (
          <DockItem
            key={index}
            index={index}
            itemCoords={itemCoords}
            onClick={item.onClick}
            className={item.className}
            mouseX={mouseX}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
            label={item.label}
          >
            <DockIcon>{item.icon}</DockIcon>
            <DockLabel>{item.label}</DockLabel>
          </DockItem>
        ))}
      </motion.div>
    </motion.div>
  );
}
