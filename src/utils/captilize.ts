export const capitalizeFirstLetter = (str: string) => {
    if (!str) return "Unnamed";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};