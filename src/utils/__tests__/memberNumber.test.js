import { generateMemberNumber } from '../memberNumber';

test('genera número con longitud válida por defecto', () => {
  const num = generateMemberNumber();
  expect(num).toMatch(/^\d{6}$/);
});

test('respeta longitud entre 4 y 10', () => {
  for (let d = 4; d <= 10; d++) {
    const num = generateMemberNumber(d);
    expect(num.length).toBe(d);
    expect(/^\d+$/.test(num)).toBe(true);
  }
});

test('corrige longitudes fuera de rango', () => {
  expect(generateMemberNumber(3)).toMatch(/^\d{4}$/);
  expect(generateMemberNumber(11)).toMatch(/^\d{10}$/);
});
