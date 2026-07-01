export function validarCPF(cpf: string): boolean {
  const nums = cpf.replace(/\D/g, "");

  if (nums.length !== 11) return false;

  // Rejeita sequências repetidas (000...000, 111...111, etc.)
  if (/^(\d)\1{10}$/.test(nums)) return false;

  // Primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(nums[i]) * (10 - i);
  let dig1 = (soma * 10) % 11;
  if (dig1 === 10 || dig1 === 11) dig1 = 0;
  if (dig1 !== parseInt(nums[9])) return false;

  // Segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(nums[i]) * (11 - i);
  let dig2 = (soma * 10) % 11;
  if (dig2 === 10 || dig2 === 11) dig2 = 0;
  if (dig2 !== parseInt(nums[10])) return false;

  return true;
}