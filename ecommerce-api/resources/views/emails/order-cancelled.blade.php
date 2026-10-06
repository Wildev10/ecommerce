<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Commande annulée</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
        .container { max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 8px; }
        .header { text-align: center; color: #dc2626; }
        .footer { margin-top: 30px; text-align: center; color: #999; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="header">Commande annulée ❌</h1>
        <p>Bonjour {{ $order->user->name }},</p>
        <p>Votre commande <strong>#{{ $order->order_number }}</strong> a été annulée.</p>
        <p><strong>Total :</strong> {{ number_format($order->total, 0, ',', ' ') }} FCFA</p>
        <p>Si un paiement avait été effectué, un remboursement sera traité dans les prochains jours.</p>
        <p>Nous restons à votre disposition pour toute question.</p>

        <div class="footer">
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>
