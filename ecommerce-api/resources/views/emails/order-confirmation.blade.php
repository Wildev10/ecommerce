<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Confirmation de commande</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
        .container { max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 8px; }
        .header { text-align: center; color: #333; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #f8f8f8; }
        .total { font-size: 18px; font-weight: bold; color: #4F46E5; }
        .footer { margin-top: 30px; text-align: center; color: #999; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="header">Commande confirmée ✅</h1>
        <p>Bonjour {{ $order->user->name }},</p>
        <p>Votre commande <strong>#{{ $order->order_number }}</strong> a bien été enregistrée.</p>

        <table>
            <thead>
                <tr>
                    <th>Produit</th>
                    <th>Qté</th>
                    <th>Prix</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $item)
                <tr>
                    <td>{{ $item->product_name }}</td>
                    <td>{{ $item->quantity }}</td>
                    <td>{{ number_format($item->total, 0, ',', ' ') }} FCFA</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <p>Sous-total : {{ number_format($order->subtotal, 0, ',', ' ') }} FCFA</p>
        @if($order->discount > 0)
        <p>Remise : -{{ number_format($order->discount, 0, ',', ' ') }} FCFA</p>
        @endif
        <p>Livraison : {{ number_format($order->shipping_fee, 0, ',', ' ') }} FCFA</p>
        <p class="total">Total : {{ number_format($order->total, 0, ',', ' ') }} FCFA</p>

        <p>Mode de paiement : <strong>{{ $order->payment_method }}</strong></p>

        <div class="footer">
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>
