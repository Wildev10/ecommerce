import { AxiosError } from 'axios';

/**
 * Extraire le message d'erreur d'une réponse API
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    // Message du backend
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    // Erreurs de validation (422)
    if (error.response?.data?.errors) {
      const firstError = Object.values(error.response.data.errors)[0];
      if (Array.isArray(firstError) && firstError.length > 0) {
        return firstError[0] as string;
      }
    }

    // Erreurs HTTP standard
    switch (error.response?.status) {
      case 401:
        return 'Session expirée. Veuillez vous reconnecter.';
      case 403:
        return 'Accès non autorisé.';
      case 404:
        return 'Ressource introuvable.';
      case 429:
        return 'Trop de requêtes. Veuillez patienter.';
      case 500:
        return 'Erreur serveur. Veuillez réessayer.';
      default:
        return 'Une erreur est survenue.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Une erreur inattendue est survenue.';
}

/**
 * Formater un prix en FCFA
 */
export function formatPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numPrice);
}

/**
 * Retourne l'URL de l'image produit : l'image uploadée si elle existe,
 * sinon une photo loremflickr correspondant réellement au produit.
 */
export function getProductImage(name: string, imageUrl?: string | null): string {
  if (imageUrl) return imageUrl;
  const keyword = extractProductKeyword(name);
  return `https://loremflickr.com/400/400/${keyword}`;
}

function extractProductKeyword(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('iphone') || (n.includes('apple') && n.includes('phone'))) return 'iphone,apple';
  if (n.includes('samsung') && (n.includes('galaxy') || n.includes('phone'))) return 'samsung,galaxy,phone';
  if (n.includes('samsung')) return 'samsung,electronics';
  if (n.includes('xiaomi') || n.includes('redmi') || n.includes('poco')) return 'xiaomi,smartphone';
  if (n.includes('huawei')) return 'huawei,phone';
  if (n.includes('oppo')) return 'oppo,smartphone';
  if (n.includes('infinix') || n.includes('tecno') || n.includes('itel')) return 'smartphone,android';
  if (n.includes('macbook') || n.includes('imac')) return 'macbook,apple,laptop';
  if (n.includes('ipad')) return 'ipad,apple,tablet';
  if (n.includes('airpod') || n.includes('airpods')) return 'airpods,apple,earbuds';
  if (n.includes('dell')) return 'dell,laptop';
  if (n.includes('lenovo')) return 'lenovo,laptop';
  if (n.includes('asus')) return 'asus,laptop';
  if (n.includes('hp ') || n.includes('hewlett')) return 'hp,laptop';
  if (n.includes('acer')) return 'acer,laptop';
  if (n.includes('laptop') || n.includes('ordinateur') || n.includes('notebook')) return 'laptop,computer';
  if (n.includes('tablet') || n.includes('tablette')) return 'tablet,screen';
  if (n.includes('écouteur') || n.includes('headphone') || n.includes('earphone') || n.includes('casque')) return 'headphones,music';
  if (n.includes('montre') || n.includes('watch')) return 'smartwatch,watch';
  if (n.includes('télé') || n.includes('tv ') || n.includes('television')) return 'television,screen';
  if (n.includes('camera') || n.includes('appareil photo')) return 'camera,photography';
  if (n.includes('nike')) return 'nike,shoes,sport';
  if (n.includes('adidas')) return 'adidas,shoes,sport';
  if (n.includes('puma')) return 'puma,shoes,sport';
  if (n.includes('smartphone') || n.includes('phone') || n.includes('mobile')) return 'smartphone,phone';
  // Fallback : les 2 premiers mots
  return name.split(' ').slice(0, 2).join(',').toLowerCase().replace(/[^a-z,]/g, '');
}

/**
 * Formater une date
 */
export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * Labels des statuts de commande
 */
export const orderStatusLabels: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  processing: 'En préparation',
  shipped: 'Expédiée',
  delivering: 'En livraison',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
};

/**
 * Couleurs des statuts de commande
 */
export const orderStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivering: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

/**
 * Couleurs des statuts de paiement
 */
export const paymentStatusColors: Record<string, string> = {
  unpaid: 'bg-yellow-100 text-yellow-800',
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};
