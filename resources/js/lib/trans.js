import { usePage } from "@inertiajs/react";

export function useTrans() {
    const { translation } = usePage().props;

    return (group, key) => {
        return translation?.[group]?.[key] ?? key;
    };
}
