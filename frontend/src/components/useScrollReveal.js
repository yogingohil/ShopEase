/**
 * useScrollReveal — attaches IntersectionObserver to add .revealed class
 * to children with .reveal class inside a container ref.
 */
import { useEffect } from "react";

export function useScrollReveal(containerRef, deps = []) {
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const targets = container.querySelectorAll(".reveal");
        if (targets.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("revealed");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );

        targets.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}
