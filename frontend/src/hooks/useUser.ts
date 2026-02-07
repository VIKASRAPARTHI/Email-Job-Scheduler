import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
}

export function useUser() {
    const userStr = useSyncExternalStore(
        subscribe,
        () => localStorage.getItem("user"),
        () => null
    );

    const user: { name: string; email: string; picture: string } | null = userStr
        ? JSON.parse(userStr)
        : null;

    return {
        user, logout: () => {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
    };
}
