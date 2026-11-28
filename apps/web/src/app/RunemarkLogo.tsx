export function RunemarkLogo({
                                 size = 40,
                             }: {
    readonly size?: number;
}) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            fill="none"
            width={size}
            height={size}
            aria-hidden
        >
            <path
                d="M20 56V10L44 24L20 36L44 56M20 10L44 24"
                stroke="currentColor"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}