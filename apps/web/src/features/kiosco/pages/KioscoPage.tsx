import { useMemo, useState } from 'react';
import { Minus, Plus, Search, ShoppingCart } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

const products = [
  { code: 'SKU-0012', name: 'Cuaderno A4', category: 'Útiles', price: 8.5, stock: 42 },
  { code: 'SKU-0041', name: 'Lapicero azul', category: 'Útiles', price: 1.5, stock: 8 },
  { code: 'SKU-0088', name: 'USB 32 GB', category: 'Tecnología', price: 28, stock: 16 },
  { code: 'SKU-0104', name: 'Folder manila', category: 'Oficina', price: 2.5, stock: 26 },
];

export function KioscoPage() {
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const visibleProducts = products.filter((product) => `${product.name} ${product.code} ${product.category}`.toLowerCase().includes(query.toLowerCase()));
  const total = useMemo(() => products.reduce((sum, product) => sum + product.price * (cart[product.code] ?? 0), 0), [cart]);
  const updateCart = (code: string, amount: number) => setCart((current) => ({ ...current, [code]: Math.max(0, (current[code] ?? 0) + amount) }));
  return <><div className="page-heading"><div><p className="eyebrow">BCE SYSTEM · KIOSCO</p><h1>Kiosco</h1><p className="muted">Busca productos, revisa stock y prepara una venta.</p></div><Button><ShoppingCart size={17} /> Registrar venta</Button></div><div className="kiosk-layout"><section className="panel"><div className="toolbar"><label className="search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, código o categoría..." /></label><select><option>Todas las categorías</option><option>Útiles</option><option>Oficina</option><option>Tecnología</option></select></div><div className="product-grid">{visibleProducts.map((product) => <article className="product-card" key={product.code}><div className="product-picture"><ShoppingCart size={23} /></div><small>{product.code}</small><h3>{product.name}</h3><span>{product.category}</span><strong>S/ {product.price.toFixed(2)}</strong><div className="product-footer"><em className={product.stock < 10 ? 'low-stock' : ''}>{product.stock < 10 ? 'Stock bajo' : `${product.stock} disponibles`}</em><button className="add-product" onClick={() => updateCart(product.code, 1)}><Plus size={15} /></button></div></article>)}</div></section><aside className="panel cart-panel"><div className="panel-header"><div><h2>Venta actual</h2><p className="muted">{Object.values(cart).reduce((sum, quantity) => sum + quantity, 0)} productos</p></div><ShoppingCart size={19} className="subtle-icon" /></div>{products.filter((product) => cart[product.code]).map((product) => <div className="cart-row" key={product.code}><div><strong>{product.name}</strong><small>S/ {product.price.toFixed(2)} c/u</small></div><div className="quantity"><button onClick={() => updateCart(product.code, -1)} aria-label="Reducir cantidad"><Minus size={13} /></button><span>{cart[product.code]}</span><button onClick={() => updateCart(product.code, 1)} aria-label="Aumentar cantidad"><Plus size={13} /></button></div></div>)}{total === 0 && <div className="cart-empty">Selecciona productos para preparar la venta.</div>}<div className="cart-total"><span>Total</span><strong>S/ {total.toFixed(2)}</strong></div><Button disabled={total === 0}>Continuar al pago</Button></aside></div></>;
}
