/**
 * Normalize a site name by removing common prefixes
 * This allows users to use tab-completion: cli checkout sites/garage-muller
 * while the actual site name is just: garage-muller
 */
export function normalizeSiteName(input: string): string {
    // Remove leading 'sites/' if present
    if (input.startsWith('sites/')) {
        return input.slice(6);
    }

    // Remove leading './' if present
    if (input.startsWith('./sites/')) {
        return input.slice(8);
    }

    if (input.startsWith('./')) {
        return input.slice(2);
    }

    return input;
}
