/**
 * AnimationContext — Global animation API accessible from any component
 */
import { createContext, useContext, useRef } from "react";
import { useAnimationEngine } from "../components/AnimationEngine";


const AnimationCtx = createContext(null);

export function AnimationProvider({ children }) {
    const canvasRef = useRef(null);
    const api = useAnimationEngine(canvasRef);

    return (
        <AnimationCtx.Provider value={api}>
            {/* Global full-screen canvas overlay (pointer-events:none so it doesn't block clicks) */}
            <canvas
                ref={canvasRef}
                style={{
                    position: "fixed",
                    inset: 0,
                    width: "100vw",
                    height: "100vh",
                    pointerEvents: "none",
                    zIndex: 9999,
                }}
            />
            {children}
        </AnimationCtx.Provider>
    );
}

export function useAnim() {
    return useContext(AnimationCtx);
}
