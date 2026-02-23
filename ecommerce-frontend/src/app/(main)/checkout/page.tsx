'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, CreditCard, Plus, Loader2, Truck, ShoppingBag, AlertTriangle } from 'lucide-react';
import { addressApi, ordersApi, cartApi } from '@/lib/api';
import type { Address } from '@/types';
import { CartResponse } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/api-helpers';
import { extractErrorMessage } from '@/lib/api-helpers';
import Loading from '@/components/ui/loading';
import toast from 'react-hot-toast';

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

  // New address form
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
  }, [isAuthenticated]);

  /**
   * Sync le panier local vers le backend, puis charge les données
   */
  const syncAndLoad = async () => {
    setLoading(true);
    setSyncing(true);
    try {
      // 1. Si on a des articles locaux, les pousser vers le backend
      if (localItems.length > 0) {
        // Vider le panier backend d'abord pour éviter les doublons
        try { await cartApi.clear(); } catch { /* ignore */ }

        // Ajouter chaque article local au backend
        for (const item of localItems) {
          try {
            await cartApi.addItem({
              product_id: item.id,
              quantity: item.quantity,
            });
          } catch {
            // Si un produit n'est plus disponible, on continue
          }
        }
      }
      setSyncing(false);

      // 2. Charger les données
      const [addressesData, cartData] = await Promise.all([
        addressApi.getAll(),
        cartApi.get(),
      ]);
      setAddresses(addressesData);
      setCart(cartData);

      // Sélectionner l'adresse par défaut
      const defaultAddr = addressesData.find((a) => a.is_default);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      else if (addressesData.length > 0) setSelectedAddressId(addressesData[0].id);

      // Si le panier est vraiment vide
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
      const addr = await addressApi.create({
        ...newAddress,
        is_default: addresses.length === 0,
      });
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

  if (loading) return <Loading fullPage text={syncing ? "Synchronisation du panier..." : "Chargement..."} />;

  const cartItems = cart?.items || [];
  const subtotal = cart?.total || localItems.reduce((t, i) => t + Number(i.price) * i.quantity, 0);
  const shipping = subtotal >= 50000 ? 0 : 2000;
  const discount = couponDiscount?.discount || 0;
  const total = subtotal + shipping - discount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Finaliser la commande</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Addresses */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Adresse de livraison
              </h2>
              <button onClick={() => setShowNewAddress(!showNewAddress)} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                <Plus className="h-4 w-4" /> Nouvelle adresse
              </button>
            </div>

            {showNewAddress && (
              <form onSubmit={handleCreateAddress} className="border rounded-lg p-4 mb-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input required value={newAddress.full_name} onChange={(e) => setNewAddress({...newAddress, full_name: e.target.value})} placeholder="Nom complet *" className="border border-gray-300 rounded-lg px-3 py-2" />
                  <input required value={newAddress.phone} onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})} placeholder="Téléphone *" className="border border-gray-300 rounded-lg px-3 py-2" />
                  <input required value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} placeholder="Ville *" className="border border-gray-300 rounded-lg px-3 py-2" />
                  <input required value={newAddress.quarter} onChange={(e) => setNewAddress({...newAddress, quarter: e.target.value})} placeholder="Quartier *" className="border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <input required value={newAddress.street_address} onChange={(e) => setNewAddress({...newAddress, street_address: e.target.value})} placeholder="Adresse complète *" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                <input value={newAddress.landmark} onChange={(e) => setNewAddress({...newAddress, landmark: e.target.value})} placeholder="Point de repère" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Enregistrer</button>
                  <button type="button" onClick={() => setShowNewAddress(false)} className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50">Annuler</button>
                </div>
              </form>
            )}

            {addresses.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucune adresse enregistrée. Créez-en une ci-dessus.</p>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{addr.full_name} - {addr.phone}</p>
                      <p className="text-sm text-gray-600">{addr.street_address}, {addr.quarter}, {addr.city}</p>
                      {addr.landmark && <p className="text-xs text-gray-400">Repère: {addr.landmark}</p>}
                      {addr.is_default && <span className="text-xs text-blue-600 font-medium">Par défaut</span>}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Payment method */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Méthode de paiement
            </h2>
            <div className="space-y-3">
              {[
                { value: 'cash_on_delivery', label: 'Paiement à la livraison', desc: 'Payez en espèces à la réception' },
                { value: 'mobile_money', label: 'Mobile Money', desc: 'MTN, Moov Money' },
                { value: 'card', label: 'Carte bancaire', desc: 'Visa, Mastercard' },
              ].map((method) => (
                <label
                  key={method.value}
                  className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${paymentMethod === method.value ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{method.label}</p>
                    <p className="text-sm text-gray-500">{method.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Notes (optionnel)</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              rows={3}
              placeholder="Instructions spéciales pour la livraison..."
              maxLength={500}
            />
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-xl shadow-sm p-6 h-fit sticky top-24">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-blue-600" />
            Résumé
          </h2>

          {/* Cart items */}
          <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div key={item.item_id} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate flex-1">{item.product_name} × {item.quantity}</span>
                  <span className="font-medium ml-2">{formatPrice(item.subtotal)}</span>
                </div>
              ))
            ) : (
              localItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate flex-1">{item.name} × {item.quantity}</span>
                  <span className="font-medium ml-2">{formatPrice(Number(item.price) * item.quantity)}</span>
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
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <button onClick={handleApplyCoupon} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">
              Appliquer
            </button>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span className="flex items-center gap-1"><Truck className="h-4 w-4" /> Livraison</span>
              <span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'Gratuite' : formatPrice(shipping)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Réduction</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <hr />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-blue-600">{formatPrice(total)}</span>
            </div>
          </div>

          {shipping > 0 && (
            <p className="text-xs text-gray-400 mb-4">Livraison gratuite à partir de {formatPrice(50000)}</p>
          )}

          <button
            onClick={handleSubmitOrder}
            disabled={submitting || !selectedAddressId}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Traitement...</>
            ) : (
              'Confirmer la commande'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
