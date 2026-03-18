export const normalizarTexto = (str) => {
  return str
    .normalize('NFD') // Separa acentos dos caracteres (ex: 'ã' vira 'a' + '~')
    .replace(/[\u0300-\u036f]/g, '') // Remove os acentos (u0300-u036f)
    .toLowerCase() // Converte para minúsculas
    .replace(/[^a-zA-Z0-9\s]/g, ''); // Remove caracteres especiais
};
