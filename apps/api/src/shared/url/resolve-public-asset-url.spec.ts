import { resolvePublicAssetUrl } from './resolve-public-asset-url';

describe('resolvePublicAssetUrl', () => {
  it('prefija rutas relativas que empiezan por /', () => {
    expect(resolvePublicAssetUrl('http://localhost:3000', '/uploads/a.jpg')).toBe(
      'http://localhost:3000/uploads/a.jpg',
    );
  });

  it('normaliza base con barra final', () => {
    expect(resolvePublicAssetUrl('http://localhost:3000/', '/x')).toBe('http://localhost:3000/x');
  });

  it('añade / si el path no lo tiene', () => {
    expect(resolvePublicAssetUrl('https://api.example.com', 'uploads/a.jpg')).toBe(
      'https://api.example.com/uploads/a.jpg',
    );
  });

  it('no altera URLs ya absolutas', () => {
    expect(resolvePublicAssetUrl('http://localhost:3000', 'https://picsum.photos/x')).toBe(
      'https://picsum.photos/x',
    );
    expect(resolvePublicAssetUrl('http://localhost:3000', 'HTTP://OTHER/x')).toBe('HTTP://OTHER/x');
  });
});
