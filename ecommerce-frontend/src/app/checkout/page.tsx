'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, CreditCard, Plus, Loader2, Truck, ShoppingBag, CheckCircle, Smartphone, Banknote, X } from 'lucide-react';
import { addressApi, ordersApi, cartApi } from '@/lib/api';
import type { Address } from '@/types';
import { CartResponse } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/api-helpers';
import { extractErrorMessage } from '@/lib/api-helpers';
import Loading from '@/components/ui/loading';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  {
    value: 'cash_on_delivery',
    label: 'Paiement à la livraison',
    desc: 'Payez en espèces à la réception',
    icon: Banknote,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    value: 'mobile_money',
    label: 'Mobile Money',
    desc: 'MTN MoMo & Moov Money',
    icon: Smartphone,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    value: 'card',
    label: 'Carte bancaire',
    desc: 'Visa, Mastercard',
    icon: CreditCard,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { clearCart, items: localItems } = useCartStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [couponCode, setCouponCode] = useState('');
  const [notes, setNotes] = useState('');
  const [couponDiscount, setCouponDiscount] = useState<{ discount: number; total_after_discount: number } | null>(null);

  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: '',
    phone: '',
    city: '',
    quarter: '',
    street_address: '',
    landmark: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }
    syncAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const syncAndLoad = async () => {
    setLoading(true);
    setSyncing(true);
    try {
      if (localItems.length > 0) {
        try { await cartApi.clear(); } catch { /* ignore */ }
        for (const item of localItems) {
          try {
            await cartApi.addItem({ product_id: item.id, quantity: item.quantity });
          } catch { /* continue */ }
        }
      }
      setSyncing(false);

      const [addressesData, cartData] = await Promise.all([
        addressApi.getAll(),
        cartApi.get(),
      ]);
      setAddresses(addressesData);
      setCart(cartData);

      const defaultAddr = addressesData.find((a) => a.is_default);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      else if (addressesData.length > 0) setSelectedAddressId(addressesData[0].id);

      if (!cartData?.items?.length) {
        toast.error('Votre panier est vide');
        router.push('/cart');
      }
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const addr = await addressApi.create({ ...newAddress, is_default: addresses.length === 0 });
      setAddresses((prev) => [...prev, addr]);
      setSelectedAddressId(addr.id);
      setShowNewAddress(false);
      setNewAddress({ full_name: '', phone: '', city: '', quarter: '', street_address: '', landmark: '' });
      toast.success('Adresse ajoutée');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const result = await ordersApi.applyCoupon(couponCode);
      setCouponDiscount({ discount: result.discount, total_after_discount: result.total_after_discount });
      toast.success('Coupon appliqué !');
    } catch (error) {
      toast.error(extractErrorMessage(error));
      setCouponDiscount(null);
    }
  };

  const handleSubmitOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Veuillez sélectionner une adresse de livraison');
      return;
    }
    setSubmitting(true);
    try {
      const result = await ordersApi.create({
        address_id: selectedAddressId,
        payment_method: paymentMethod,
        coupon_code: couponCode || undefined,
        notes: notes || undefined,
      });
      clearCart();
      toast.success('Commande créée avec succès !');
      router.push(`/orders/${result.data.id}`);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading fullPage text={syncing ? 'Synchronisation du panier...' : 'Chargement...'} />;

  const cartItems = cart?.items || [];
  const subtotal = cart?.total || localItems.reduce((t, i) => t + Number(i.price) * i.quantity, 0);
  const shipping = subtotal >= 50000 ? 0 : 2000;
  const discount = couponDiscount?.discount || 0;
  const total = subtotal + shipping - discount;

  const inputCls = 'w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 bg-white transition';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Finaliser la commande</h1>
        <p className="text-slate-500 text-sm mt-1">Vérifiez vos informations avant de confirmer</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">

          {/* Delivery address */}
          <section className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</div>
                Adresse de livraison
              </h2>
              <button
                onClick={() => setShowNewAddress(!showNewAddress)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition"
              >
                {showNewAddress ? <><X className="h-3.5 w-3.5" /> Annuler</> : <><Plus className="h-3.5 w-3.5" /> Nouvelle adresse</>}
              </button>
            </div>

            {showNewAddress && (
              <form onSubmit={handleCreateAddress} className="border-2 border-blue-100 bg-blue-50/40 rounded-xl p-5 mb-5 space-y-3">
                <p className="text-sm font-semibold text-slate-700 mb-1">Nouvelle adresse</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input required value={newAddress.full_name} onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })} placeholder="Nom complet *" className={inputCls} />
                  <input required value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} placeholder="Téléphone *" className={inputCls} />
                  <input required value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} placeholder="Ville *" className={inputCls} />
                  <input required value={newAddress.quarter} onChange={(e) => setNewAddress({ ...newAddress, quarter: e.target.value })} placeholder="Quartier *" className={inputCls} />
                </div>
                <input required value={newAddress.street_address} onChange={(e) => setNewAddress({ ...newAddress, street_address: e.target.value })} placeholder="Adresse complète *" className={inputCls} />
                <input value={newAddress.landmark} onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })} placeholder="Point de repère (optionnel)" className={inputCls} />
                <div className="flex gap-2 pt-1">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition">Enregistrer</button>
                  <button type="button" onClick={() => setShowNewAddress(false)} className="px-5 py-2.5 rounded-xl text-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition">Annuler</button>
                </div>
              </form>
            )}

            {addresses.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">Aucune adresse enregistrée. Créez-en une ci-dessus.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-3.5 p-4 rounded-xl border-2 cursor-pointer transition ${
                      selectedAddressId === addr.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input type="radio" name="address" checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} className="mt-1 accent-blue-600" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm">{addr.full_name} · {addr.phone}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{addr.street_address}, {addr.quarter}, {addr.city}</p>
                      {addr.landmark && <p className="text-xs text-slate-400 mt-0.5">Repère : {addr.landmark}</p>}
                      {addr.is_default && <span className="inline-block text-xs text-blue-600 font-semibold mt-1">Par défaut</span>}
                    </div>
                    {selectedAddressId === addr.id && <CheckCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />}
                  </label>
                ))}
              </div>
            )}
          </section>

          {/* Payment method */}
          <section className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-5">
              <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</div>
              Méthode de paiement
            </h2>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                return (
                  <label
                    key={method.value}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${
                      paymentMethod === method.value ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input type="radio" name="payment" value={method.value} checked={paymentMethod === method.value} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-blue-600" />
                    <div className={`p-2.5 rounded-xl ${method.bg} shrink-0`}>
                      <Icon className={`h-5 w-5 ${method.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 text-sm">{method.label}</p>
                      <p className="text-xs text-slate-500">{method.desc}</p>
                    </div>
                    {paymentMethod === method.value && <CheckCircle className="h-5 w-5 text-blue-600 shrink-0" />}
                  </label>
                );
              })}
            </div>
          </section>

          {/* Notes */}
          <section className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</div>
              Instructions spéciales (optionnel)
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-600 bg-white transition resize-none"
              rows={3}
              placeholder="Instructions pour la livraison, point de repère supplémentaire..."
              maxLength={500}
            />
            <p className="text-xs text-slate-400 mt-1 text-right">{notes.length}/500</p>
          </section>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 h-fit sticky top-24">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-blue-600" />
            Résumé de commande
          </h2>

          <div className="space-y-2 mb-4 max-h-52 overflow-y-auto pr-1">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div key={item.item_id} className="flex justify-between text-sm py-1">
                  <span className="text-slate-600 truncate flex-1 pr-2">{item.product_name} × {item.quantity}</span>
                  <span className="font-semibold text-slate-800 shrink-0">{formatPrice(item.subtotal)}</span>
                </div>
              ))
            ) : (
              localItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm py-1">
                  <span className="text-slate-600 truncate flex-1 pr-2">{item.name} × {item.quantity}</span>
                  <span className="font-semibold text-slate-800 shrink-0">{formatPrice(Number(item.price) * item.quantity)}</span>
                </div>
              ))
            )}
          </div>

          {/* Coupon */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Code promo"
              className="flex-1 border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-600 transition"
            />
            <button
              onClick={handleApplyCoupon}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition whitespace-nowrap"
            >
              Appliquer
            </button>
          </div>

          <div className="space-y-2.5 mb-4 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Sous-total</span>
              <span className="font-medium text-slate-800">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> Livraison</span>
              <span className={shipping === 0 ? 'text-green-600 font-semibold' : 'font-medium text-slate-800'}>
                {shipping === 0 ? 'Gratuite 🎉' : formatPrice(shipping)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Réduction coupon</span>
                <span className="font-semibold">-{formatPrice(discount)}</span>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 pt-4 mb-5">
            <div className="flex justify-between">
              <span className="font-bold text-slate-900">Total</span>
              <span className="font-bold text-blue-700 text-xl">{formatPrice(total)}</span>
            </div>
          </div>

          {shipping > 0 && (
            <p className="text-xs text-slate-400 mb-4 flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5" />
              Livraison gratuite à partir de {formatPrice(50000)}
            </p>
          )}

          <button
            onClick={handleSubmitOrder}
            disabled={submitting || !selectedAddressId}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {submitting ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Traitement...</>
            ) : (
              'Confirmer la commande'
            )}
          </button>
          <p className="text-xs text-slate-400 text-center mt-3">🔒 Paiement sécurisé</p>
        </div>
      </div>
    </div>
  );
}
