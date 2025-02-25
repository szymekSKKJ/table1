"use client";
import styles from "./styles.module.scss";
import { useRef, useEffect } from "react";
import React from "react";

const ClickEffect = () => {
  const componentElementRef = useRef<null | HTMLDivElement>(null);
  const timeoutRef = useRef<null | ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (componentElementRef.current) {
      const parentElement = componentElementRef.current.parentElement! as HTMLElement;

      parentElement.style.position = "relative";
      parentElement.style.overflow = "hidden";

      const click = (event: MouseEvent) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        componentElementRef.current!.classList.remove(styles.click);

        const thisElement = event.currentTarget as HTMLElement;
        const { clientX, clientY } = event;
        const { x, y } = thisElement.getBoundingClientRect();

        componentElementRef.current!.style.top = `${clientY - y}px`;
        componentElementRef.current!.style.left = `${clientX - x}px`;
        componentElementRef.current!.classList.add(styles.click);

        timeoutRef.current = setTimeout(() => {
          componentElementRef.current?.classList.remove(styles.click);
        }, 500); // Animation time
      };

      parentElement.addEventListener("click", click);

      return () => {
        parentElement.removeEventListener("click", click);
      };
    }
  }, []);

  return <span className={`${styles.clickEffect}`} ref={componentElementRef}></span>;
};

export default ClickEffect;
