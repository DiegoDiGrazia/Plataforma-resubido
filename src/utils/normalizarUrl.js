export const normaliarAUrl = (titulo) => {
    return titulo
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "") // saca acentos
        .toLowerCase()
        .replace(/[^\w\s-]/g, "") // saca caracteres que no sean palabras (?, !, :, etc)
        .trim()
        .replace(/\s+/g, "-") // espacios por guiones
        .replace(/-+/g, "-"); // colapsa guiones repetidos
};
